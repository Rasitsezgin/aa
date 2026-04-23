// PWA Utilities
// Helper functions for Progressive Web App features

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// PWA Installation
export class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private listeners: Set<(canInstall: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', this.handleAppInstalled);
    }
  }

  private handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    this.deferredPrompt = e as BeforeInstallPromptEvent;
    this.notifyListeners(true);
  };

  private handleAppInstalled = () => {
    this.deferredPrompt = null;
    this.notifyListeners(false);
    console.log('PWA was installed');
  };

  private notifyListeners(canInstall: boolean) {
    this.listeners.forEach(listener => listener(canInstall));
  }

  // Check if app can be installed
  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  // Show install prompt
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.deferredPrompt = null;
    this.notifyListeners(false);
    
    return outcome === 'accepted';
  }

  // Subscribe to install availability changes
  onInstallabilityChange(callback: (canInstall: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Check if app is running as installed PWA
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  // Get install instructions based on platform
  getInstallInstructions(): string {
    const ua = navigator.userAgent;
    
    if (/iPad|iPhone|iPod/.test(ua)) {
      return 'Tap the share button and then "Add to Home Screen"';
    } else if (/Android/.test(ua)) {
      return 'Tap the menu button and then "Add to Home Screen" or "Install"';
    } else if (/Chrome/.test(ua)) {
      return 'Click the install icon in the address bar or menu';
    } else {
      return 'Check your browser menu for "Install" or "Add to Home Screen"';
    }
  }
}

// Service Worker Registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'imports',
    });

    console.log('Service Worker registered:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          showUpdateNotification(newWorker);
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Show update notification
function showUpdateNotification(worker: ServiceWorker): void {
  // Dispatch custom event for React to handle
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: { worker },
  }));
}

// Update service worker
export async function updateServiceWorker(worker: ServiceWorker): Promise<void> {
  worker.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

// Background Sync
export async function requestBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  
  if ('sync' in registration) {
    try {
      await (registration as any).sync.register(tag);
      console.log('Background sync registered:', tag);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Push Notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPushNotifications(
  publicVapidKey: string
): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

// Cache management
export async function addUrlsToCache(urls: string[]): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const sw = registration.active;
  
  if (sw) {
    sw.postMessage({
      type: 'CACHE_URLS',
      payload: { urls },
    });
  }
}

export async function clearApplicationCache(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const sw = registration.active;
  
  if (sw) {
    sw.postMessage({ type: 'CLEAR_CACHE' });
  }

  // Also clear caches directly
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

// Network status
export class NetworkStatusManager {
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyListeners(true));
      window.addEventListener('offline', () => this.notifyListeners(false));
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.isOnline()); // Initial status
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline));
  }
}

// Storage estimation
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return { usage: 0, quota: 0, percentUsed: 0 };
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;

  return {
    usage,
    quota,
    percentUsed: quota > 0 ? (usage / quota) * 100 : 0,
  };
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// React hooks for PWA
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const installManager = useMemo(() => new PWAInstallManager(), []);

  useEffect(() => {
    setIsStandalone(installManager.isStandalone());
    
    const unsubscribe = installManager.onInstallabilityChange(setCanInstall);
    return unsubscribe;
  }, [installManager]);

  return {
    canInstall,
    isStandalone,
    promptInstall: () => installManager.promptInstall(),
    instructions: installManager.getInstallInstructions(),
  };
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const manager = useMemo(() => new NetworkStatusManager(), []);

  useEffect(() => {
    return manager.onStatusChange(setIsOnline);
  }, [manager]);

  return { isOnline };
}

// Import React for hooks
import { useState, useEffect, useMemo } from 'react';

export {
  BeforeInstallPromptEvent,
  PWAInstallManager,
  NetworkStatusManager,
};

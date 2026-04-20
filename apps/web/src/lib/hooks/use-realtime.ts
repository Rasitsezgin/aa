"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface RealtimeStatus {
  onlineCount: number;
  recentlyActive: Array<{
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastActivity: string;
  }>;
  activeTopics: Array<{
    id: string;
    title: string;
    slug: string;
    lastActivity: string;
  }>;
}

interface RealtimeActivity {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  topic: {
    id: string;
    title: string;
    slug: string;
  } | null;
  createdAt: string;
}

interface UseRealtimeOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

export function useRealtimeStatus(options: UseRealtimeOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options;
  const [status, setStatus] = useState<RealtimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/community/realtime?type=status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchStatus, refreshInterval]);

  return { status, loading, error, refetch: fetchStatus };
}

export function useRealtimeActivities(options: UseRealtimeOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [activities, setActivities] = useState<RealtimeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/community/realtime?type=activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Activities fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchActivities();
    intervalRef.current = setInterval(fetchActivities, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchActivities, refreshInterval]);

  return { activities, loading, refetch: fetchActivities };
}

// Heartbeat - kullanıcı online durumunu koruma
export function useHeartbeat(interval: number = 60000) {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/community/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'heartbeat' }),
        });
      } catch (err) {
        // Silent fail
      }
    };

    // İlk heartbeat
    sendHeartbeat();
    
    // Periyodik heartbeat
    const intervalId = setInterval(sendHeartbeat, interval);

    return () => clearInterval(intervalId);
  }, [interval]);
}

// Typing indicator
export function useTypingIndicator(topicId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTyping = useCallback(async () => {
    try {
      await fetch('/api/community/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'typing', topicId }),
      });
    } catch (err) {
      // Silent fail
    }
  }, [topicId]);

  const startTyping = useCallback(() => {
    sendTyping();
    
    // Debounce typing notifications
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing after 3 seconds of inactivity
    }, 3000);
  }, [sendTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { typingUsers, startTyping };
}

// Notification hook
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto remove after 5 seconds for toast notifications
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

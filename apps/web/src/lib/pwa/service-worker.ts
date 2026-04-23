// PWA Service Worker
// Offline-first functionality with intelligent caching

const CACHE_NAME = 'pazaryonetimi-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes that should be cached with network-first strategy
const API_ROUTES = [
  '/api/products',
  '/api/orders',
  '/api/customers',
  '/api/analytics/summary',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => (self as any).skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => !name.includes('v1'))
          .map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => (self as any).clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip third-party requests (except images)
  if (url.origin !== self.location.origin && !isImageRequest(request)) {
    return;
  }

  // Strategy selection based on request type
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
  } else if (isImageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  } else {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
  }
});

// Cache First strategy - for static assets
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Network First with Cache Fallback - for API requests
async function networkFirstWithCache(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Update cache with fresh data
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request);
    
    if (cached) {
      // Return cached data with header indicating it's stale
      const staleResponse = new Response(cached.body, {
        status: 200,
        statusText: 'OK (from cache)',
        headers: {
          ...Object.fromEntries(cached.headers.entries()),
          'X-From-Cache': 'true',
        },
      });
      return staleResponse;
    }

    // Return offline data for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'No cached data available',
        cached: false,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Stale While Revalidate - for images
async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Return cached version immediately
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  // If we have a cached response, return it while revalidating
  if (cached) {
    // Trigger background revalidation
    fetchPromise.then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    });
    return cached;
  }

  // No cache, wait for network
  return fetchPromise;
}

// Background sync for offline mutations
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'sync-products') {
    event.waitUntil(syncProducts());
  }
});

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const options: NotificationOptions = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.payload || {},
  };

  event.waitUntil(
    (self as any).registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/dashboard';

  if (data.orderId) {
    url = `/orders/${data.orderId}`;
  } else if (data.productId) {
    url = `/products/${data.productId}`;
  }

  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window' }).then((clients: WindowClient[]) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(url);
      }
    })
  );
});

// Message handler from main thread
self.addEventListener('message', (event: MessageEvent) => {
  if (event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  } else if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.payload.urls));
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearCache());
  }
});

// Helper functions
function isStaticAsset(request: Request): boolean {
  const url = new URL(request.url);
  return STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.match(/\.(js|css|html|json|woff2?)$/);
}

function isAPIRequest(request: Request): boolean {
  const url = new URL(request.url);
  return API_ROUTES.some(route => url.pathname.startsWith(route)) ||
    url.pathname.startsWith('/api/');
}

function isImageRequest(request: Request): boolean {
  return request.destination === 'image' ||
    request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

async function cacheUrls(urls: string[]): Promise<void> {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = urls.map(url => new Request(url));
  const responses = await Promise.all(
    requests.map(req => fetch(req).catch(() => null))
  );
  
  await Promise.all(
    responses
      .filter((res): res is Response => res !== null && res.ok)
      .map((res, i) => cache.put(requests[i], res))
  );
}

async function clearCache(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

// Sync functions
async function syncOrders(): Promise<void> {
  // Get pending orders from IndexedDB
  const pendingOrders = await getPendingOrdersFromIndexedDB();
  
  for (const order of pendingOrders) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      // Remove from queue on success
      await removePendingOrder(order.id);
    } catch (error) {
      console.error('Failed to sync order:', error);
    }
  }
}

async function syncProducts(): Promise<void> {
  // Similar implementation for products
  console.log('Syncing products...');
}

// Placeholder IndexedDB functions (would be implemented with idb package)
async function getPendingOrdersFromIndexedDB(): Promise<any[]> {
  // Would fetch from IndexedDB
  return [];
}

async function removePendingOrder(id: string): Promise<void> {
  // Would remove from IndexedDB
  console.log('Removing order from queue:', id);
}

// Periodic sync for background updates (if supported)
if ('periodicSync' in (self as any).registration) {
  (self as any).registration.periodicSync.register('update-data', {
    minInterval: 24 * 60 * 60 * 1000, // 24 hours
  }).catch((err: Error) => {
    console.log('Periodic Sync could not be registered:', err);
  });
}

// Export for TypeScript
export {};

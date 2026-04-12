const CACHE_VERSION = 'v2';
const STATIC_CACHE = `pazaryonetimi-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pazaryonetimi-dynamic-${CACHE_VERSION}`;
const ICON_CACHE = `pazaryonetimi-icons-${CACHE_VERSION}`;

// Önbelleğe alınacak statik dosyalar
const STATIC_ASSETS = [
  '/dashboard',
  '/manifest.webmanifest',
];

// PWA ikonlarını önbelleğe al
const ICON_ASSETS = [
  '/api/pwa-icon?size=192',
  '/api/pwa-icon?size=512',
  '/api/pwa-icon?size=192&maskable=true',
  '/api/pwa-icon?size=512&maskable=true',
];

// Cache'lenmeyecek URL'ler
const SKIP_CACHE_PATTERNS = [
  /\/_next\/webpack-hmr/,
  /\/api\/auth/,
  /\/api\/pwa-settings/,
  /chrome-extension/,
  /localhost.*sockjs/,
];

// Service Worker Kurulumu
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker', CACHE_VERSION);

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.log('[SW] Some static assets failed to cache:', err);
        });
      }),
      caches.open(ICON_CACHE).then((cache) => {
        return cache.addAll(ICON_ASSETS).catch((err) => {
          console.log('[SW] Some icon assets failed to cache:', err);
        });
      }),
    ])
  );

  self.skipWaiting();
});

// Aktivasyon
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== ICON_CACHE
            );
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

// Fetch İstekleri
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cache for certain patterns
  if (SKIP_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) return;

  // PWA icon istekleri - Cache-First (uzun süre cache)
  if (url.pathname === '/api/pwa-icon') {
    event.respondWith(cacheFirst(request, ICON_CACHE));
    return;
  }

  // API istekleri için Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Manifest için Network-First
  if (url.pathname === '/manifest.webmanifest') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Statik dosyalar için Cache-First
  if (
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML sayfaları için Stale-While-Revalidate
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Diğer istekler
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      // Return a basic offline response or 404
      return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    })
  );
});

// Cache-First Stratejisi
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName || STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Network-First Stratejisi
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale-While-Revalidate Stratejisi
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      return (
        cached ||
        new Response(offlineHTML(), {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      );
    });

  return cached || fetchPromise;
}

// Offline HTML sayfası
function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Çevrimdışı - PazarYonetimi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .container { text-align: center; max-width: 400px; }
    .icon { width: 80px; height: 80px; background: linear-gradient(135deg, #2563eb, #1e40af); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .icon span { color: white; font-size: 32px; font-weight: 900; }
    h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
    p { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    button { background: #2563eb; color: white; border: none; padding: 12px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon"><span>PZ</span></div>
    <h1>Çevrimdışısınız</h1>
    <p>İnternet bağlantınız kesilmiş görünüyor. Bağlantınızı kontrol edip tekrar deneyin.</p>
    <button onclick="location.reload()">Tekrar Dene</button>
  </div>
</body>
</html>`;
}

// Push Notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/api/pwa-icon?size=192',
    badge: '/api/pwa-icon?size=72',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'open', title: 'Aç' },
      { action: 'dismiss', title: 'Kapat' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'PazarYonetimi', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }

  if (event.tag === 'sync-inventory') {
    event.waitUntil(syncInventory());
  }
});

async function syncOrders() {
  console.log('[SW] Syncing orders...');
}

async function syncInventory() {
  console.log('[SW] Syncing inventory...');
}

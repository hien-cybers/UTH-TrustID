// public/sw.js - PWA Service Worker dành riêng cho App Sinh Viên (Port 5173)
// TUYỆT ĐỐI KHÔNG can thiệp vào Cổng Web Giảng Viên & Admin (Port 5174)
const CACHE_NAME = 'uth-trustid-student-v3';
const STATIC_ASSETS = [
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

self.addEventListener('install', (event) => {
  if (self.location.port === '5174') {
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME || self.location.port === '5174') return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Không bao giờ chặn request của Cổng Web Giảng Viên & Admin (Port 5174)
  if (self.location.port === '5174' || event.request.url.includes(':5174') || event.request.url.includes('portal.html')) {
    return;
  }
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// [ĐIỂM NGHẼN ④ - LỚP 1 ANDROID / CHROMIUM]: Background Sync API
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_BACKGROUND_SYNC_TRIGGER',
            tag: 'sync-attendance',
            timestamp: Date.now()
          });
        });
      })
    );
  }
});

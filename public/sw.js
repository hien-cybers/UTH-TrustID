// public/sw.js
const CACHE_NAME = 'uth-trustid-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

self.addEventListener('install', (event) => {
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
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Chiến lược: Ưu tiên mạng, fallback vào cache nếu offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});


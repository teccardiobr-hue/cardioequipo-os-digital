const CACHE_NAME = 'cardioequipo-os-v22';
const CACHE_PREFIX = 'cardioequipo-os-';
const APP_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './cardioequipo-logo.jpg',
  './login-cardioequipo.png',
  './login-brand.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.registration.navigationPreload?.enable())
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (isSameOrigin && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      // Only app navigations should fall back to the app shell. Returning HTML
      // for a failed script, image, or cross-origin CDN request breaks loading.
      if (isSameOrigin && event.request.mode === 'navigate') {
        const appShell = await caches.match('./index.html');
        if (appShell) return appShell;
      }

      return Response.error();
    }
  })());
});

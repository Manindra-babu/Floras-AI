const CACHE_NAME = 'floras-ai-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Only intercept HTTP/HTTPS GET requests (ignore chrome-extension, leaflet tiles, supabase auth, etc.)
  if (e.request.url.startsWith('http') && e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Cache the new asset dynamically if it's static
          const url = new URL(e.request.url);
          if (url.pathname.includes('/assets/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
});

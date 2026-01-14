const cacheName = 'v3';
const OFFLINE = 'offline.html';

const assetsToCache = [
  '/index.html',
  '/resume.html',
  '/lab.html',
  '/lab/buttons-custom-properties.html',
  '/lab/emoji-speaker.html',
  '/lab/figma-logo.html',
  '/lab/framer-flows.html',
  '/lab/framer-loaders.html',
  '/lab/framer-logo.html',
  '/lab/google-loader.html',
  '/lab/google-search-loader.html',
  '/lab/headphones.html',
  '/lab/media-player.html',
  '/lab/microsoft-logo.html',
  '/styles/fonts.css',
  '/styles/main.css',
  '/styles/mpa.css',
  '/fonts/recursive-variable.woff2',
  '/scripts/nav-transitions.js',
  '/images/icon.svg',
  '/images/favicon.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(assetsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => self.clients.claim());

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') { return; }
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) { return; }

  event.respondWith(
    caches.open(cacheName).then((cache) => {
      // Cache First strategy for fonts and images
      if (event.request.destination === 'font' || event.request.destination === 'image') {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }

      // Network First strategy for everything else (HTML, CSS, JS)
      return fetch(event.request).then((networkResponse) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      }).catch(() => {
        return cache.match(event.request);
      });
    })
  );
});

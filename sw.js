const cacheName = 'v10'; // Bumped to v10 to inline fonts.css and fix cache cleanup
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
  '/styles/main.css',
  '/fonts/recursive-variable.woff2',
  '/images/icon.svg',
  '/images/icon-ios.svg',
  '/favicon.png',
  '/favicon_144.png',
  '/favicon_192.png',
  '/favicon_512.png',
  '/manifest.json',
  '/resume_icon.svg',
  '/lab_icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(assetsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') { return; }

  // Ignore cross-origin requests (e.g. Cloudflare, Google Analytics)
  if (!event.request.url.startsWith(self.location.origin)) { return; }

  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) { return; }

  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) { return; }

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

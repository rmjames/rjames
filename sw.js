const cacheName = 'v17'; // Bumped to v17 to cache media player scripts
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
  '/styles/lab-shared.css',
  '/fonts/recursive-variable.woff2',
  '/images/icon.svg',
  '/images/icon-ios.svg',
  '/favicon_144.png',
  '/favicon_192.png',
  '/favicon_512.png',
  '/manifest.json',
  '/resume_icon.svg',
  '/lab_icon.svg',
  '/scripts/resume-print.js',
  '/scripts/favicon-animator.js',
  '/scripts/AudioLibrary.js',
  '/scripts/lab-analytics.js',
  '/scripts/analytics.js',
  '/scripts/analytics-loader.js',
  '/scripts/copyright.js',
  '/scripts/media/ColorExtractor.js',
  '/scripts/media/Constants.js',
  '/scripts/media/Equalizer.js',
  '/scripts/media/MediaPlayerCore.js',
  '/scripts/media/MediaPlayerSelector.js',
  '/scripts/media/MediaPlayerUI.js'
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
            if (networkResponse.ok) {
              const contentType = networkResponse.headers.get('content-type');
              const isHtml = contentType && contentType.includes('text/html');
              // Ensure we don't cache HTML fallbacks as images/fonts
              if (!isHtml) {
                cache.put(event.request, networkResponse.clone());
              }
            }
            return networkResponse;
          });
        });
      }

      // Network First strategy for everything else (HTML, CSS, JS)
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const contentType = networkResponse.headers.get('content-type');
          const isHtml = contentType && contentType.includes('text/html');
          const isAsset = /\.(png|jpg|jpeg|svg|gif|webp|woff|woff2)$/i.test(new URL(event.request.url).pathname);

          // Only cache if it's not an asset receiving an HTML fallback
          if (!(isAsset && isHtml)) {
            cache.put(event.request, networkResponse.clone());
          }
        }
        return networkResponse;
      }).catch(() => {
        return cache.match(event.request);
      });
    })
  );
});

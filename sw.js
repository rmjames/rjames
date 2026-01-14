const cacheName = 'v2';
const OFFLINE = 'offline.html';

const assetsToCache = [
  '/index.html',
  '/work.html',
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
  if (/http:/.test(event.request.url)) { return; }

  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return fetch(event.request).then((networkResponse) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      }).catch(() => {
        return cache.match(event.request);
      })
    })
  );
});

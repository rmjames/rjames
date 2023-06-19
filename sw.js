const cacheName = 'v1';
const OFFLINE = 'offline.html';

const assetsToCache = [
  '/index.html',
  '/styleguide.html',
  '/styles/main.css',
  '/scripts/index.js',
  '/images/icon.svg',
  '/images/icon-ios.svg',
  '/sw.js'
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
      return fetch(event.request).then((networkResponse) =>{
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      }).catch(() => {
        return cache.match(event.request);
      })
    })
  );
});

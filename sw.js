const cacheName = 'v21'; // Bumped to v20 to clear cache for decoupled platter/needle updates

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
  '/lab/media-player-inline.html',
  '/lab/media-player-lock-screen.html',
  '/lab/media-player-selector.html',
  '/lab/media-player-widget.html',
  '/lab/google-store-checkout.html',
  '/lab/checkout-tracking-card.html',
  '/lab/microsoft-logo.html',
  '/styles/main.css',
  '/styles/lab-shared.css',
  '/styles/lab/headphones.css',
  '/styles/lab/framer-flows.css',
  '/styles/lab/framer-loaders.css',
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
  '/scripts/utils/ColorExtractor.js',
  '/scripts/utils/labNavigation.js',
  '/scripts/utils/splitText.js',
  '/scripts/media/Constants.js',
  '/scripts/media/Equalizer.js',
  '/scripts/media/EqualizerUI.js',
  '/scripts/media/MediaPlayerCore.js',
  '/scripts/media/MediaPlayerSelector.js',
  '/scripts/media/MediaPlayerUI.js',
  '/scripts/lab/headphones.js',
  '/scripts/lab/framer-flows.js',
  '/scripts/lab/framer-loaders.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        // Cache assets individually so a single 404 doesn't fail the entire installation
        return Promise.all(
          assetsToCache.map(url =>
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url} during install:`, error);
            })
          )
        );
      })
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
      // SEC-5: Enhanced security check for response validity
      const isValidResponse = (request, response) => {
        if (!response.ok) return false;
        const contentType = response.headers.get('content-type') || '';
        const destination = request.destination;

        // Prevent caching HTML fallbacks for assets (Cache Poisoning protection)
        if (contentType.includes('text/html') &&
          ['script', 'style', 'image', 'font', 'audio', 'video'].includes(destination)) {
          return false;
        }

        // Destination-specific validation
        if (destination === 'script' && !contentType.includes('javascript')) return false;
        if (destination === 'style' && !contentType.includes('css')) return false;
        if (destination === 'image' && !contentType.includes('image')) return false;
        if (destination === 'font' && !contentType.includes('font')) return false;

        return true;
      };

      // Cache First strategy for fonts and images
      if (event.request.destination === 'font' || event.request.destination === 'image') {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (isValidResponse(event.request, networkResponse)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      }

      // Stale-While-Revalidate for script and style
      if (event.request.destination === 'script' || event.request.destination === 'style') {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (isValidResponse(event.request, networkResponse)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });

          // Return cached response immediately if available, 
          // while fetchPromise updates the cache in the background.
          if (cachedResponse) {
            fetchPromise.catch(() => {
              // Silently ignore background fetch errors
            });
            return cachedResponse;
          }

          // If not in cache, wait for network
          return fetchPromise;
        });
      }

      // Network First strategy for everything else (HTML, etc.)
      return fetch(event.request).then((networkResponse) => {
        if (isValidResponse(event.request, networkResponse)) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        return cache.match(event.request);
      });
    })
  );
});

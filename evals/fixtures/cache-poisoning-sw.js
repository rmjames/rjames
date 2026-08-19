// Fixture: Insecure Service Worker Cache Poisoning
self.addEventListener('fetch', (event) => {
    // Unchecked request tampering and writing arbitrary cross-origin responses to cache
    event.respondWith(
        caches.open('v1-dynamic').then((cache) => {
            return fetch(event.request).then((response) => {
                // Insecure: caching opaque/unvalidated external responses directly into core cache
                cache.put(event.request, response.clone());
                return response;
            });
        })
    );
});

## 2025-05-27 - [Service Worker was Dead Code]
**Learning:** The service worker `sw.js` was present but never registered in the HTML, and even if it was, it contained a reference to a missing file (`work.html`) which would have caused installation to fail. Additionally, its fetch handler had a logic error that caused it to ignore all HTTP/HTTPS requests.
**Action:** Always verify that optimization scripts (like SW) are actually loaded and functional before optimizing them. Check for console errors during SW installation.
## 2025-05-27 - [IntersectionObserver Memory Leak Prevention]
**Learning:** When using `IntersectionObserver` for one-time actions (like lazy-loading an iframe or initializing tracking), failing to call `unobserve()` leaves the observer active, causing unnecessary callback triggers on every scroll event that intersects the element. This wastes CPU cycles.
**Action:** Always pass the observer instance (usually `obs` as the second argument to the callback) and call `obs.unobserve(entry.target)` immediately after the initial condition is met. Ensure unit tests mocking `IntersectionObserver` pass `this` to the callback to correctly test `unobserve()` behavior.

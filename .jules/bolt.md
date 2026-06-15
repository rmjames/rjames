## 2025-05-27 - [Service Worker was Dead Code]
**Learning:** The service worker `sw.js` was present but never registered in the HTML, and even if it was, it contained a reference to a missing file (`work.html`) which would have caused installation to fail. Additionally, its fetch handler had a logic error that caused it to ignore all HTTP/HTTPS requests.
**Action:** Always verify that optimization scripts (like SW) are actually loaded and functional before optimizing them. Check for console errors during SW installation.
## 2025-05-27 - [IntersectionObserver Memory Leak Prevention]
**Learning:** When using `IntersectionObserver` for one-time actions (like lazy-loading an iframe or initializing tracking), failing to call `unobserve()` leaves the observer active, causing unnecessary callback triggers on every scroll event that intersects the element. This wastes CPU cycles.
**Action:** Always pass the observer instance (usually `obs` as the second argument to the callback) and call `obs.unobserve(entry.target)` immediately after the initial condition is met. Ensure unit tests mocking `IntersectionObserver` pass `this` to the callback to correctly test `unobserve()` behavior.
## 2025-05-27 - [Event Delegation Anti-Pattern]
**Learning:** Using global event delegation (`document.addEventListener`) for high-frequency events like `mouseover` or `mousemove` causes extreme main-thread bloat, as the listener evaluates logic (like `.closest()`) on every single DOM boundary crossed by the mouse.
**Action:** Avoid global event delegation for high-frequency events. Instead, explicitly attach `mouseenter` or `mouseleave` listeners directly to the specific elements that require tracking, ensuring the callbacks only fire when interacting with the intended targets.

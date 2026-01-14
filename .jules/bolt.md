## 2025-05-27 - [Service Worker was Dead Code]
**Learning:** The service worker `sw.js` was present but never registered in the HTML, and even if it was, it contained a reference to a missing file (`work.html`) which would have caused installation to fail. Additionally, its fetch handler had a logic error that caused it to ignore all HTTP/HTTPS requests.
**Action:** Always verify that optimization scripts (like SW) are actually loaded and functional before optimizing them. Check for console errors during SW installation.

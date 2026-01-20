## 2024-10-24 - DOM XSS via Unsanitized Audio Metadata
**Vulnerability:** `innerHTML` used to render audio track metadata (title, artist) sourced from ID3 tags in `lab/media-player.html` and `scripts/media/MediaPlayerUI.js`.
**Learning:** Even in static sites, data sources (like file metadata) must be treated as untrusted input when rendering to the DOM. `scan-audio.js` extracts metadata but does not sanitize it.
**Prevention:** Refactored code to use `textContent`, `document.createElement`, and `replaceChildren` to safely render text data.

## 2026-01-20 - Inconsistent Security Headers
**Vulnerability:** 14 files in `lab/` were missing `Referrer-Policy` headers, and `index.html` had a broken CSP causing console errors.
**Learning:** Security headers implemented via meta tags must be consistently applied across all HTML entry points, not just the main pages. Automated tests are essential to catch drift in static files.
**Prevention:** Added `Referrer-Policy` to all `lab/*.html` files and fixed `index.html` CSP. Added dynamic E2E test to verify all `lab/` files.

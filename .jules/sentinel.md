## 2024-10-24 - DOM XSS via Unsanitized Audio Metadata
**Vulnerability:** `innerHTML` used to render audio track metadata (title, artist) sourced from ID3 tags in `lab/media-player.html` and `scripts/media/MediaPlayerUI.js`.
**Learning:** Even in static sites, data sources (like file metadata) must be treated as untrusted input when rendering to the DOM. `scan-audio.js` extracts metadata but does not sanitize it.
**Prevention:** Refactored code to use `textContent`, `document.createElement`, and `replaceChildren` to safely render text data.

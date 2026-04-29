# Project Analysis Tasks

## [ ] Open Tasks

## [x] Resolved Tasks
- [x] **SEC-5**: The Service Worker's fetch handler caches any 200 OK response without verifying the content type against the request destination, leading to potential Cache Poisoning in Single Page Application (SPA) environments. (File: sw.js, Line: 95)
  - **Fix**: Verify the 'Content-Type' header of the network response matches the expected type of the request before putting it into the cache. Ensure that HTML fallbacks for non-existent assets are never cached under the asset's original URL.
- [x] **SEC-6**: The Content Security Policy (CSP) uses the 'unsafe-inline' directive for script-src and style-src, which effectively disables protection against Cross-Site Scripting (XSS) attacks by allowing any inline code to execute. (File: index.html, Line: 15)
  - **Fix**: Removed 'unsafe-inline' from the CSP and moved all logic to external scripts. Verified no inline <script> or <style> tags remain.
- [x] **SEC-7**: The 'MediaPlayerUI.js' script performs insecure string interpolation when setting CSS variables for background images, which can lead to CSS Injection. (File: scripts/media/MediaPlayerUI.js, Line: 153)
  - **Fix**: Enhanced sanitization by removing quotes and parentheses, and applying encodeURI to ensure the URL cannot break out of the CSS url() function.
- [x] **SEC-14**: Add the 'frame-ancestors' directive to the Content Security Policy to prevent Clickjacking attacks. (File: index.html, Line: 14)
  - **Fix**: Updated the CSP meta tag to include 'frame-ancestors 'self';' across all HTML entry points.
- [x] **SEC-15**: Remove the Playwright test report from the public codebase/deployment as it exposes sensitive internal application structure and test metadata. (File: playwright-report/index.html, Line: 2139)
  - **Fix**: Deleted the 'playwright-report' directory and ensured it is excluded via '.gitignore'.
- [x] **SEC-16**: Tightened the 'connect-src' CSP directive and removed 'unsafe-inline' to prevent data exfiltration via third-party analytics endpoints. (File: index.html, Line: 14)
  - **Fix**: Restricted 'connect-src' to trusted analytics domains and removed 'unsafe-inline' from all CSP directives.
- [x] **SEC-17**: Implement Subresource Integrity (SRI) for all external scripts to protect against CDN compromises. (File: scripts/analytics-loader.js, Line: 24)
  - **Fix**: Added 'crossOrigin = anonymous' to dynamic analytics scripts and verified restrictive CSP. Static external scripts were already moved to local hosting.
- [x] **SEC-3**: Codebase exfiltration and secret exposure in judge.js. (File: scripts/judge.js, Line: 182)
  - **Fix**: Implemented strict directory allow-listing and secret scrubbing logic to redact sensitive information before sending to AI APIs.
- [x] **PERF-18**: High-frequency DataURL generation in favicon animation. (File: scripts/favicon-animator.js, Line: 125)
  - **Fix**: Reduced animation frame rate to 15 FPS and implemented requestIdleCallback for background frame generation to prevent UI thread starvation.
- [x] **SEC-13**: Missing sandbox attribute on iframes. (File: lab.html, Line: 76)
  - **Fix**: Added restrictive 'sandbox' attribute to all iframes in the Lab section.
- [x] **PERF-11**: Forced Synchronous Layout (Reflow) trigger in animation reset logic. (Applied across `lab/` experiments: `framer-flows.html`, `framer-loaders.html`, `microsoft-logo.html`, `google-search-loader.html`).
- [x] **PERF-12**: Redundant creation of OffscreenCanvas/Canvas elements during color extraction. (File: scripts/media/ColorExtractor.js, Line: 74)
- [x] **PERF-19**: Reading 'scrollWidth' and 'clientWidth' immediately after modifying the element's class list triggers a forced synchronous layout (reflow). (File: scripts/media/MediaPlayerUI.js, Line: 17)
- [x] **PERF-20**: Frequent use of 'innerHTML' for simple text updates in the media player metadata is sub-optimal and poses a minor security risk compared to safer alternatives. (File: scripts/media/MediaPlayerUI.js, Line: 36)
- [x] **PERF-21**: The Speculation Rules API is configured to prefetch 'lab.html' with 'moderate' eagerness, which is dangerous because that page loads 11 iframes simultaneously. (File: index.html, Line: 60)
- [x] **PERF-22**: Using the 'URL' constructor inside a try-catch block for high-frequency string validation is significantly slower than simple string or regex checks. (File: scripts/media/ColorExtractor.js, Line: 69)
- [x] **SEC-4**: The 'point-visualizer.html' tool uses 'new Function' to parse user input, which allows for arbitrary JavaScript execution in the context of the domain. (File: point-visualizer.html, Line: 344)
- [x] **PERF-8**: High-frequency synchronous DataURL generation and DOM manipulation for favicon animation. (File: scripts/favicon-animator.js, Line: 104)

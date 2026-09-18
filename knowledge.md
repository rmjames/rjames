## 2024-05-15 - Update MEDIA-PLAYER.md - Context - Learning - Action
**Context:** Updating `lab/MEDIA-PLAYER.md` to reflect recent architectural, performance, and security changes to the media player components.
**Learning:** `lab/MEDIA-PLAYER.md` serves as a critical living document for the media player architecture. It requires explicit maintenance sections to ensure future contributors document UI component changes (like the inline player), performance optimizations (like `requestAnimationFrame` batching and `ResizeObserver` caching), and security fixes (like URL sanitization).
**Action:** When modifying core media player scripts (`MediaPlayerCore.js`, `MediaPlayerUI.js`, etc.), proactively review and update `lab/MEDIA-PLAYER.md` to maintain documentation parity. Ensure any artifacts from diff/patch operations are deleted before committing.
## 2024-05-15 - Add Container Query and Design Token Guidelines to MEDIA-PLAYER.md - Context - Learning - Action
**Context:** Updating `lab/MEDIA-PLAYER.md` to specify standard component guidelines.
**Learning:** All media player components must act as container queries (`container-type: inline-size`) to ensure responsive adaptability. They must also strictly use project tokens (CSS variables) for gaps, spacing, and border radius.
**Action:** When creating or updating media player components, ensure the root element defines `container-type: inline-size`, and use existing OKLCH or sizing tokens. Additionally, strictly keep icons at `24px` to ensure cross-variant consistency.

## 2026-09-11 - Progressive Streaming and Token Authentication in Edge Workers and Object Storage
- **Context**: Creating an object-storage-backed media delivery service (`[REDACTED_CLOUD_RESOURCE]`) based on edge worker supporting progressive streaming, hotlink prevention, and authorization.
- **Learning**: HTML `<audio>`, `<video>`, and `<img>` tags cannot pass custom HTTP request headers (e.g., `Authorization: Bearer`). Enforcing header-only authentication forces clients to fetch media into in-memory JavaScript `Blob`s, breaking progressive streaming, Range seeking, and exhausting device RAM. Employing HMAC-SHA256 URL signing (`?token=...&expires=...`) allows browsers and native players (`AVPlayer`, `ExoPlayer`) to stream progressively using native HTTP 206 Partial Content. Furthermore, Edge Worker Cache API (`caches.default`) rejects 206 Range responses, so Range requests must stream directly from object storage while full GET requests benefit from normalized cache keys. In TypeScript, `R2Range` is a union of `{ suffix: number }` and `{ offset?: number; length?: number }`, requiring narrowing before arithmetic.
- **Action**: When designing media delivery workers, use URL query token signing with Web Crypto HMAC for client playback and preserve Range headers for object storage. Keep header API tokens for server-to-server minting and administrative routes.

## 2026-09-14 - Design Spec Parity and Multi-Screen Token Auditing
- **Context**: Comprehensive audit of screens (`index.html`, `resume.html`, `lab.html`, `pattern-library.html`) and cascade layers against `design.md`.
- **Learning**: Visual parity audits across multiple pages must compare not only CSS token variables but also document-level asset delivery (such as variable font preloading via `<link rel="preload">`), logical layout properties (`max-inline-size` vs physical `max-width`), living pattern library completeness (ensuring all scale tokens like `--xxxl` are exposed), and documentation sync (`content.css` in cascade layer maps).
- **Action**: When auditing design systems or updating stylesheets, check each HTML entry point's head preloads, verify the pattern library showcases the full token array, and update the architectural diagrams in `design.md` alongside codebase changes.

## 2026-09-18 - Single Container View Transitions Carousel with State-Preserving Iframes
- **Context**: Refactoring `lab/media-player-selector.html` and `scripts/media/MediaPlayerSelector.js` from a multi-card horizontal scroll carousel into a single-container carousel where individual players slide in using native View Transitions.
- **Learning**: 
  1. Toggling `display: none` on inactive `<iframe>` elements causes browsers to unload and reload the embedded browsing context, causing visual flashing and audio state resets. Using `visibility: hidden; pointer-events: none; position: absolute; inset: 0;` keeps iframes loaded in memory and allows `document.startViewTransition()` to immediately capture populated snapshots without white flashes.
  2. Setting `:root { view-transition-name: none; }` prevents unwanted whole-page cross-fading during localized view transitions.
  3. For stationary single-container selectors requiring pure cross-fades without lateral translation, configure `::view-transition-old(active-player) { animation: .4s var(--ease-premium) both fade-out; }` and `::view-transition-new(active-player) { animation: .4s var(--ease-premium) both fade-in; }` with `::view-transition-group` clipping.
  4. Directional slide transitions or pure cross-fades can be cleanly paired with Baseline 2025 `startViewTransition` while preserving all DOM and ARIA navigation controls.
- **Action**: When designing tab, carousel, or selector components with embedded iframes or media players, use a single stationary container with absolute `visibility: hidden` layers, idle preloading via `requestIdleCallback`, and clipped `::view-transition-group` cross-fade or slide animations.

## 2026-09-18 - Native DOM Component Carousels with CSS `sibling-index()` Staggering
- **Context**: Migrating the Media Player Selector from `<iframe>` embeds to native DOM components (Approach B) sharing a single unified `MediaPlayerCore` instance, with component entry choreography powered by CSS `sibling-index()`.
- **Learning**: 
  1. Replacing multi-window `<iframe>` embeds with native DOM component factories sharing a single `<audio>` element and `MediaPlayerCore` provides continuous, uninterrupted audio playback across layout transitions while cutting memory usage.
  2. BEM namespacing (e.g. `.player-variant--main`, `.player-variant--inline`) successfully isolates variant-specific layouts and container rules in light DOM without cross-variant style bleeding.
  3. CSS `sibling-index()` allows fully automated stagger delays on direct children (`animation-delay: calc(var(--stagger-step, sibling-index()) * 60ms)`) without requiring manually hardcoded index classes or inline styles in HTML/JS. Pairing it with `var(--stagger-step, sibling-index())` provides seamless progressive enhancement.
- **Action**: When embedding multiple variant layouts of a stateful widget (such as media players), prefer native DOM component builders sharing a single state manager over iframes, and use CSS `sibling-index()` for declarative child stagger choreography.

## 2026-09-18 - Audio Loading Resilience and Offline Fallback Pipeline
- **Context**: Resolving audio playback failure where audio tracks failed to load or play in `lab/media-player-selector.html`.
- **Learning**:
  1. Relying exclusively on remote CDN endpoints for audio metadata (`tracks.json`) or media streams causes silent failure in local development, sandboxes, or offline scenarios if `tracks` resolves to an empty array. Providing a static local `public/data/tracks.json` alongside hardcoded fallback tracks in `AudioLibrary.js` guarantees that `audioLibrary.tracks` is always populated.
  2. URL resolvers must distinguish root-relative asset paths (e.g. `/media/audio/...`) from relative asset paths (e.g. `../assets/audio/...`), preventing double-prefixing or forced mapping to unreachable CDN hosts.
  3. In HTML5 `<audio>`, assigning `audio.src` to a relative string causes the browser DOM property `audio.src` to return the resolved absolute URL. Comparing `this.audio.src !== streamUrl` directly without `endsWith()` or URL normalization causes spurious re-assignments that interrupt active buffering and abort playback.
  4. Audio playback promises (`audio.play()`) must always include rejection handlers (`.catch()`) to prevent unhandled promise rejections and update UI state when autoplay policies or network failures occur.
- **Action**: Always equip media libraries with resilient local fallback assets, prevent duplicate URL mutations for `/media/` paths, normalize URL equality checks when evaluating `audio.src`, and handle play rejections gracefully.

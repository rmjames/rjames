## 2024-05-15 - Update MEDIA-PLAYER.md - Context - Learning - Action
**Context:** Updating `lab/MEDIA-PLAYER.md` to reflect recent architectural, performance, and security changes to the media player components.
**Learning:** `lab/MEDIA-PLAYER.md` serves as a critical living document for the media player architecture. It requires explicit maintenance sections to ensure future contributors document UI component changes (like the inline player), performance optimizations (like `requestAnimationFrame` batching and `ResizeObserver` caching), and security fixes (like URL sanitization).
**Action:** When modifying core media player scripts (`MediaPlayerCore.js`, `MediaPlayerUI.js`, etc.), proactively review and update `lab/MEDIA-PLAYER.md` to maintain documentation parity. Ensure any artifacts from diff/patch operations are deleted before committing.
## 2024-05-15 - Add Container Query and Design Token Guidelines to MEDIA-PLAYER.md - Context - Learning - Action
**Context:** Updating `lab/MEDIA-PLAYER.md` to specify standard component guidelines.
**Learning:** All media player components must act as container queries (`container-type: inline-size`) to ensure responsive adaptability. They must also strictly use project tokens (CSS variables) for gaps, spacing, and border radius.
**Action:** When creating or updating media player components, ensure the root element defines `container-type: inline-size`, and use existing OKLCH or sizing tokens. Additionally, strictly keep icons at `24px` to ensure cross-variant consistency.

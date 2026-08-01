**Before starting, make sure you have read the /AGENTS.md & file for general guidelines and best practices.**

# Lab Media Player Specification

This document defines the technical and design specifications for the media player variants located in the `/lab` directory.

## Core Architecture

The media players follow a **Provider/Consumer** architecture:
- **Provider**: `MediaPlayerCore.js` managing the `<audio>` state, library tracks, and event subscriptions.
- **Consumer**: Individual HTML files implementing specific UI layouts using `MediaPlayerUI.js` and shared CSS components.

### Component Sharing Strategy

To share common HTML components (like MediaControls, MediaMeta) across the various media player HTML files within this vanilla JS/ES Modules architecture, we utilize **JS Factory Functions (DOM Generation)**.

- **Approach**: Dedicated factory functions (e.g., `createMediaControls()`) are exported from a shared module (such as `MediaPlayerUI.js` or a new component factory module). 
- **Implementation**: These functions use standard DOM APIs (`document.createElement` or `insertAdjacentHTML`) to build the required HTML structure, attach necessary event listeners, and return the DOM node.
- **Usage**: The consumer HTML files simply define an empty container and append the generated DOM node.
- **Benefits**: This approach fits natively into the existing ES Module pattern, eliminates repetitive HTML boilerplates across the different player variants, and makes it straightforward to pass the `MediaPlayerCore` instance into the factories for immediate event binding.

## Maintenance & Future Updates

**IMPORTANT:** This document serves as the source of truth for the media player architecture. Whenever changes are made to `MediaPlayerCore.js`, `MediaPlayerUI.js`, `Equalizer.js`, `ColorExtractor.js`, or any of the HTML variants (including the addition of new variants or components), this document **MUST** be updated. Ensure that any new performance optimizations, security considerations, or UI components are fully documented here to maintain architectural clarity.

## Shared Tech Stack

- **Logic**: Vanilla JavaScript (ES Modules).
- **Styling**: Vanilla CSS utilizing Grid, Flexbox, and Modern CSS features.
- **Color Model**: `OKLCH` for consistent perceptual lightness and chroma.
- **Units**: `rem` for accessibility and responsive scaling.

## Variants

### 1. Main Media Player (`media-player.html`)
The comprehensive implementation featuring advanced audio controls.
- **Layout**: 5-column grid layout.
- **Key Features**:
  - Horizontal preset scroll with snapped alignment.
  - 5-band Equalizer with gain controls (-12dB to +12dB).
  - EQ power toggle, preset save/load (Local Storage).
  - Option button with mode cycling (Like, Equalizer, Rewind) on long-press.
  - Metadata popover on preset long-press.

### 2. Media Player Widget (`media-player-widget.html`)
A compact, persistent-style widget optimized for sidebar or dashboard use.
- **Layout**: 2-row grid. Top row for metadata, bottom row for playback controls.
- **Key Features**:
  - Persistent track info (Title/Artist) in a condensed header.
  - Direct Dislike/Like buttons.
  - Centered playback controls (Prev, Play, Next).

### 3. Lock Screen Player (`media-player-lock-screen.html`)
A premium, OS-level inspired player with rich aesthetics.
- **Layout**: Fluid Flex/Grid with glassmorphism effects.
- **Design Patterns**:
  - `backdrop-filter: blur(10px)` for refined depth.
  - Dynamically updated background art based on the current track.
  - Accent color propagation (applying track-derived colors to buttons).
- **Key Features**:
  - Integrated range-based progress slider.
  - Source selection icons (YT Music / Phone icons).
  - Prominent themed Play/Pause button.

### 4. Inline Media Player (`media-player-inline.html`)
A compact inline player optimized for embedding within lists or tight spaces.
- **Layout**: Horizontal flex-based layout.
- **Key Features**:
  - **Decoupled Time Updates**: Listens for `timeupdate` directly on the `<audio>` element rather than through `MediaPlayerCore` notifications for improved performance.
  - Multi-mode option button (Shuffle/Like) with long-press interactions.
  - Direct progress slider with current and remaining time displays.
  - Dynamic marquee for track titles when overflowing parent width.

## Modular Components (Plug-and-Play)

To ensure interchangeability between variants, components should follow these standardized HTML/CSS patterns.

**General Guidelines for Components:**
- **Container Queries:** Each component must act as a container query (`container-type: inline-size`) to ensure its internal layout adapts correctly regardless of where it is placed.
- **Design Tokens:** Always use established project tokens (e.g., CSS variables) for gaps, spacing, and border radius.
- **Icons:** Keep all icons strictly at `24px` for consistency across variants.

### 1. `MediaMeta`
Standardized track information block.
- **Structure**:
  ```html
  <div class="media-player__meta">
    <div class="media-player__meta__title">Track Title</div>
    <div class="media-player__meta__artist">Artist Name</div>
  </div>
  ```
- **Plug-and-Play**: Use `UI.updateTrackInfo` with an object map of these selectors.

### 2. `MediaControls`
Standardized button set for playback.
- **Classes**: `.media-player__prev`, `.media-player__play`, `.media-player__next`.
- **Plug-and-Play**: Bind `core.togglePlay()`, `core.prev()`, and `core.next()` to these specific classes.

### 3. `MediaProgress`
Standardized time/progress tracking.
- **Structure**:
  ```html
  <div class="media-player__progress">
    <input type="range" class="progress-slider" min="0" max="100" value="0">
  </div>
  ```
- **Plug-and-Play**: The `progress-slider` class is pre-configured in `media-player.css` for cross-browser thumb/track styling.

### 4. `MediaPresets`
Standardized track selection grid/list.
- **Structure**:
  ```html
  <div class="media-player__presets">
    <!-- Dynamic buttons with .media-player__presets__preset class -->
  </div>
  ```
- **Plug-and-Play**: Use the `core.tracks` array to generate these buttons dynamically with `btn.dataset.id = track.id`.

### 5. `MediaEqualizer`
Standardized 5-band frequency control.
- **Structure**:
  ```html
  <div class="media-player__equalizer">
    <div class="eq-sidebar">
      <!-- Controls: #eq-close-btn, #eq-power-btn, #eq-save-btn, #eq-load-btn -->
    </div>
    <div class="eq-grid">
      <!-- 5-band sliders with .media-player__equalizer__slider class -->
    </div>
  </div>
  ```
- **Sizing**:
  - The component is designed to be **fully responsive**.
  - `.media-player__equalizer` should take **100% of the available width and height** of its parent container.
- **Overlay**:
  - The component must be positioned absolutely (`position: absolute`) within its parent container to create a seamless overlay effect when active, particularly in space-constrained variants like the Lock Screen Player.
- **Plug-and-Play**:
  - Initialize using `new Equalizer(audioElement)`.
  - Bind slider `input` events to `eq.setGain(index, value)`.
  - Use `UI.updateSliderVisuals(input)` for consistent fill/thumb rendering.

### 6. `MediaToggleButton`
Standardized binary state control (e.g., Shuffle, Repeat, Power).
- **Structure**:
  ```html
  <button class="toggle-btn" aria-pressed="false" title="Toggle Feature">
    <svg><!-- Icon --></svg>
  </button>
  ```
- **Plug-and-Play**:
  - Use `.active` class to indicate the "on" state.
  - Update `aria-pressed` attribute for accessibility.
  - Use `SVG_PATHS` for standard iconography.

### 7. `MediaOptionButton`
Standardized multi-mode control with state persistence and kinetic feedback.
- **Structure**:
  ```html
  <button class="media-player__option" title="Mode Name">
    <svg><path d="..." /></svg>
  </button>
  ```
- **Interactions**:
  - **Long-Press (500ms)**: Cycles between modes (e.g., Random, Like). Includes `animate-outline` and `pulse` animations.
  - **Tap**: Executes current mode action.
  - **Visuals**: Requires dynamic `viewBox` switching if icons have different coordinate systems (e.g., 24x24 vs 960x960).

### 8. `MediaRewind` (NEW)
Standardized skip-back control with distinct kinetic feedback.
- **Interactions**:
  - **Animation**: Triggers `animate-rewind` on click—a sharp -25° rotation with an `ease-out` transition.
  - **Logic**: Skips audio back exactly 10 seconds.

### 9. `MediaMarquee`
Standardized text overflow handling for track titles.
- **Intent**: Automatically scroll long track titles back and forth within their container while maintaining a static layout for short titles.
- **Interactions**:
  - **Logic**: Uses `updateMarquee(el)` helper to detect overflow and toggle functionality.
  - **Animation**: `@keyframes marquee` back-and-forth transform with a `calc()` based on parent width.
- **Structure**:
  ```html
  <div class="media-player__title">
    <span class="media-player__title__text">Track Title</span>
  </div>
  ```
- **Implementation**:
  ```javascript
  const updateMarquee = (el) => {
      el.classList.remove('is-marquee');
      el.style.setProperty('--marquee-width', '0px');

      // Wait for next frame to ensure rendering
      requestAnimationFrame(() => {
          const parentWidth = el.parentElement.clientWidth;
          if (el.scrollWidth > parentWidth) {
              el.classList.add('is-marquee');
              el.style.setProperty('--marquee-width', `${parentWidth}px`);
          }
      });
  };
  ```
- **CSS**:
  ```css
  @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(calc(-100% + var(--marquee-width, 4rem))); }
  }
  ```

## Performance & Security Updates

### Performance (PERF)
- **Layout Thrashing Prevention (PERF-30)**: `MediaPlayerUI.updateMarquee` utilizes a double `requestAnimationFrame` pattern. It batches DOM reads in the first frame and defers DOM writes (CSS modifications) to the second nested frame to prevent forced synchronous layouts (layout thrashing) during track changes.
- **ResizeObserver Caching (PERF-30)**: `MediaPlayerUI` implements a centralized `ResizeObserver` backed by a `WeakMap` to cache parent element widths, avoiding repeated `.clientWidth` reads on resize events.
- **Color Extraction Optimization**: `ColorExtractor.js` caches `Promise` objects to prevent concurrent duplicate processing of the same image URL. It also utilizes `OffscreenCanvas` (where available) with `{ willReadFrequently: true }` for improved rendering performance.
- **Iframe Carousel Lazy Loading**: The iframe carousel in `MediaPlayerSelector.js` uses an `IntersectionObserver` to defer loading iframe contents (assigning `src` from `dataset.src`) until they intersect the viewport, preventing massive memory overhead.
- **Event Decoupling**: The Inline Media Player handles `timeupdate` events natively on the `<audio>` element to reduce main-thread messaging overhead from the core provider.

### Security (SEC)
- **CSS Injection Prevention (SEC-7)**: `MediaPlayerUI.updateBackgroundArt` aggressively sanitizes album art URLs before applying them to CSS variables, stripping potential breakout characters (`"`, `'`, `(`, `)`) and encoding the URI to prevent CSS injection attacks.
- **Untrusted URL Rejection (PERF-22)**: `ColorExtractor.getAccentColor` enforces a strict policy that rejects absolute paths (`://`) and protocol-relative paths (`//`). It only processes relative image paths to prevent loading and analyzing untrusted external media.

## Interchangeability Guidelines

1. **Selector Parity**: Keep class names consistent (`.media-player__*`) even if the layout (Grid vs. Flex) changes.
2. **Logic Separation**: Never bake audio logic into the UI HTML. All state changes must go through `MediaPlayerCore`.
3. **Theming**: Use the `themed-background` utility class and `--themed-background` CSS variable to propagate track-derived colors.
4. **Animation Parity**: Reusable animations like `media-pulse` and `media-outline-expand` should be consistent across variants.

## Design Tokens

### Color Palette (OKLCH)
| Token | Source | Purpose |
| :--- | :--- | :--- |
| `oklch(from #333 l c h)` | Surface | Background for controls/presets |
| `oklch(from #fff l c h / 0.8)` | Text | Primary foreground labels |
| `oklch(0.6 0.2 260 / 0.8)` | Accent | Brand/Action highlighting |

### Spacing & Sizing
- **Gaps**: Standardized at `.5rem` or `.75rem` using project tokens.
- **Radius**: Large curves (`1.25rem` or `1.5rem`) for a premium "soft" feel using project tokens.
- **Icons**: Standardized at `24px` for consistency across variants.
- **Animations**: Standard rotation for rewind is **-25°**.

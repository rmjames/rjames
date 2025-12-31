# Lab Media Player Specification

This document defines the technical and design specifications for the media player variants located in the `/lab` directory.

## Core Architecture

The media players follow a **Provider/Consumer** architecture:
- **Provider**: `MediaPlayerCore.js` managing the `<audio>` state, library tracks, and event subscriptions.
- **Consumer**: Individual HTML files implementing specific UI layouts using `MediaPlayerUI.js` and shared CSS components.

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

## Modular Components (Plug-and-Play)

To ensure interchangeability between variants, components should follow these standardized HTML/CSS patterns.

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

### 6. `MediaToggleButton` (NEW)
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
  - Use `SVM_PATHS` for standard iconography.

## Interchangeability Guidelines

1. **Selector Parity**: Keep class names consistent (`.media-player__*`) even if the layout (Grid vs. Flex) changes.
2. **Logic Separation**: Never bake audio logic into the UI HTML. All state changes must go through `MediaPlayerCore`.
3. **Theming**: Use the `themed-background` utility class and `--themed-background` CSS variable to propagate track-derived colors across components.

## Design Tokens

### Color Palette (OKLCH)
| Token | Source | Purpose |
| :--- | :--- | :--- |
| `oklch(from #333 l c h)` | Surface | Background for controls/presets |
| `oklch(from #fff l c h / 0.8)` | Text | Primary foreground labels |
| `oklch(0.6 0.2 260 / 0.8)` | Accent | Brand/Action highlighting |

### Spacing & Sizing
- **Gaps**: Standardized at `.5rem` or `.75rem`.
- **Radius**: Large curves (`1.25rem` or `1.5rem`) for a premium "soft" feel.
- **Icons**: Standardized at `24px` for consistency across variants.

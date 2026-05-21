# BreakBeat - Technics SL-1210MK2 Specification

## Project Overview
BreakBeat is an interactive, web-based, high-fidelity replica of the iconic Technics SL-1210MK2 vinyl turntable. The application serves as an audio playback interface that emulates physical turntable hardware features through an interactive SVG-based UI.

### Key Features
- **Hardware UI Emulation:** Functional, meticulously modeled SVG elements mimicking the power switch (with strobe light), start/stop buttons, 33/45 RPM speed controls, pitch adjustment slider, tonearm, and spinning platter with record grooves.
- **Audio Engine Integration:** The application connects the UI to an underlying modular audio engine (`TurntableController.js`) to handle playback, speed modifications, and scratching behaviors.
- **Record Library Modal:** A built-in modal interface allowing users to browse and select tracks from pre-configured albums. Album artwork is dynamically applied to the center label of the SVG record upon selection.
- **Local Uploads:** Allows users to load local audio files into the turntable via a file input.

## Design Guidelines

### Visual Aesthetic & Layout
- **Theme:** Dark, premium, realistic, hardware-focused design.
- **Layout:** Centered single-page interface using Flexbox (`justify-content: center`, `align-items: center`), filling the viewport.
- **Overlays:** Modals and loading screens use semi-transparent dark backgrounds (`rgba(0,0,0,0.85)`) paired with modern glassmorphism effects (`backdrop-filter: blur(10px)`).

### Color Palette
The project uses modern CSS `lch()` colors for deep contrasts and accurate grayscales representing hardware materials:
- **Background:** `lch(10% 0 0)`
- **`--white-0`**: `lch(100% 0 0)`
- **`--gray-0`**: `lch(85.12% 0 0)`
- **`--gray-1`**: `lch(83.13% 0 0)`
- **`--gray-2`**: `lch(17.88% 0 0)`
- **`--black-0`**: `lch(14.85% 0 0)`

### Hardware Rendering (SVG)
- Built entirely with scalable vector graphics (`<svg>`) for crisp rendering at any resolution.
- Heavy use of SVG `<defs>`, including:
  - Complex `<radialGradient>` stops to simulate the reflective grooves of a vinyl record.
  - `<filter>` elements like `feGaussianBlur`, `feSpecularLighting`, and `feSpotLight` to simulate environment spotlights and glowing LED indicators.
- Shadow effects using CSS `box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8)` on the primary SVG element to lift the turntable off the page.

### Typography
- General UI uses crisp `sans-serif` system fonts.
- Track lists and UI buttons leverage `monospace` fonts for an industrial, precise feel.

## Coding Style

### HTML Structure
- **Security:** Strict Content-Security-Policy (CSP) meta tags implemented.
- **SVG Dom:** Hardware elements are logically grouped using `<g>` tags and `transform` attributes. Interactive elements have `id` attributes (e.g., `start-stop-btn`, `tonearm`, `power-switch`) for easy JavaScript binding.
- **Image Integration:** `<clipPath>` is utilized to perfectly mask album artwork into a circular record label shape within the SVG.

### CSS Patterns
- Variables (`:root`) defined for consistent color usage.
- Modern layout features such as CSS Grid used in the library modal (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`).
- Hover states with smooth `transition` properties (e.g., `0.2s` for background/color).
- Transitions on SVG transforms (e.g., tonearm movement uses `cubic-bezier(0.4, 0.0, 0.2, 1)` easing).

### JavaScript Architecture
- **Modularity:** Uses `<script type="module">` for encapsulation and ES6 imports (`TurntableController.js`).
- **Data Handling:** Library tracks are stored in an array of objects representing albums, mapping track files to titles and cover art.
- **Event Delegation:** The library modal utilizes event delegation (`libraryGrid.addEventListener('click', ...)`) for efficient interaction handling on dynamically created track items.
- **DOM Manipulation:** DOM elements are queried once upon `DOMContentLoaded` and referenced directly for state updates and event binding.

# Design System & Architecture: Robert James Portfolio (`robertjames.nyc`)

A comprehensive specification of the design system, architectural foundations, tokens, typography, layout paradigms, component patterns, motion principles, and accessibility standards powering the portfolio and lab experiences.

---

## 1. Design Philosophy & Engineering Principles

The site is crafted by and for a **UX Engineer**, reflecting a philosophy where aesthetic refinement and cutting-edge web platform capabilities converge without unnecessary dependencies or legacy bloat.

- **Platform-Native First**: Built with vanilla HTML5, modern CSS3, and ESNext. Leveraging native browser capabilities (Popover API, CSS Anchor Positioning, View Transitions, Container Queries, `@starting-style`, `@layer`) instead of heavy third-party UI frameworks.
- **Baseline 2025 Standards**: Adherence to modern Baseline features, utilizing logical properties (`inline-size`, `block-size`, `inset-block`, `inset-inline`), modern color spaces (`oklch`), and standard CSS nesting.
- **Progressive Enhancement**: Resilient fallbacks for emerging features (e.g., anchor positioning, squircle corner shapes, discrete transitions) while delivering bleeding-edge polish in modern user agents.
- **Performance & Carbon Footprint**: Zero layout shifts (CLS = 0), preloaded variable fonts, speculation rules for near-instant MPA navigation, and non-blocking stylesheets.
- **Inclusive Accessibility (WCAG 2.0 / 2.1 AA)**: Full keyboard navigability, high-contrast states across light and dark modes, explicit touch targets, semantic landmarking, and strict motion sensitivity considerations.

---

## 2. Cascade Layers & Architecture

Styles are organized strictly through CSS Cascade Layers (`@layer`) in `styles/main.css` to eliminate specificity wars:

```css
@layer base, layout, components, utilities;
```

```
styles/
├── base/
│   ├── reset.css          # Modern box-sizing, margin resets, media rules
│   ├── variables.css      # Design tokens (colors, spacing, easing, typography)
│   └── typography.css     # Recursive variable font face, headings, links
├── layout/
│   ├── structure.css      # Root body, main container, 3D perspective wrapper
│   ├── header.css         # Navigation bar, brand logo, active indicators
│   └── footer.css         # Social links, copyright, responsive grid
├── components/
│   ├── buttons.css        # Brand trigger buttons, multi-tiered contact links
│   ├── popovers.css       # Popover API styling, anchor positioning, backdrop blurs
│   ├── lab.css            # Lab card grid, squircles, iframe embeds
│   ├── resume.css         # Collapsible details/summary job history
│   ├── icons.css          # SVG icon sprite integration
│   ├── skip-link.css      # Accessible keyboard bypass link
│   └── pattern-library.css# Design system showcase styles
└── utilities/
    ├── animations.css     # Keyframes, letter staggering, prefers-reduced-motion
    └── mpa.css            # Multi-page View Transitions API orchestration
```

---

## 3. Color System & Theming

The color architecture is built around **OKLCH** perceptual uniformity, enriched by `light-dark()` color scheme resolution and dynamic `color-mix()` blending.

### 3.1 Color Tokens

| Token | OKLCH / Fallback HSL | Role / Context |
| :--- | :--- | :--- |
| `--white-1` | `hsl(0, 0%, 100%)` / `oklch(1 0 0)` | Pure white / dark-mode text & light-mode background |
| `--white-2` | `hsl(0, 0%, 98%)` | Off-white subtle background / surface |
| `--black-1` | `hsl(360 0% 0%)` / `oklch(0 0 0)` | Deep absolute black |
| `--black-2` | `hsl(46 94% 119%)` | High-chroma warm black accent |
| `--black-3` | `hsl(200 16% 16%)` | Charcoal dark base (`--bkgnd` / `--text-dark-color`) |
| `--black-4` | `hsl(0 0% 20%)` | Mid-dark charcoal for borders and GitHub icons |
| `--black-5` | `hsl(0 0% 47%)` | Dimmed subtle gray-black |
| `--gray-1` | `hsl(200, 8%, 45%)` | Cool slate brand token (`--color-brand`, selection) |
| `--gray-2` | `#6d7f88` | Muted slate secondary text & brand button neutral |
| `--blue-1` | `hsl(200 100% 32.9%)` | Deep royal blue (LinkedIn active / hover) |
| `--blue-2` | `hsl(201 44% 43%)` | Accent link blue (`--link-color`, border highlights) |
| `--blue-3` | `hsl(204 100% 51%)` | Vivid sky blue for subtle dark-mode color mixing |
| `--blue-4` | `hsl(203 89.2% 52.9%)` | Electric cyan-blue (Twitter/X hover) |
| `--orange-1`| `hsla(30 60.7% 58% / .66)` | Warm transparent amber glow |
| `--orange-2`| `hsl(38.8 100% 50%)` | Vivid amber / interactive button focus ring |
| `--orange-3`| `hsl(13.9 95.2% 67.1%)` | Coral orange highlight |
| `--orange-4`| `#777` / `#fb805b` | Warm shadow & email accent |

### 3.2 Adaptive Theming (`light-dark()`)

```css
:root {
    color-scheme: light dark;
}

body {
    /* Dynamic background with subtle blue-chroma mix in dark mode */
    background: light-dark(
        var(--white-1), 
        color-mix(in oklch, var(--bkgnd) 24%, var(--blue-3) 2%)
    );
    color: light-dark(var(--text-dark-color), var(--text-light-color));
}
```

---

## 4. Typography System

The typography is driven entirely by a single, highly expressive variable font: **Recursive**.

### 4.1 Recursive Variable Axes

```css
@font-face {
    font-family: "Recursive";
    font-style: normal;
    font-weight: 400 900;
    font-display: swap;
    src: url("../../fonts/recursive-variable.woff2") format("woff2-variations");
}
```

| Axis Property | CSS Variable | Range | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Weight** (`wght`) | `--recursive-wght` | `100` – `1000` | `400` | Hierarchy, headings (`700`–`850`), hover boldness |
| **Casual** (`CASL`) | `--recursive-CASL` | `0.0` – `1.0` | `0.0` | Informal playful tone, headings (`0.8`), brand hover |
| **Monospace** (`MONO`)| `--recursive-MONO` | `0.0` – `1.0` | `0.0` | Technical snippets & code tokens |
| **Cursive** (`CRSV`) | `--recursive-CRSV` | `0.0` – `1.0` | `0.5` | Italic character styling and link accents (`1.0`) |
| **Slant** (`slnt`) | `--recursive-slnt` | `-15` – `0` | `0` | Angle adjustments for emphasis |

### 4.2 Fluid Type Scale

Typography scales dynamically with container and viewport queries (`cqi`, `vmin`, `rem`):

- **Root Base**: `clamp(1rem, calc(1rem + .125cqi), 2rem)`
- **Heading 1 (`h1`)**: `clamp(14px, calc(14px + .4cqi), 1.5rem)` with `text-transform: uppercase` and layered drop-shadows.
- **Reading Measure**: `max-inline-size: max(48ch, 64ch)` for optimal line-length readability (approx. 45–75 characters per line).

---

## 5. Spacing & Spatial System

A mathematical spacing scale provides rhythm and alignment throughout the UI:

| Token | Size | Typical Application |
| :--- | :--- | :--- |
| `--xxs` | `0.125rem` (2px) | Hairline borders, active indicator lines, micro-offsets |
| `--xs` | `0.25rem` (4px) | Tight element padding, tag badges, demo links |
| `--s` | `0.5rem` (8px) | Border radius, icon spacing, compact gaps |
| `--m` | `1.0rem` (16px) | Standard component padding, container margins |
| `--l` | `1.25rem` (20px) | Intermediate spatial breaks |
| `--xl` | `1.5rem` (24px) | Section separation, icon container dimensions |
| `--xxl` | `2.0rem` (32px) | Major structural gaps and popover exit offsets |
| `--xxxl`| `3.0rem` (48px) | Hero typography sizing and macro spacing |

---

## 6. Components & Interaction Patterns

### 6.1 Interactive Brand Buttons & Popovers

Brand names are native `<button type="button" class="brand" popovertarget="[id]">` elements triggering native HTML Popovers.

```
[Brand Button: SBE] ─────────► [Popover Dialog: SBE Overview]
   • Hover: Weight 800,           • Native Popover API (Top layer)
     Amber outline                • CSS Anchor Positioning / Centered
                                  • Backdrop blur on sibling content
                                  • @starting-style smooth elevation
```

- **Backdrop Focus Blur**: `main:has(~ .popover:popover-open) :not(.popover)` applies `filter: blur(4px) opacity(.64) hue-rotate(206deg)` for visual depth.
- **Entry / Exit Animation**: Utilizes `@starting-style` and `display: allow-discrete` / `overlay: allow-discrete` for zero-JS CSS exit transitions.

### 6.2 Depth-Layered Contact Links

Interactive links feature a multi-tiered inset box-shadow using OKLCH color spaces to simulate a physical letterpress/neon ink effect:

```css
.link-contact {
    box-shadow:
        inset 0 -1px 0 0 oklch(from #4a98bf l c h),
        inset 0 -2px 0 0 oklch(from rgba(74, 152, 191, .76) l c h),
        inset 0 -6px 0 0 oklch(from rgba(74, 152, 191, .52) l c h),
        inset 0 -10px 0 0 oklch(from rgba(74, 152, 191, .28) l c h);
    transition: box-shadow var(--link-ease) var(--link-timing);
}
```

### 6.3 Lab Experiments Grid & Squircles

- **Responsive Grid**: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` with container queries (`cqi`).
- **Squircle Corners**: `@supports (corner-shape: squircle) { corner-shape: squircle; border-radius: 1.5rem; }`.
- **Card Motion**: Staggered entrance via `sibling-index()` animation delays, vertical lift on hover (`translateY(-.75rem)`), and glassmorphic demo trigger buttons (`backdrop-filter: blur(4px)`).

### 6.4 Resume Job Accordions

- Implemented using native `<details class="job" name="job">` with exclusive accordion behavior via the `name` attribute.
- Accessible `<summary>` triggers styled with clean date formatting and role metadata.

---

## 7. Motion & Transition System

### 7.1 Multi-Page View Transitions API

Seamless cross-document page transitions without client-side SPA routing overhead:

```css
@view-transition {
    navigation: auto;
}

::view-transition-old(cover) {
    animation: fade-out .4s, move-down .36s;
    animation-delay: .1s;
}

::view-transition-new(cover) {
    animation: fade-in .4s, move-up .36s;
}
```

### 7.2 Easing & Timings

- `--link-timing`: `444ms`
- `--link-ease`: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- `--ease-3`: `cubic-bezier(0.25, 0, 0.3, 1)`
- `interpolate-size: allow-keywords`: Smooth animations to intrinsic keywords like `fit-content` and `auto`.

### 7.3 Accessibility & Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- Animation durations clamp to `0.01ms`.
- Staggered letter animations and view transition motions are neutralized to instant state switches.

---

## 8. Performance & Delivery Standards

1. **Font Loading**: `fonts/recursive-variable.woff2` preloaded with `unicode-range` sub-setting.
2. **Speculation Rules**: Instant pre-rendering and pre-fetching of MPA pages via `<script type="speculationrules">`.
3. **Async Asset Loading**: Non-blocking stylesheets and deferred JavaScript modules (`scripts/favicon-animator.js`, `scripts/analytics.js`).
4. **Service Worker (`sw.js`)**: Offline resilience and network-first caching strategy.

---

## 9. Living Pattern Library

For live, interactive verification of all design tokens, components, button states, popovers, and motion curves, inspect:
- **Local File**: [`pattern-library.html`](file:///Users/robertjames/dev/rjames/pattern-library.html)
- **Production URL**: `https://robertjames.nyc/pattern-library.html`

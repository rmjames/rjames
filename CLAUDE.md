# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Robert James, a UX Engineer. The site is a multi-page application (MPA) built with vanilla JavaScript, HTML, and CSS. It showcases modern web features including View Transitions API, Popover API, service workers, and CSS Anchor Positioning.

## Development Commands

### Local Development
- **Start dev server**: `npm start` (runs http-server on port 3000)
- **Run unit tests**: `npm test` (runs Vitest with jsdom environment)
- **Run E2E tests**: `npm run e2e` (runs Playwright tests with auto-start dev server)

### Testing
- **Single test file**: `npx vitest scripts/analytics.test.js`
- **E2E specific project**: `npx playwright test --project=chromium`
- **E2E headed mode**: `npx playwright test --headed`
- **Update visual snapshots**: `npx playwright test --update-snapshots`

## Architecture & Codebase Map

### Curated Structural Map (Depth 2-3)
```
├── [Root HTML & Worker]
│   ├── index.html                       # Homepage (bio, brand interaction popovers)
│   ├── resume.html                      # Resume and professional history
│   ├── lab.html                         # Interactive lab experiments hub
│   ├── pattern-library.html             # Component & design token catalog
│   └── sw.js                            # Service worker (offline cache & network-first strategy)
├── styles/                              # Modular CSS (oklch, CSS nesting, layers)
│   ├── main.css                         # Stylesheet entry point (imports base, layout, components)
│   ├── base/                            # reset.css, typography.css, variables.css
│   ├── layout/                          # structure.css, header.css, footer.css
│   ├── components/                      # buttons, popovers, media-player, icons, skip-link
│   ├── lab/                             # Specific experiment styles (loaders, checkouts, logos)
│   └── utilities/                       # animations.css, mpa.css (view transitions)
├── scripts/                             # Client-side ESNext modules
│   ├── index.js                         # Core client boot & service worker registration
│   ├── analytics.js                     # GA event tracking (navigation, popovers, visibility)
│   ├── AudioLibrary.js                  # Audio metadata catalog and playlist management
│   ├── media/                           # Modular audio engine (MediaPlayerCore, Equalizer, UI)
│   ├── lab/                             # Interactive animation & experiment controllers
│   ├── utils/                           # Shared utilities (ColorExtractor, splitText, labNav)
│   └── test/                            # Unit tests for client scripts
├── functions/api/                       # Cloudflare Pages / Workers serverless API routes
│   └── episodes/[episodeId]/stream-url.js # Streaming audio URL resolution
├── lab/                                 # Prototype HTML pages, case study markdown, and widgets
├── tools/                               # Developer visual tools & test harness (point-visualizer)
├── tests/                               # Vitest unit test suites (tests/unit/media)
├── tests-e2e/                           # Playwright E2E suites (analytics, media, visual, ux)
└── evals/                               # Performance & security audit harness and fixtures
```

### Key Modules & Responsibilities
- **HTML Pages**: `index.html` (main portfolio & popovers), `resume.html`, `lab.html` (experiments), `pattern-library.html`.
- **CSS Architecture**: Modular stylesheets under `styles/` imported into `styles/main.css`. Follows cascade layers, CSS nesting, and `oklch()` color tokens.
- **Audio Engine**: `scripts/media/` contains `MediaPlayerCore.js`, `Equalizer.js`, and `MediaPlayerUI.js` backed by Cloudflare Worker API routes in `functions/api/`.
- **Testing**:
  - Unit tests in `tests/` and `scripts/test/` (Vitest with jsdom).
  - End-to-end and visual regression in `tests-e2e/` (Playwright across mobile, tablet, desktop viewports).
  - Security and performance evaluations in `evals/`.

### Modern Web Features Used
- **View Transitions API**: For smooth page transitions between index/work/resume pages with custom nav link animations
- **Popover API**: Company detail popovers triggered by brand buttons
- **CSS Anchor Positioning**: Used for popover positioning (check browser support fallbacks)
- **Service Workers**: Offline-first caching strategy with sw.js
- **Intersection Observer**: For tracking section visibility in analytics

### Key Implementation Details
- All CSS is loaded asynchronously using the `media="print"` onload trick with noscript fallbacks
- Navigation uses View Transitions with custom border animations (`animate-border-in`, `animate-border-out`, `force-border-full`)
- Analytics tracks clicks, hovers, section views, and popover interactions via Google Analytics
- Playwright tests run against http://127.0.0.1:3000 with automatic server startup
- Visual regression tests configured with 1% max pixel diff ratio tolerance

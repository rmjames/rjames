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

## Architecture

### HTML Pages
- `index.html` - Homepage with about section and brand interaction popovers
- `resume.html` - Resume page
- `lab.html` - Experimental/lab page
- `pattern-library.html` - Component pattern library

### JavaScript Modules
- **`scripts/analytics.js`** - Google Analytics event tracking (header/footer nav, section visibility, brand interactions, popover engagement)
- **`scripts/nav-transitions.js`** - Navigation state management with View Transitions API for page transitions and animated border effects
- **`scripts/index.js`** - Service worker registration and View Transitions setup
- **`sw.js`** - Service worker for offline caching with network-first strategy

### CSS
- **`styles/main.css`** - Main stylesheet (async loaded with media="print" trick)
- **`styles/mpa.css`** - Multi-page application specific styles (async loaded)

### Testing
- **Unit tests**: Vitest with jsdom for testing analytics event tracking and navigation logic
- **E2E tests**: Playwright configured for multiple devices/viewports (desktop, tablet, mobile)
- **Visual regression**: Screenshot comparisons for all pages across different device configurations

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

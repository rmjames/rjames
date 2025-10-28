# Robert James - Portfolio

Personal portfolio website showcasing UX Engineering work with modern web features and enterprise-grade authentication.

## Overview

This is a multi-page application (MPA) portfolio site featuring:
- Modern web platform features (View Transitions API, Popover API, CSS Anchor Positioning)
- Password-protected portfolio project pages
- Responsive design with CSS Grid and Flexbox
- Service worker for offline functionality
- Google Analytics integration with privacy-focused tracking

## Tech Stack

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5 with modern web APIs
- CSS3 with custom properties, Grid, Flexbox
- Service Worker for offline support

**Backend:**
- Cloudflare Workers for edge authentication
- Cloudflare KV for session management
- SHA-256 password hashing

**Testing:**
- Vitest for unit tests
- Playwright for E2E and visual regression tests

## Project Structure

```
/
├── index.html              # Homepage with company showcases
├── resume.html             # Resume page
├── lab.html               # Experimental features
├── pattern-library.html   # Component library
├── scripts/
│   ├── analytics.js       # Google Analytics tracking
│   ├── nav-transitions.js # View Transitions API navigation
│   └── index.js          # Service worker registration
├── styles/
│   ├── main.css          # Core styles
│   ├── mpa.css           # Multi-page app styles
│   └── fonts.css         # Self-hosted font definitions
├── sw.js                 # Service worker
├── work/                 # Cloudflare Worker authentication
│   ├── secure-worker.js  # Authentication worker
│   ├── wrangler.toml     # Worker configuration
│   ├── README.md         # Worker documentation
│   └── PRODUCTION_SETUP.md # Production deployment guide
└── tests/
    └── e2e/              # Playwright tests
```

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start  # Runs on http://localhost:3000
   ```

3. **Run tests:**
   ```bash
   npm test  # Unit tests with Vitest
   npm run e2e  # E2E tests with Playwright
   ```

### Authentication Worker Setup

For password-protected portfolio pages:

1. **Navigate to work directory:**
   ```bash
   cd work
   ```

2. **Start Cloudflare Worker locally:**
   ```bash
   wrangler dev --port 8787
   ```

3. **See work/README.md** for complete setup instructions

## Features

### Modern Web Platform

**View Transitions API:**
- Smooth page transitions between routes
- Custom animations for navigation elements
- Progressive enhancement with fallbacks

**Popover API:**
- Native popover functionality for company showcases
- Keyboard navigation support
- No JavaScript required for basic functionality

**CSS Anchor Positioning:**
- Dynamic popover positioning
- Responsive layout without JavaScript
- Graceful fallbacks for unsupported browsers

### Authentication

**Project-Specific Protection:**
- 8 unique portfolio projects, each with own password
- Enterprise-grade security (SHA-256 hashing, rate limiting)
- Session management with IP binding
- Automatic lockout after failed attempts

**Security Features:**
- HttpOnly, Secure, SameSite cookies
- CSRF protection
- Security headers (HSTS, XSS Protection)
- Zero hardcoded values (environment-based config)

### Performance

**Optimizations:**
- Async CSS loading with `media="print"` onload trick
- Self-hosted fonts with preloading
- Lazy-loaded Google Analytics
- Service worker caching (network-first strategy)
- Minified and compressed assets

**Current Scores:**
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 100
- Lighthouse Best Practices: 100

## Development

### Available Commands

```bash
# Development server
npm start

# Unit tests (Vitest)
npm test

# E2E tests (Playwright)
npm run e2e

# Run specific test file
npx vitest scripts/analytics.test.js

# Run E2E tests in headed mode
npx playwright test --headed

# Update visual snapshots
npx playwright test --update-snapshots
```

### Development Guidelines

See `CLAUDE.md` for complete development guidelines including:
- Architecture overview
- Modern web features usage
- Testing strategy
- Performance considerations

### Code Style

See `AGENTS.md` for coding standards:
- WCAG 2.0 compliance
- Baseline 2025 web standards
- Responsive design patterns
- Performance best practices

## Authentication System

The portfolio uses Cloudflare Workers for protecting individual project pages:

**Protected Projects:**
- Corteva (Agricultural Technology)
- Microsoft (Enterprise Software)
- Bank of America (Financial Services)
- Royal Caribbean (Hospitality)
- Weber Shandwick (Marketing Agency)
- Macmillan (Publishing)
- Guardian (Media)
- SBE (Hospitality)

**Setup:** See `work/README.md` for local development and `work/PRODUCTION_SETUP.md` for production deployment.

## Testing

### Unit Tests (Vitest)
- Analytics event tracking
- Navigation state management
- Utility functions

### E2E Tests (Playwright)
- Cross-browser testing (Chrome, Firefox, Safari)
- Multi-device viewports (desktop, tablet, mobile)
- Visual regression testing
- Navigation transitions
- Popover interactions

### Visual Regression
- Screenshot comparisons across devices
- 1% max pixel difference tolerance
- Automated on pull requests

## Deployment

### Static Site

The main site can be deployed to any static host:
- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

### Authentication Worker

Deploy to Cloudflare Workers:
```bash
cd work
wrangler deploy --env production
```

See `work/PRODUCTION_SETUP.md` for complete instructions.

## Browser Support

**Modern Browsers:**
- Chrome/Edge 119+
- Firefox 117+
- Safari 17.1+

**Progressive Enhancement:**
- View Transitions fallback to instant navigation
- Popover API degrades to toggle with JavaScript
- CSS Anchor Positioning has manual positioning fallback

## Cost

**Hosting:** Free (static hosting on Cloudflare Pages)

**Cloudflare Workers Free Tier:**
- 100,000 requests/day
- 1 GB KV storage
- 100,000 KV reads/day

**Typical usage:** ~1,000 requests/day = $0/month

## Resources

**Documentation:**
- [CLAUDE.md](CLAUDE.md) - Project overview for Claude Code
- [AGENTS.md](AGENTS.md) - Development guidelines
- [work/README.md](work/README.md) - Authentication setup
- [work/PRODUCTION_SETUP.md](work/PRODUCTION_SETUP.md) - Production deployment

**External Resources:**
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## License

© 2025 Robert James. All rights reserved.

---

**Last Updated:** 2025

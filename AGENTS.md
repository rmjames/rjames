## Guiding Principles
- **WCAG 2.0 Compliance**: Adhere to [WCAG 2.0](https://www.w3.org/TR/WCAG20/) for accessibility.
- **Modern Standards**: Build with [Baseline 2025](https://web.dev/baseline/2025) features.
- **Responsive Design**: Use CSS Grid/Flexbox with logical properties and relative units (`rem`, `ch`, `%`). Prefer `inline-size`/`block-size` over `width`/`height`.
- **Performance**: Optimize assets and load CSS (`media="print"`), JS (`defer`), and images (`loading="lazy"`) asynchronously.
- **Security & Privacy**: Protect against CSRF, XSS, SQL injection, and OWASP vulnerabilities. Always sanitize and obfuscate PII (Personally Identifiable Information — e.g., emails, phone numbers, real credentials, tokens, IP addresses), domain URLs, and cloud service/resource names in logs, tests, mock data, and documentation to prevent target enumeration (`user@example.com`, `https://example.com`, `[REDACTED_SECRET]`, `[REDACTED_CLOUD_RESOURCE]`, `[REDACTED_PII]`).

## Modern CSS & HTML Standards
- **Modern Features**: Leverage CSS nesting, cascade layers, view transitions, container queries, scroll-driven animations, `:has()`, and `text-wrap: balance`.
- **Styling**: Use `oklch()` colors, `light-dark()` themes, and interpolation colorspaces in gradients (e.g., `in oklab`). 
- **Code Quality**: Avoid pre-2018 "tricks". Remove preceding zeros on floats (e.g., `.5` instead of `0.5`). Use custom properties for repeated values.
- **Accessibility**: Use semantic HTML5 and follow best practices for interactive elements.

## Coding Style & Workflow
- **Self-Improvement**: All agents must follow the workflow outlined in `.fact/self_improvement.md` (using `scratchpad.md` and `knowledge.md`) to plan tasks and retain knowledge.
- **Tech Stack**: Use latest HTML5, CSS3, ESNext, TypeScript, and Node.js.
- **Quality**: Write functional, composable, and stateful code. Avoid race conditions.
- **Testing**: Run tests after every change and fix failures immediately.
  - Any change to a file should result in tests being run against that file. Test should be updated to reflect the change. 
- **Linting**: Follow the defined ESLint rules (see below).
- **Version Control**: Use conventional commits and detailed messages.

## ESlint Rules
```json
{
  "env": { "browser": true, "es2021": true, "node": true },
  "extends": "eslint:recommended",
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "rules": {
    "no-unused-vars": "warn",
    "no-inner-declarations": "warn",
    "no-empty": "warn",
    "no-useless-escape": "warn"
  },
  "globals": { "dataLayer": true, "gtag": true }
}
```

## Constraints & Communication
- **Consultation**: Always ask before making architectural decisions or breaking changes.
- **Clarity**: Be direct, casual, and concise. State conclusions early.
- **Objectivity**: Minimize use of first-person ("I") in technical responses.

## Codebase Architecture & File Tree
Curated structural map for zero-turn agent navigation (depth 2-3):
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
*Navigation Rule*: Use this structural map for immediate orientation. Use `find_by_name` or `grep_search` to pinpoint leaf files without recursive directory scans.
* If project file structure changes update `Codebase Architecture & File Tree` 

## References
- [Baseline 2025](https://web.dev/baseline/2025) | [Webstatus.dev](https://webstatus.dev/)
- [WCAG 2.0](https://www.w3.org/TR/WCAG20/) | [Web.dev](https://web.dev/) | [MDN](https://developer.mozilla.org/en-US/)


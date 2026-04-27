## Guiding Principles
- **WCAG 2.0 Compliance**: Adhere to [WCAG 2.0](https://www.w3.org/TR/WCAG20/) for accessibility.
- **Modern Standards**: Build with [Baseline 2025](https://web.dev/baseline/2025) features.
- **Responsive Design**: Use CSS Grid/Flexbox with logical properties and relative units (`rem`, `ch`, `%`). Prefer `inline-size`/`block-size` over `width`/`height`.
- **Performance**: Optimize assets and load CSS (`media="print"`), JS (`defer`), and images (`loading="lazy"`) asynchronously.
- **Security**: Protect against CSRF, XSS, SQL injection, and other OWASP vulnerabilities.

## Modern CSS & HTML Standards
- **Modern Features**: Leverage CSS nesting, cascade layers, view transitions, container queries, scroll-driven animations, `:has()`, and `text-wrap: balance`.
- **Styling**: Use `oklch()` colors, `light-dark()` themes, and interpolation colorspaces in gradients (e.g., `in oklab`). 
- **Code Quality**: Avoid pre-2018 "tricks". Remove preceding zeros on floats (e.g., `.5` instead of `0.5`). Use custom properties for repeated values.
- **Accessibility**: Use semantic HTML5 and follow best practices for interactive elements.

## Coding Style & Workflow
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

## References
- [Baseline 2025](https://web.dev/baseline/2025) | [Webstatus.dev](https://webstatus.dev/)
- [WCAG 2.0](https://www.w3.org/TR/WCAG20/) | [Web.dev](https://web.dev/) | [MDN](https://developer.mozilla.org/en-US/)


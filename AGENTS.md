# Agent Directives

This document provides guidelines for agents working on this repository.

## Guiding Principles

- **WCAG 2.0 Compliance**: All web-related development must adhere to the [Web Content Accessibility Guidelines (WCAG) 2.0](https://www.w3.org/TR/WCAG20/) to ensure our work is accessible to everyone.
- **Modern Standards**: Solutions should be built using modern web standards. We adhere to [Baseline 2025](https://web.dev/baseline/2025), which defines a core set of web platform features supported by all major browsers.
- **Responsive Design**: All user interfaces must be responsive.
    - **Layout**: Use CSS Grid and Flexbox for layout by default.
    - **Units**: Prefer relative and intrinsic units (e.g., `rem`, `em`, `%`, `vw`, `vh`, `min-content`, `max-content`) over absolute units.
    - **Container Queries**: Use container queries where appropriate to create more resilient responsive components.
- **Performance**: Code and solutions should be performant. This includes optimizing assets, minimizing network requests, and writing efficient code.
    - All CSS should be loaded asynchronously using the `media="print"` onload trick with noscript fallbacks
    - All JS should be loaded asynchronously using the `defer` attribute
    - All images should be loaded asynchronously using the `loading="lazy"` attribute


## References

- [WCAG 2.0](https://www.w3.org/TR/WCAG20/)
- [Baseline 2025](https://web.dev/baseline/2025)
- [Web.dev](https://web.dev/)
- [MDN](https://developer.mozilla.org/en-US/)

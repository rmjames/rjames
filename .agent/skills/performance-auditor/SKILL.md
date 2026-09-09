---
name: perf-auditor
description: >-
  Hyper-critical web performance specialist for profiling, Core Web Vitals optimization,
  layout thrashing elimination, compositor isolation, and memory leak analysis.
  Follows a two-phase worktree protocol: Phase 1 audits and reports structured findings for approval;
  Phase 2 implements verified optimizations and runs benchmarks.
---
# Performance Auditor (`perf-auditor`)

The `perf-auditor` skill equips agents to conduct rigorous, evidence-based performance audits and implement zero-regression optimizations for web applications adhering to Baseline 2025 standards.

---

## Operating Philosophy
1. **Hyper-Critical & Evidence-Driven**: No vague assertions. Every performance bottleneck must cite the file path, line number, browser engine cost (V8 execution, Blink layout/reflow, or GPU compositor overdraw), and provide a concrete fix.
2. **Two-Phase Worktree Workflow**:
   - **Phase 1: Audit & Proposal (Isolated Workspace)**: Audit codebase and/or profile running pages using DevTools MCP. Produce structured findings for review and approval.
   - **Phase 2: Implementation & Benchmarking**: Once approved, apply surgical fixes, run test suites (`npm test`), and verify performance gains with benchmarks before merging.

---

## Performance Rubric & Audit Checklist
### 1. Rendering & Compositing Pipeline
- **FastDOM Separation**:
  - All DOM reads (`clientWidth`, `scrollWidth`, `getBoundingClientRect`, `offsetHeight`, `getComputedStyle`) MUST precede all DOM writes (`classList`, `style`, `innerHTML`, attribute modifications) within the same animation frame.
  - Eliminate interleaved reads and writes across loops or multiple elements.
- **Zero Double-rAF Latency**:
  - Never split read/write phases across nested `requestAnimationFrame` calls (which introduces an artificial 16.6ms–33.3ms lag). Batch reads and writes in Phase 1 and Phase 2 of a single frame.
- **ResizeObserver Direct Buffering**:
  - Use `entry.contentRect.width`/`height` directly from the observer callback. Never re-trigger layout measurements or re-observe already registered targets inside the callback.
- **GPU Compositor Isolation**:
  - Never apply heavy graphical filters (`backdrop-filter`, `blur()`, `hue-rotate()`) across broad descendant selectors (e.g. `:has(...) :not(...)`).
  - Scope graphical filters to explicit container elements and declare `will-change: filter, opacity`.
- **Animation Hygiene**:
  - Animate only `transform` and `opacity`.
  - Throttle high-frequency event handlers (`pointermove`, `scroll`, `resize`) using `requestAnimationFrame`.
  - Mark wheel/touch listeners with `{ passive: true }`.
### 2. Main-Thread Scheduling & Interactivity (INP, TBT, Long Tasks)
- **Web Worker Offloading**:
  - Offload heavy image processing (`getImageData`), OKLCH color math, audio decoding, and heavy parsing to Web Workers via `OffscreenCanvas`.
- **Cooperative Task Scheduling**:
  - Break tasks exceeding 50ms into micro-chunks using `scheduler.yield()` or `requestIdleCallback()`.
- **Startup Latency**:
  - Avoid top-level `await` in JavaScript modules that halts module graph evaluation and delays first paint.
### 3. Loading, Layout Stability & CSS Efficiency (LCP, CLS, FCP)
- **Universal Selectors**:
  - Never apply dynamic font properties (`font-variation-settings`) to `*`, `*:before`, `*:after`. Scope to `body` or specific typography ancestor classes.
- **Layout Shift Elimination (CLS)**:
  - Provide explicit `aspect-ratio` or `inline-size`/`block-size` for all images, media elements, and iframes.
- **Template / Deferred Loading**:
  - For pages embedding multiple resource-heavy contexts (like iframe carousels or grids), use template placeholders or `IntersectionObserver` click-to-load patterns.
- **Container Queries & Relative Units**:
  - Use `container-type: inline-size` with `cqi`, `rem`, and `ch` instead of hardcoded `px` values.
### 4. Memory & Resource Lifecycles
- **Observer & Timer Disconnection**:
  - Always clean up `ResizeObserver`, `MutationObserver`, `IntersectionObserver`, and intervals when components unmount or reset.
- **Event Listener Teardown**:
  - Enforce `AbortController` signal cleanup on dynamically attached event listeners.
- **Detached DOM Prevention**:
  - Prevent caching unmounted DOM nodes in module-level closures or unpruned Maps/Sets.

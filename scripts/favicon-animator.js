/**
 * Favicon Animator: Full Loop Once
 * Animation sequence: Circle (2s) -> Target (0.5s) -> Target (1.5s) -> Circle (0.5s) -> STOP.
 * Refactored to use SVG data URIs for zero-jank performance (PERF-18).
 */
(function () {

  const FPS_TARGET = 10; // 10 FPS is plenty for a favicon and saves CPU
  const PAINT_INTERVAL = 1000 / FPS_TARGET;
  const STROKE_WIDTH = .075; // Thinner stroke width for favicon rendering (reduced from 0.125)
  const STROKE_COLOR = '%23f59e0b';

  const timing = {
    hold1: 2000,
    morph1: 500,
    hold2: 1500,
    morph2: 500
  };
  const totalDuration = timing.hold1 + timing.morph1 + timing.hold2 + timing.morph2;

  function flatten(pts) {
    const flat = new Float32Array(pts.length * 6 - 4);
    flat[0] = pts[0][0]; flat[1] = pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      for (let j = 0; j < 6; j++) flat[(i - 1) * 6 + 2 + j] = pts[i][j];
    }
    return flat;
  }

  function generateCircle12() {
    const r = 0.375; const cx = 0.5; const cy = 0.5;
    const pts = [[cx, cy - r]]; const segments = 12; const angleStep = (Math.PI * 2) / segments;
    const f = (4 / 3) * Math.tan(angleStep / 4);
    for (let i = 1; i <= segments; i++) {
      const sT = (i - 1) * angleStep - Math.PI / 2; const eT = i * angleStep - Math.PI / 2;
      pts.push([cx + r * Math.cos(sT) - f * r * Math.sin(sT), cy + r * Math.sin(sT) + f * r * Math.cos(sT), cx + r * Math.cos(eT) + f * r * Math.sin(eT), cy + r * Math.sin(eT) - f * r * Math.cos(eT), cx + r * Math.cos(eT), cy + r * Math.sin(eT)]);
    }
    return flatten(pts);
  }

  const circle = generateCircle12();

  const house = flatten([
    [0.5, 0.156],
    [0.6, 0.26, 0.7, 0.36, 0.781, 0.469], [0.781, 0.469, 0.781, 0.469, 0.781, 0.469], [0.781, 0.469, 0.781, 0.469, 0.781, 0.469],
    [0.781, 0.6, 0.781, 0.72, 0.781, 0.844], [0.781, 0.844, 0.781, 0.844, 0.781, 0.844], [0.781, 0.844, 0.781, 0.844, 0.5, 0.844],
    [0.4, 0.844, 0.3, 0.844, 0.219, 0.844], [0.219, 0.844, 0.219, 0.844, 0.219, 0.844], [0.219, 0.844, 0.219, 0.844, 0.219, 0.469],
    [0.219, 0.469, 0.219, 0.469, 0.219, 0.469], [0.25, 0.36, 0.4, 0.26, 0.5, 0.156], [0.5, 0.156, 0.5, 0.156, 0.5, 0.156]
  ]);

  const flask = flatten([
    [0.41, 0.06],
    [0.45, 0.06, 0.55, 0.06, 0.59, 0.06],
    [0.59, 0.15, 0.59, 0.22, 0.59, 0.31],
    [0.59, 0.4, 0.7, 0.5, 0.8, 0.6],
    [0.9, 0.75, 0.97, 0.85, 0.97, 0.94],
    [0.8, 0.94, 0.65, 0.94, 0.5, 0.94],
    [0.35, 0.94, 0.2, 0.94, 0.03, 0.94],
    [0.03, 0.85, 0.1, 0.7, 0.2, 0.6],
    [0.25, 0.5, 0.35, 0.4, 0.41, 0.31],
    [0.41, 0.22, 0.41, 0.15, 0.41, 0.06],
    [0.41, 0.06, 0.41, 0.06, 0.41, 0.06], [0.41, 0.06, 0.41, 0.06, 0.41, 0.06], [0.41, 0.06, 0.41, 0.06, 0.41, 0.06]
  ]);

  const headphone = flatten([
    [0.5, 0.15],
    [0.72, 0.15, 0.82, 0.25, 0.82, 0.42],
    [0.82, 0.45, 0.85, 0.48, 0.85, 0.52],
    [0.95, 0.55, 0.95, 0.7, 0.95, 0.85],
    [0.95, 0.93, 0.75, 0.93, 0.75, 0.85],
    [0.75, 0.75, 0.7, 0.65, 0.7, 0.55],
    [0.7, 0.42, 0.65, 0.38, 0.5, 0.38],
    [0.35, 0.38, 0.3, 0.42, 0.3, 0.55],
    [0.3, 0.65, 0.25, 0.75, 0.25, 0.85],
    [0.25, 0.93, 0.05, 0.93, 0.05, 0.85],
    [0.05, 0.7, 0.05, 0.55, 0.15, 0.52],
    [0.15, 0.48, 0.18, 0.45, 0.18, 0.42],
    [0.18, 0.25, 0.28, 0.15, 0.5, 0.15]
  ]);

  const file = flatten([
    [0.30, 0.12],
    [0.30, 0.12, 0.45, 0.12, 0.60, 0.12],
    [0.60, 0.12, 0.58, 0.18, 0.56, 0.25],
    [0.56, 0.25, 0.65, 0.23, 0.73, 0.21],
    [0.73, 0.21, 0.68, 0.16, 0.60, 0.12],
    [0.60, 0.12, 0.66, 0.16, 0.73, 0.21],
    [0.73, 0.21, 0.73, 0.40, 0.73, 0.60],
    [0.73, 0.60, 0.73, 0.80, 0.73, 0.88],
    [0.73, 0.88, 0.73, 0.94, 0.67, 0.94],
    [0.67, 0.94, 0.50, 0.94, 0.33, 0.94],
    [0.33, 0.94, 0.27, 0.94, 0.27, 0.88],
    [0.27, 0.88, 0.27, 0.50, 0.27, 0.18],
    [0.27, 0.18, 0.27, 0.12, 0.30, 0.12]
  ]);

  const path = window.location.pathname;
  const isHeadphones = path.includes('headphones.html');
  const isResume = path.includes('resume.html') || document.title.toLowerCase().includes('resume');
  const isLab = path.includes('/lab.html') || path.includes('/lab/') || document.title.toLowerCase().includes('lab');

  const target = isHeadphones ? headphone : (isResume ? file : (isLab ? flask : house));
  const current = new Float32Array(circle.length);

  const favicon = document.getElementById('favicon-svg') || document.querySelector("link[rel*='icon']");
  if (!favicon) return;

  const framesCache = [];
  let isCacheComplete = false;
  let isGenerating = false;
  let rafId = null;
  let startTime = null;
  let lastPaintTime = 0;

  function generateSVGDataURI(pts) {
    let d = `M${pts[0].toFixed(3)} ${pts[1].toFixed(3)}`;
    for (let i = 0; i < 12; i++) {
      const o = i * 6 + 2;
      d += `C${pts[o].toFixed(3)} ${pts[o+1].toFixed(3)} ${pts[o+2].toFixed(3)} ${pts[o+3].toFixed(3)} ${pts[o+4].toFixed(3)} ${pts[o+5].toFixed(3)}`;
    }
    // Using %23 for # to avoid issues in some browsers
    return `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><path d=%22${d}Z%22 fill=%22none%22 stroke=%22${STROKE_COLOR}%22 stroke-width=%22${STROKE_WIDTH}%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>`;
  }

  function pregenerateFrames() {
    if (isCacheComplete || isGenerating) return;
    isGenerating = true;

    let t = 0;
    const generateChunk = (deadline) => {
      while ((!deadline || deadline.timeRemaining() > 1) && t <= totalDuration) {
        if (t < timing.hold1) {
          current.set(circle);
        } else if (t < timing.hold1 + timing.morph1) {
          const progress = (t - timing.hold1) / timing.morph1;
          for (let i = 0; i < current.length; i++) current[i] = circle[i] + (target[i] - circle[i]) * progress;
        } else if (t < timing.hold1 + timing.morph1 + timing.hold2) {
          current.set(target);
        } else if (t < timing.hold1 + timing.morph1 + timing.hold2 + timing.morph2) {
          const progress = (t - (timing.hold1 + timing.morph1 + timing.hold2)) / timing.morph2;
          for (let i = 0; i < current.length; i++) current[i] = target[i] + (circle[i] - target[i]) * progress;
        } else {
          current.set(circle);
        }

        framesCache.push(generateSVGDataURI(current));
        t += PAINT_INTERVAL;
      }

      if (t <= totalDuration) {
        if (window.requestIdleCallback) {
          requestIdleCallback(generateChunk);
        } else {
          setTimeout(() => generateChunk(), 16);
        }
      } else {
        isCacheComplete = true;
        isGenerating = false;
        if (document.hasFocus() && !document.hidden) {
          start();
        }
      }
    };

    if (window.requestIdleCallback) {
      requestIdleCallback(generateChunk);
    } else {
      generateChunk();
    }
  }

  function render(t) {
    if (!isCacheComplete) return;

    const idx = Math.floor(t / PAINT_INTERVAL);
    if (idx >= framesCache.length) {
      favicon.href = framesCache[framesCache.length - 1];
      stop();
      return;
    }

    const nextHref = framesCache[idx];
    if (favicon.getAttribute('href') !== nextHref) {
      favicon.href = nextHref;
    }
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    if (timestamp - lastPaintTime >= PAINT_INTERVAL) {
      render(elapsed);
      lastPaintTime = timestamp;
    }

    if (rafId) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function start() {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!isCacheComplete) {
      pregenerateFrames();
      return;
    }
    stop();
    startTime = null;
    lastPaintTime = 0;
    rafId = requestAnimationFrame(animate);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  const handleFocus = () => {
    if (document.hidden) return;
    setTimeout(start, 100);
  };

  document.addEventListener('visibilitychange', handleFocus);
  window.addEventListener('pageshow', handleFocus);
  window.addEventListener('focus', handleFocus);

  if (document.readyState === 'complete') pregenerateFrames();
  else window.addEventListener('load', pregenerateFrames);
})();

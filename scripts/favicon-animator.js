/**
 * Favicon Animator: Option A (Full Loop Once)
 * Animation sequence: Circle (2s) -> Target (0.5s) -> Target (1.5s) -> Circle (0.5s) -> STOP.
 */
(function () {
  const FPS_TARGET = 30;
  const PAINT_INTERVAL = 1000 / FPS_TARGET;

  const timing = {
    hold1: 2000,   // Circle hold
    morph1: 500,   // Morph to House/Flask
    hold2: 1500,   // Target hold
    morph2: 500    // Morph back to Circle
  };
  const totalDuration = timing.hold1 + timing.morph1 + timing.hold2 + timing.morph2;

  // Shapes (8-segment topology)
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
    [0.6, 0.26, 0.7, 0.36, 0.781, 0.469], [0.781, 0.469, 0.781, 0.469, 0.781, 0.469], [0.781, 0.469, 0.781, 0.469, 0.781, 0.469], // R Eave
    [0.781, 0.6, 0.781, 0.72, 0.781, 0.844], [0.781, 0.844, 0.781, 0.844, 0.781, 0.844], [0.781, 0.844, 0.781, 0.844, 0.5, 0.844], // R Wall to Bot
    [0.4, 0.844, 0.3, 0.844, 0.219, 0.844], [0.219, 0.844, 0.219, 0.844, 0.219, 0.844], [0.219, 0.844, 0.219, 0.844, 0.219, 0.469], // Bot to L Wall
    [0.219, 0.469, 0.219, 0.469, 0.219, 0.469], [0.25, 0.36, 0.4, 0.26, 0.5, 0.156], [0.5, 0.156, 0.5, 0.156, 0.5, 0.156] // L Eave to Peak
  ]);

  const flask = flatten([
    [0.41, 0.06],
    [0.45, 0.06, 0.55, 0.06, 0.59, 0.06], // Rim
    [0.59, 0.15, 0.59, 0.22, 0.59, 0.31], // R Neck
    [0.59, 0.4, 0.7, 0.5, 0.8, 0.6], // R Shoulder
    [0.9, 0.75, 0.97, 0.85, 0.97, 0.94], // R Bulb
    [0.8, 0.94, 0.65, 0.94, 0.5, 0.94], // R Bot
    [0.35, 0.94, 0.2, 0.94, 0.03, 0.94], // L Bot
    [0.03, 0.85, 0.1, 0.7, 0.2, 0.6], // L Bulb
    [0.25, 0.5, 0.35, 0.4, 0.41, 0.31], // L Shoulder
    [0.41, 0.22, 0.41, 0.15, 0.41, 0.06], // L Neck
    [0.41, 0.06, 0.41, 0.06, 0.41, 0.06], [0.41, 0.06, 0.41, 0.06, 0.41, 0.06], [0.41, 0.06, 0.41, 0.06, 0.41, 0.06]
  ]);

  const headphone = flatten([
    [0.5, 0.15],
    [0.72, 0.15, 0.82, 0.25, 0.82, 0.42], // Arch R
    [0.82, 0.45, 0.85, 0.48, 0.85, 0.52], // Neck R
    [0.95, 0.55, 0.95, 0.7, 0.95, 0.85], // Pad R Outer
    [0.95, 0.93, 0.75, 0.93, 0.75, 0.85], // Pad R Bot
    [0.75, 0.75, 0.7, 0.65, 0.7, 0.55], // Pad R Inner
    [0.7, 0.42, 0.65, 0.38, 0.5, 0.38], // Bridge R
    [0.35, 0.38, 0.3, 0.42, 0.3, 0.55], // Bridge L
    [0.3, 0.65, 0.25, 0.75, 0.25, 0.85], // Pad L Inner
    [0.25, 0.93, 0.05, 0.93, 0.05, 0.85], // Pad L Bot
    [0.05, 0.7, 0.05, 0.55, 0.15, 0.52], // Pad L Outer
    [0.15, 0.48, 0.18, 0.45, 0.18, 0.42], // Neck L
    [0.18, 0.25, 0.28, 0.15, 0.5, 0.15] // Arch L
  ]);

  const path = window.location.pathname;
  const isHeadphones = path.includes('headphones.html');
  const isLab = path.includes('/lab.html') || path.includes('/lab/') || document.title.toLowerCase().includes('lab');

  const target = isHeadphones ? headphone : (isLab ? flask : house);
  const current = new Float32Array(circle.length);

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const favicon = document.getElementById('favicon-svg') || document.querySelector("link[rel*='icon']");
  if (!favicon) return;

  const framesCache = [];
  let isCacheComplete = false;
  let rafId = null;
  let startTime = null;
  let lastPaintTime = 0;

  function render(t) {
    // Stage 1: Playback from Cache
    if (isCacheComplete) {
      const idx = Math.floor(t / PAINT_INTERVAL);
      if (idx >= framesCache.length) {
        favicon.href = framesCache[framesCache.length - 1];
        stop();
        return;
      }
      favicon.href = framesCache[idx];
      return;
    }

    // Stage 2: Initial Render & Cache Recording
    if (t >= totalDuration) {
      current.set(circle);
      isCacheComplete = true;
    } else {
      let progress = 0;
      if (t < timing.hold1) {
        current.set(circle);
      } else if (t < timing.hold1 + timing.morph1) {
        progress = (t - timing.hold1) / timing.morph1;
        for (let i = 0; i < current.length; i++) current[i] = circle[i] + (target[i] - circle[i]) * progress;
      } else if (t < timing.hold1 + timing.morph1 + timing.hold2) {
        current.set(target);
      } else if (t < timing.hold1 + timing.morph1 + timing.hold2 + timing.morph2) {
        progress = (t - (timing.hold1 + timing.morph1 + timing.hold2)) / timing.morph2;
        for (let i = 0; i < current.length; i++) current[i] = target[i] + (circle[i] - target[i]) * progress;
      }
    }

    ctx.clearRect(0, 0, 32, 32);
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(current[0] * 32, current[1] * 32);
    for (let i = 0; i < 12; i++) {
      const o = i * 6 + 2;
      ctx.bezierCurveTo(current[o] * 32, current[o + 1] * 32, current[o + 2] * 32, current[o + 3] * 32, current[o + 4] * 32, current[o + 5] * 32);
    }
    ctx.closePath();
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    favicon.href = dataUrl;
    framesCache.push(dataUrl);

    if (isCacheComplete) {
      stop();
    }
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    if (timestamp - lastPaintTime >= PAINT_INTERVAL) {
      render(elapsed);
      lastPaintTime = timestamp;
    }

    // Only schedule the next frame if we haven't stopped
    if (rafId) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function start() {
    stop();
    startTime = null;
    lastPaintTime = 0;

    // If we haven't finished the first full recording yet, 
    // clear any partial frames so the next attempt starts clean.
    if (!isCacheComplete) {
      framesCache.length = 0;
    }

    rafId = requestAnimationFrame(animate);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Visibility & Focus Logic: Re-trigger full loop on focus
  const handleFocus = () => {
    if (document.hidden) return;

    // 100ms buffer gives the browser UI thread a moment to foreground
    // before we start pushing dense favicon updates.
    setTimeout(start, 100);
  };

  document.addEventListener('visibilitychange', handleFocus);
  window.addEventListener('pageshow', handleFocus);
  window.addEventListener('focus', handleFocus);

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();

/**
 * Favicon Animator: Option A (Full Loop Once)
 * Animation sequence: Circle (2s) -> Target (0.5s) -> Target (1.5s) -> Circle (0.5s) -> STOP.
 * Re-triggers on tab focus. Uses Zero-CPU caching after the first render.
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

  function generateCircle8() {
    const r = 0.375; const cx = 0.5; const cy = 0.5;
    const pts = [[cx, cy - r]]; const segments = 8; const angleStep = (Math.PI * 2) / segments;
    const f = (4 / 3) * Math.tan(angleStep / 4);
    for (let i = 1; i <= segments; i++) {
      const sT = (i - 1) * angleStep - Math.PI / 2; const eT = i * angleStep - Math.PI / 2;
      pts.push([cx + r * Math.cos(sT) - f * r * Math.sin(sT), cy + r * Math.sin(sT) + f * r * Math.cos(sT), cx + r * Math.cos(eT) + f * r * Math.sin(eT), cy + r * Math.sin(eT) - f * r * Math.cos(eT), cx + r * Math.cos(eT), cy + r * Math.sin(eT)]);
    }
    return flatten(pts);
  }

  const circle = generateCircle8();
  const house = flatten([[0.5, 0.15], [0.5, 0.15, 0.8, 0.35, 0.8, 0.35], [0.8, 0.35, 0.8, 0.8, 0.8, 0.8], [0.8, 0.8, 0.5, 0.8, 0.5, 0.8], [0.5, 0.8, 0.2, 0.8, 0.2, 0.8], [0.2, 0.8, 0.2, 0.35, 0.2, 0.35], [0.2, 0.35, 0.5, 0.15, 0.5, 0.15], [0.5, 0.15, 0.5, 0.15, 0.5, 0.15], [0.5, 0.15, 0.5, 0.15, 0.5, 0.15]]);
  const flask = flatten([[0.41, 0.06], [0.41, 0.06, 0.59, 0.06, 0.59, 0.06], [0.59, 0.06, 0.59, 0.31, 0.59, 0.31], [0.59, 0.31, 0.97, 0.94, 0.97, 0.94], [0.97, 0.94, 0.5, 0.94, 0.5, 0.94], [0.5, 0.94, 0.03, 0.94, 0.03, 0.94], [0.03, 0.94, 0.25, 0.63, 0.25, 0.63], [0.25, 0.63, 0.41, 0.31, 0.41, 0.31], [0.41, 0.31, 0.41, 0.06, 0.41, 0.06]]);

  const isLab = window.location.pathname.includes('/lab.html') || document.title.toLowerCase().includes('lab');
  const target = isLab ? flask : house;
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
    // Stage 1: Playback from Cache (Zero CPU math)
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
      current.set(circle); // Final state is Circle
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
    for (let i = 0; i < 8; i++) {
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

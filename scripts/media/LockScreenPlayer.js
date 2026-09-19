import { UI } from './MediaPlayerUI.js';
import { EqualizerUI } from './EqualizerUI.js';
import { SVG_PATHS } from './Constants.js';

export const LOCK_SCREEN_ICONS = {
    EQ: "M280-240v-480h80v480h-80ZM440-80v-800h80v800h-80ZM120-400v-160h80v160h-80Zm480 160v-480h80v480h-80Zm160-160v-160h80v160h-80Z",
    PHONE: "M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z",
    PREV: "M240-240v-480h80v480h-80Zm440 0L400-480l280-240v480Z",
    NEXT: "M640-240v-480h80v480h-80ZM280-240v-480l280 240-280 240Z",
    REWIND: "M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5-77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80ZM360-320v-180h-60v-60h120v240h-60Zm140 0q-17 0-28.5-11.5T460-360v-160q0-17 11.5-28.5T500-560h80q17 0 28.5 11.5T620-520v160q0 17-11.5 28.5T580-320h-80Zm20-60h40v-120h-40v120Z",
    RANDOM: "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.59 11.59l-1.41-1.41-1.42 1.41 1.42 1.41 1.41-1.41z",
    LIKE: SVG_PATHS.LIKE,
    LIKE_FILLED: SVG_PATHS.LIKE_FILLED,
    PLAY: SVG_PATHS.PLAY,
    PAUSE: SVG_PATHS.PAUSE
};

function createSvg(doc, pathD, viewBox = "0 -960 960 960", fill = "currentColor") {
    const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", fill);
    svg.appendChild(path);
    return svg;
}

/**
 * Standard factory that builds the modular Lock Screen Media Player component.
 * Used identically by standalone lab page and MediaPlayerSelector carousel.
 *
 * @param {HTMLElement} mount - Parent container where the player is mounted
 * @param {import('./MediaPlayerCore.js').MediaPlayerCore} core - Core audio provider
 * @param {Document} [doc=document] - Document context
 * @returns {object} Controller instance with cleanup & DOM references
 */
export function buildLockScreenPlayer(mount, core, doc = document) {
    const section = doc.createElement('section');
    section.className = 'media-player-grid';

    // Row 1: Equalizer & Phone Buttons
    const row1 = doc.createElement('article');
    row1.className = 'media-player-grid__row';

    const eqBtn = doc.createElement('button');
    eqBtn.className = 'grid-item--eq icon-btn--brand themed-background';
    eqBtn.setAttribute('title', 'Equalizer');
    eqBtn.setAttribute('aria-label', 'Equalizer');
    eqBtn.dataset.analyticsElement = 'Equalizer';
    eqBtn.appendChild(createSvg(doc, LOCK_SCREEN_ICONS.EQ));
    row1.appendChild(eqBtn);

    const phoneBtn = doc.createElement('button');
    phoneBtn.className = 'grid-item--phone icon-btn--brand themed-background';
    phoneBtn.setAttribute('title', 'This Phone');
    phoneBtn.setAttribute('aria-label', 'This Phone');
    phoneBtn.dataset.analyticsElement = 'This Phone';
    phoneBtn.appendChild(createSvg(doc, LOCK_SCREEN_ICONS.PHONE, "0 0 24 24"));
    row1.appendChild(phoneBtn);

    section.appendChild(row1);

    // Row 2: Metadata & Play/Pause Button
    const row2 = doc.createElement('article');
    row2.className = 'media-player-grid__row';

    const meta = doc.createElement('div');
    meta.className = 'media-player__meta';
    const titleEl = doc.createElement('div');
    titleEl.className = 'media-player__meta__title';
    titleEl.textContent = 'Loading...';
    const artistEl = doc.createElement('div');
    artistEl.className = 'media-player__meta__artist';
    artistEl.textContent = '...';
    meta.appendChild(titleEl);
    meta.appendChild(artistEl);
    row2.appendChild(meta);

    const playBtn = doc.createElement('button');
    playBtn.className = 'media-player__play-pause themed-background';
    playBtn.setAttribute('title', 'Play');
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.dataset.analyticsElement = 'Play';
    playBtn.appendChild(createSvg(doc, LOCK_SCREEN_ICONS.PLAY));
    row2.appendChild(playBtn);

    section.appendChild(row2);

    // Row 3: Prev, Slider, Next, Rewind, Option
    const row3 = doc.createElement('article');
    row3.className = 'media-player-grid__row';

    const prevBtn = doc.createElement('button');
    prevBtn.className = 'media-player__prev';
    prevBtn.setAttribute('title', 'Previous');
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.dataset.analyticsElement = 'Previous';
    prevBtn.appendChild(createSvg(doc, LOCK_SCREEN_ICONS.PREV));
    row3.appendChild(prevBtn);

    const progress = doc.createElement('div');
    progress.className = 'media-player__progress';
    const slider = doc.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = '0';
    slider.className = 'progress-slider';
    slider.setAttribute('aria-label', 'Track Progress');
    progress.appendChild(slider);
    row3.appendChild(progress);

    const nextBtn = doc.createElement('button');
    nextBtn.className = 'media-player__next';
    nextBtn.setAttribute('title', 'Next');
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.dataset.analyticsElement = 'Next';
    nextBtn.appendChild(createSvg(doc, LOCK_SCREEN_ICONS.NEXT));
    row3.appendChild(nextBtn);

    const rewindBtn = doc.createElement('button');
    rewindBtn.className = 'media-player__rewind';
    rewindBtn.setAttribute('title', 'Rewind 10s');
    rewindBtn.setAttribute('aria-label', 'Rewind 10s');
    rewindBtn.dataset.analyticsElement = 'Rewind';
    rewindBtn.appendChild(createSvg(doc, LOCK_SCREEN_ICONS.REWIND));
    row3.appendChild(rewindBtn);

    const optBtn = doc.createElement('button');
    optBtn.className = 'media-player__option';
    optBtn.setAttribute('title', 'Random (Mode)');
    optBtn.setAttribute('aria-label', 'Random (Mode)');
    optBtn.dataset.analyticsElement = 'Random';
    optBtn.appendChild(createSvg(doc, LOCK_SCREEN_ICONS.RANDOM, "0 0 24 24"));
    row3.appendChild(optBtn);

    section.appendChild(row3);

    // Equalizer Modal Overlay
    const eqContainer = doc.createElement('div');
    eqContainer.className = 'media-player__equalizer';
    section.appendChild(eqContainer);

    mount.appendChild(section);

    // Equalizer Instance
    let equalizerUI = null;
    if (core && core.audio && typeof EqualizerUI === 'function') {
        try {
            equalizerUI = new EqualizerUI(eqContainer, core.audio, { type: 'simple' });
        } catch {
            // EqualizerUI initialization deferred or unsupported in current environment
        }
    }

    eqBtn.addEventListener('click', () => {
        if (!equalizerUI && core && core.audio && typeof EqualizerUI === 'function') {
            try {
                equalizerUI = new EqualizerUI(eqContainer, core.audio, { type: 'simple' });
            } catch {
                // EqualizerUI initialization deferred or unsupported
            }
        }
        equalizerUI?.show();
    });

    // Option Button State & Mode Switching
    let currentMode = 'random'; // 'random' or 'like'
    let isRandom = false;
    const likedTracks = new Set();

    const optSvg = optBtn.querySelector('svg');
    const optPath = optBtn.querySelector('path');

    const updateOptionUI = () => {
        const isLiked = core.currentTrack && likedTracks.has(core.currentTrack.id);
        if (currentMode === 'random') {
            optSvg?.setAttribute('viewBox', '0 0 24 24');
            optPath?.setAttribute('d', LOCK_SCREEN_ICONS.RANDOM);
            optBtn.title = 'Random (Mode)';
            optBtn.setAttribute('aria-label', 'Random (Mode)');
            optBtn.style.color = isRandom ? 'oklch(0.6 0.2 260 / 0.8)' : 'oklch(from white l c h)';
        } else {
            optSvg?.setAttribute('viewBox', '0 -960 960 960');
            optPath?.setAttribute('d', isLiked ? LOCK_SCREEN_ICONS.LIKE_FILLED : LOCK_SCREEN_ICONS.LIKE);
            optBtn.title = isLiked ? 'Liked (Mode)' : 'Like (Mode)';
            optBtn.setAttribute('aria-label', isLiked ? 'Liked (Mode)' : 'Like (Mode)');
            optBtn.style.color = isLiked ? 'oklch(0.6 0.2 260 / 0.8)' : 'oklch(from white l c h)';
        }
    };

    const cleanupLongPress = UI.setupLongPress(optBtn, {
        onShortPress: () => {
            if (currentMode === 'random') {
                isRandom = !isRandom;
                if (isRandom && typeof core.shuffle === 'function') {
                    core.shuffle();
                } else if (core.currentTrack && typeof core.loadTrack === 'function') {
                    const idx = core.tracks.indexOf(core.currentTrack);
                    if (idx !== -1) core.loadTrack(idx);
                }
            } else if (core.currentTrack) {
                const trackId = core.currentTrack.id;
                if (likedTracks.has(trackId)) likedTracks.delete(trackId);
                else likedTracks.add(trackId);
            }
            updateOptionUI();
        },
        onLongPress: () => {
            currentMode = currentMode === 'random' ? 'like' : 'random';
            optBtn.classList.add('animate-outline', 'pulse');
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
            updateOptionUI();
            setTimeout(() => optBtn.classList.remove('animate-outline', 'pulse'), 320);
        },
        delay: 500
    });
    updateOptionUI();

    // Event Bindings
    playBtn.addEventListener('click', () => core.togglePlay());
    prevBtn.addEventListener('click', () => core.prev());
    nextBtn.addEventListener('click', () => core.next());

    rewindBtn.addEventListener('click', () => {
        if (core.audio) {
            core.audio.currentTime = Math.max(0, core.audio.currentTime - 10);
        }
        rewindBtn.classList.add('animate-rewind');
        setTimeout(() => rewindBtn.classList.remove('animate-rewind'), 200);
    });

    let isSeeking = false;

    slider.addEventListener('pointerdown', () => { isSeeking = true; }, { passive: true });
    slider.addEventListener('touchstart', () => { isSeeking = true; }, { passive: true });

    const handleSeekCommit = () => {
        if (isSeeking) {
            isSeeking = false;
            if (core.audio && core.audio.duration) {
                core.audio.currentTime = (slider.value / 100) * core.audio.duration;
            }
        }
    };

    slider.addEventListener('pointerup', handleSeekCommit, { passive: true });
    slider.addEventListener('touchend', handleSeekCommit, { passive: true });
    slider.addEventListener('change', handleSeekCommit);

    slider.addEventListener('input', () => {
        if (core.audio && core.audio.duration) {
            core.audio.currentTime = (slider.value / 100) * core.audio.duration;
        }
    });

    // Direct Timeupdate listener on audio
    const handleTimeUpdate = () => {
        if (!isSeeking && core.audio && core.audio.duration) {
            const cur = core.audio.currentTime;
            const dur = core.audio.duration;
            if (dur && !isNaN(dur)) {
                slider.value = (cur / dur) * 100;
            }
        }
    };
    core.audio?.addEventListener('timeupdate', handleTimeUpdate);

    // Core Subscriptions
    const unsubscribeCore = core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            UI.updatePlayIcon(playBtn, core.audio ? core.audio.paused : true);
        }
        if (event === 'trackChanged' && data) {
            titleEl.textContent = data.title;
            artistEl.textContent = data.artist;
            slider.value = 0;
            UI.updateBackgroundArt(section, data);
            UI.applyAccentColor(section, data, '--themed-background');
            updateOptionUI();
        }
    });

    // Populate initial track state if available
    const initialTrack = core.currentTrack || (core.tracks && core.tracks[core.currentIndex]);
    if (initialTrack) {
        titleEl.textContent = initialTrack.title;
        artistEl.textContent = initialTrack.artist;
        UI.updateBackgroundArt(section, initialTrack);
        UI.applyAccentColor(section, initialTrack, '--themed-background');
        updateOptionUI();
    }

    return {
        section,
        equalizerUI,
        destroy() {
            cleanupLongPress?.();
            unsubscribeCore?.();
            core.audio?.removeEventListener('timeupdate', handleTimeUpdate);
            UI.unobserveMarquee?.(titleEl);
            UI.unobserveMarquee?.(artistEl);
            section?.remove?.();
        }
    };
}

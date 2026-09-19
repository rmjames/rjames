import { UI } from './MediaPlayerUI.js';
import { SVG_PATHS } from './Constants.js';

export const INLINE_PLAYER_ICONS = {
    PREV: "M240-240v-480h80v480h-80Zm440 0L400-480l280-240v480Z",
    NEXT: "M640-240v-480h80v480h-80ZM280-240v-480l280 240-280 240Z",
    SHUFFLE: "M560-160v-80h164L531-433l56-56 193 193v-164h80v280H560Zm-344 0-56-56 193-193-193-193 56-56 193 193 193-193 56 56-193 193 193 193-56 56-193-193L216-160Z",
    PLAY: SVG_PATHS.PLAY,
    PAUSE: SVG_PATHS.PAUSE,
    LIKE: SVG_PATHS.LIKE,
    LIKE_FILLED: SVG_PATHS.LIKE_FILLED
};

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === null) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function createSvg(doc, pathD, viewBox = "0 -960 960 960", fill = "currentColor") {
    const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    if (fill) svg.setAttribute("fill", fill);
    const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    svg.appendChild(path);
    return svg;
}

/**
 * Standard factory that builds the modular Inline Media Player component.
 * Ensures complete component and DOM parity between lab/media-player-inline.html and
 * lab/media-player-selector.html.
 *
 * @param {HTMLElement} mount - Parent container where the player is mounted
 * @param {import('./MediaPlayerCore.js').MediaPlayerCore} core - Core audio provider
 * @param {Document} [doc=document] - Document context
 * @returns {object} Controller instance with cleanup & DOM references
 */
export function buildInlinePlayer(mount, core, doc = document) {
    const container = doc.createElement('div');
    container.className = 'player-container';

    const section = doc.createElement('section');
    section.className = 'media-player-inline';

    // Meta block
    const meta = doc.createElement('div');
    meta.className = 'media-player-inline__meta';

    const titleEl = doc.createElement('span');
    titleEl.className = 'media-player-inline__title';
    titleEl.textContent = 'Loading...';

    const artistEl = doc.createElement('span');
    artistEl.className = 'media-player-inline__artist';
    artistEl.textContent = 'Artist';

    meta.appendChild(titleEl);
    meta.appendChild(artistEl);
    section.appendChild(meta);

    // Controls block
    const controls = doc.createElement('div');
    controls.className = 'media-player-inline__controls';

    const prevBtn = doc.createElement('button');
    prevBtn.className = 'media-player-inline__prev';
    prevBtn.dataset.analyticsElement = 'Previous';
    prevBtn.title = 'Previous';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.appendChild(createSvg(doc, INLINE_PLAYER_ICONS.PREV));
    controls.appendChild(prevBtn);

    const playBtn = doc.createElement('button');
    playBtn.className = 'media-player-inline__play';
    playBtn.dataset.analyticsElement = 'Play';
    playBtn.title = 'Play';
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.appendChild(createSvg(doc, INLINE_PLAYER_ICONS.PLAY));
    controls.appendChild(playBtn);

    const nextBtn = doc.createElement('button');
    nextBtn.className = 'media-player-inline__next';
    nextBtn.dataset.analyticsElement = 'Next';
    nextBtn.title = 'Next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.appendChild(createSvg(doc, INLINE_PLAYER_ICONS.NEXT));
    controls.appendChild(nextBtn);

    section.appendChild(controls);

    // Progress block
    const progress = doc.createElement('div');
    progress.className = 'media-player-inline__progress';

    const curTimeEl = doc.createElement('span');
    curTimeEl.className = 'media-player-inline__time current';
    curTimeEl.textContent = '0:00';
    progress.appendChild(curTimeEl);

    const slider = doc.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = '0';
    slider.step = '0.1';
    slider.className = 'media-player-inline__slider';
    slider.setAttribute('aria-label', 'Track Progress');
    progress.appendChild(slider);

    const durTimeEl = doc.createElement('span');
    durTimeEl.className = 'media-player-inline__time duration';
    durTimeEl.textContent = '0:00';
    progress.appendChild(durTimeEl);

    section.appendChild(progress);

    // Toggle option button block
    const toggle = doc.createElement('div');
    toggle.className = 'media-player-inline__toggle';

    const optionBtn = doc.createElement('button');
    optionBtn.className = 'media-player-inline__option';
    optionBtn.dataset.analyticsElement = 'Options';
    optionBtn.title = 'Shuffle';
    optionBtn.setAttribute('aria-label', 'Shuffle');
    optionBtn.appendChild(createSvg(doc, INLINE_PLAYER_ICONS.SHUFFLE));
    toggle.appendChild(optionBtn);

    section.appendChild(toggle);
    container.appendChild(section);
    mount.appendChild(container);

    // Event Bindings
    playBtn.addEventListener('click', () => core.togglePlay());
    prevBtn.addEventListener('click', () => core.prev());
    nextBtn.addEventListener('click', () => core.next());

    // Seeking handler
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
        const duration = (core.audio && core.audio.duration) || 0;
        const time = (slider.value / 100) * duration;
        if (core.audio) {
            core.audio.currentTime = time;
        }
        curTimeEl.textContent = formatTime(time);
        const remaining = duration - time;
        durTimeEl.textContent = `-${formatTime(remaining)}`;
    });

    // Multi-mode Option Button (Shuffle/Like)
    let currentMode = 'shuffle';
    let isShuffle = false;
    let isLiked = false;

    const updateOptionVisuals = () => {
        const path = optionBtn.querySelector('path');
        optionBtn.classList.remove('is-active', 'is-liked');

        if (currentMode === 'shuffle') {
            path?.setAttribute('d', INLINE_PLAYER_ICONS.SHUFFLE);
            optionBtn.title = 'Shuffle';
            optionBtn.setAttribute('aria-label', 'Shuffle');
            if (isShuffle) optionBtn.classList.add('is-active');
        } else {
            path?.setAttribute('d', isLiked ? INLINE_PLAYER_ICONS.LIKE_FILLED : INLINE_PLAYER_ICONS.LIKE);
            optionBtn.title = isLiked ? 'Liked' : 'Like';
            optionBtn.setAttribute('aria-label', isLiked ? 'Liked' : 'Like');
            if (isLiked) optionBtn.classList.add('is-liked');
        }
    };

    const handleOptionClick = () => {
        if (currentMode === 'shuffle') {
            isShuffle = !isShuffle;
            if (isShuffle && typeof core.shuffle === 'function') {
                core.shuffle();
            }
        } else {
            isLiked = !isLiked;
        }
        updateOptionVisuals();
    };

    const cleanupOptionLongPress = UI.setupLongPress(optionBtn, {
        onShortPress: () => {
            handleOptionClick();
        },
        onLongPress: () => {
            currentMode = currentMode === 'shuffle' ? 'like' : 'shuffle';
            optionBtn.classList.add('mode-switching', 'pulse');
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(50); } catch { /* ignore */ }
            }
            updateOptionVisuals();
            setTimeout(() => optionBtn.classList.remove('mode-switching', 'pulse'), 300);
        },
        delay: 500
    });
    updateOptionVisuals();

    // Decoupled timeupdate on core.audio
    const handleTimeUpdate = () => {
        if (!isSeeking && core.audio && core.audio.duration) {
            const cur = core.audio.currentTime;
            const dur = core.audio.duration;
            slider.value = (cur / dur) * 100 || 0;
            curTimeEl.textContent = formatTime(cur);
            const remaining = dur - cur;
            durTimeEl.textContent = `-${formatTime(remaining)}`;
        }
    };

    const handleLoadedMetadata = () => {
        if (core.audio && core.audio.duration) {
            const remaining = core.audio.duration - core.audio.currentTime;
            durTimeEl.textContent = `-${formatTime(remaining)}`;
            UI.updateMarquee?.(titleEl);
        }
    };

    core.audio?.addEventListener('timeupdate', handleTimeUpdate);
    core.audio?.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Core Event Subscriptions
    const unsubscribeCore = core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            const isPaused = core.audio ? core.audio.paused : true;
            UI.updatePlayIcon(playBtn, isPaused);
            playBtn.classList.toggle('is-active', !isPaused);
            if (core.audio && core.audio.duration) {
                const remaining = core.audio.duration - core.audio.currentTime;
                durTimeEl.textContent = `-${formatTime(remaining)}`;
            }
        }
        if (event === 'trackChanged' && data) {
            UI.updateTrackInfo({ title: titleEl, artist: artistEl }, data);
            slider.value = 0;
            curTimeEl.textContent = '0:00';
            if (core.audio && core.audio.duration) {
                const remaining = core.audio.duration - core.audio.currentTime;
                durTimeEl.textContent = `-${formatTime(remaining)}`;
            }
            UI.updateMarquee?.(titleEl);
        }
    });

    // Initial track state
    const initialTrack = core.currentTrack || (core.tracks && core.tracks[core.currentIndex]);
    if (initialTrack) {
        UI.updateTrackInfo({ title: titleEl, artist: artistEl }, initialTrack);
        UI.updateMarquee?.(titleEl);
    }
    if (core.audio && core.audio.duration && !isNaN(core.audio.duration)) {
        const remaining = core.audio.duration - (core.audio.currentTime || 0);
        durTimeEl.textContent = `-${formatTime(remaining)}`;
    }

    return {
        container,
        section,
        destroy() {
            cleanupOptionLongPress?.();
            unsubscribeCore?.();
            core.audio?.removeEventListener('timeupdate', handleTimeUpdate);
            core.audio?.removeEventListener('loadedmetadata', handleLoadedMetadata);
            UI.unobserveMarquee?.(titleEl);
            container?.remove?.();
        }
    };
}

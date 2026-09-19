import { UI } from './MediaPlayerUI.js';
import { EqualizerUI } from './EqualizerUI.js';
import { SVG_PATHS } from './Constants.js';

export const MAIN_PLAYER_ICONS = {
    EQUALIZER: "M280-240v-480h80v480h-80ZM440-80v-800h80v800h-80ZM120-400v-160h80v160h-80Zm480 160v-480h80v480h-80Zm160-160v-160h80v160h-80Z",
    REWIND: "M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5-77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80ZM360-320v-180h-60v-60h120v240h-60Zm140 0q-17 0-28.5-11.5T460-360v-160q0-17 11.5-28.5T500-560h80q17 0 28.5 11.5T620-520v160q0 17-11.5 28.5T580-320h-80Zm20-60h40v-120h-40v120Z",
    MUSIC: "M360-400h400L622-580l-92 120-62-80-108 140Zm-40 160q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z",
    PLAY: SVG_PATHS.PLAY,
    PAUSE: SVG_PATHS.PAUSE,
    LIKE: SVG_PATHS.LIKE,
    LIKE_FILLED: SVG_PATHS.LIKE_FILLED
};

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
 * Standard factory that builds the modular Main Media Player component.
 * Ensures complete component and DOM parity between lab/media-player.html and
 * lab/media-player-selector.html.
 *
 * @param {HTMLElement} mount - Parent container where the player is mounted
 * @param {import('./MediaPlayerCore.js').MediaPlayerCore} core - Core audio provider
 * @param {Document} [doc=document] - Document context
 * @returns {object} Controller instance with cleanup & DOM references
 */
export function buildMainPlayer(mount, core, doc = document) {
    const section = doc.createElement('section');
    section.className = 'media-player';

    // Controls bar
    const controls = doc.createElement('div');
    controls.className = 'media-player__controls';

    const currentArtBtn = doc.createElement('button');
    currentArtBtn.className = 'media-player__controls__current';
    currentArtBtn.dataset.analyticsElement = 'Current Track';
    currentArtBtn.setAttribute('aria-label', 'Current Track');
    currentArtBtn.appendChild(createSvg(doc, MAIN_PLAYER_ICONS.MUSIC, "0 -960 960 960", "oklch(from #e3e3e3 l c h)"));
    controls.appendChild(currentArtBtn);

    const meta = doc.createElement('div');
    meta.className = 'media-player__meta';

    const titleEl = doc.createElement('div');
    titleEl.className = 'media-player__meta__title';
    const titleSpan = doc.createElement('span');
    titleSpan.textContent = 'Select Track';
    titleEl.appendChild(titleSpan);

    const artistEl = doc.createElement('div');
    artistEl.className = 'media-player__meta__artist';
    const artistSpan = doc.createElement('span');
    artistSpan.textContent = '...';
    artistEl.appendChild(artistSpan);

    meta.appendChild(titleEl);
    meta.appendChild(artistEl);
    controls.appendChild(meta);

    const optionBtn = doc.createElement('button');
    optionBtn.className = 'media-player__controls__option';
    optionBtn.dataset.analyticsElement = 'Options';
    optionBtn.title = 'Mode: LIKE';
    optionBtn.setAttribute('aria-label', 'Options Mode: LIKE');
    optionBtn.appendChild(createSvg(doc, MAIN_PLAYER_ICONS.LIKE, "0 -960 960 960", "oklch(from #e3e3e3 l c h)"));
    controls.appendChild(optionBtn);

    const playBtn = doc.createElement('button');
    playBtn.className = 'media-player__controls__play';
    playBtn.dataset.analyticsElement = 'Play';
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.appendChild(createSvg(doc, MAIN_PLAYER_ICONS.PLAY, "0 -960 960 960", "oklch(from #e3e3e3 l c h)"));
    controls.appendChild(playBtn);

    section.appendChild(controls);

    // Presets bar
    const presetsContainer = doc.createElement('div');
    presetsContainer.className = 'media-player__presets';
    section.appendChild(presetsContainer);

    // 5-band Equalizer container
    const equalizerContainer = doc.createElement('div');
    equalizerContainer.className = 'media-player__equalizer';
    section.appendChild(equalizerContainer);

    // Preset popover hint
    let popoverEl = doc.getElementById('preset-popover');
    if (!popoverEl) {
        popoverEl = doc.createElement('div');
        popoverEl.id = 'preset-popover';
        popoverEl.setAttribute('popover', 'hint');
        const defaultArtist = doc.createElement('div');
        defaultArtist.style.fontWeight = 'bold';
        defaultArtist.style.marginBottom = '0.125rem';
        defaultArtist.textContent = 'Artist Name';
        const defaultAlbum = doc.createElement('div');
        defaultAlbum.style.fontSize = '0.65rem';
        defaultAlbum.style.color = 'oklch(from #ccc l c h)';
        defaultAlbum.textContent = 'Album Name';
        popoverEl.appendChild(defaultArtist);
        popoverEl.appendChild(defaultAlbum);
        doc.body ? doc.body.appendChild(popoverEl) : section.appendChild(popoverEl);
    }

    mount.appendChild(section);

    // Initialize Equalizer
    let equalizerUI = null;
    if (core && core.audio && typeof EqualizerUI === 'function') {
        try {
            equalizerUI = new EqualizerUI(equalizerContainer, core.audio, { type: 'full' });
        } catch {
            // Deferred / unsupported in node/test environment
        }
    }

    const handleEqClosed = () => {
        section.classList.remove('is-eq-open');
    };
    equalizerContainer.addEventListener('eq-closed', handleEqClosed);

    // Presets Population & Long-Press
    let activeAnchorBtn = null;
    let popoverHideTimer = null;
    let cleanupPresetsLongPress = null;

    const renderPresets = () => {
        if (!core.tracks || !core.tracks.length) return;
        presetsContainer.replaceChildren();

        const fragment = typeof doc.createDocumentFragment === 'function' ? doc.createDocumentFragment() : null;
        core.tracks.forEach((track, idx) => {
            const btn = doc.createElement('button');
            btn.className = 'media-player__presets__preset';
            btn.dataset.id = track.id || idx;
            btn.title = track.title || `Track ${idx + 1}`;
            btn.setAttribute('aria-label', `Play ${track.title || 'Track'} by ${track.artist || 'Artist'}`);

            if (track.albumArt) {
                btn.classList.add('has-art');
                const img = doc.createElement('img');
                img.src = track.albumArt;
                img.alt = `Album art for ${track.title || 'track'}`;
                img.loading = 'lazy';
                img.crossOrigin = 'anonymous';
                btn.replaceChildren(img);
            } else {
                btn.appendChild(createSvg(doc, MAIN_PLAYER_ICONS.MUSIC, "0 -960 960 960", "oklch(from #e3e3e3 l c h)"));
            }
            if (fragment) {
                fragment.appendChild(btn);
            } else {
                presetsContainer.appendChild(btn);
            }
        });
        if (fragment) {
            presetsContainer.appendChild(fragment);
        }

        cleanupPresetsLongPress?.();
        const presetButtons = Array.from(presetsContainer.querySelectorAll('.media-player__presets__preset'));
        cleanupPresetsLongPress = UI.setupLongPress(presetButtons, {
            onShortPress: (e, btn) => {
                const targetBtn = btn || (e ? e.currentTarget : null);
                if (!targetBtn) return;
                const trackId = targetBtn.dataset.id;
                const track = (core.tracks && core.tracks.find(t => String(t.id) === String(trackId))) || core.tracks[trackId];
                if (track) {
                    const idx = core.tracks.indexOf(track);
                    if (core.audio && core.audio.src && core.audio.src.endsWith(track.src) && !core.audio.paused) {
                        core.pause ? core.pause() : core.togglePlay();
                    } else {
                        core.loadTrack(idx !== -1 ? idx : 0);
                        core.play ? core.play() : core.togglePlay();
                    }
                }
            },
            onLongPress: (e, btn) => {
                const targetBtn = btn || (e ? e.currentTarget : null);
                if (!targetBtn) return;
                const trackId = targetBtn.dataset.id;
                const track = (core.tracks && core.tracks.find(t => String(t.id) === String(trackId))) || core.tracks[trackId];
                if (track && popoverEl) {
                    UI.showPopover(popoverEl, targetBtn, track);
                    activeAnchorBtn = targetBtn;
                    if (popoverHideTimer) clearTimeout(popoverHideTimer);
                    popoverHideTimer = setTimeout(() => {
                        UI.hidePopover(popoverEl, activeAnchorBtn);
                        popoverHideTimer = null;
                    }, 1500);
                }
            },
            delay: 500
        });
    };
    renderPresets();

    // Option Button Modes & Interactions
    let mode = 'like'; // 'like', 'equalizer', 'rewind'
    let liked = false;
    const optionIconPath = optionBtn.querySelector('path');

    const updateOptionIcon = () => {
        if (!optionIconPath) return;
        if (mode === 'equalizer') {
            optionIconPath.setAttribute('d', MAIN_PLAYER_ICONS.EQUALIZER);
        } else if (mode === 'rewind') {
            optionIconPath.setAttribute('d', MAIN_PLAYER_ICONS.REWIND);
        } else {
            optionIconPath.setAttribute('d', liked ? MAIN_PLAYER_ICONS.LIKE_FILLED : MAIN_PLAYER_ICONS.LIKE);
        }
        optionBtn.title = `Mode: ${mode.toUpperCase()}`;
        optionBtn.setAttribute('aria-label', `Options Mode: ${mode.toUpperCase()}`);
    };

    const toggleMode = () => {
        equalizerContainer.classList.remove('active');
        section.classList.remove('is-eq-open');

        if (mode === 'like') mode = 'equalizer';
        else if (mode === 'equalizer') mode = 'rewind';
        else mode = 'like';

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(50); } catch { /* ignore */ }
        }
        optionBtn.classList.add('pulse');
        setTimeout(() => optionBtn.classList.remove('pulse'), 300);
        updateOptionIcon();
    };

    const handleOptionClick = () => {
        if (mode === 'like') {
            liked = !liked;
            updateOptionIcon();
        } else if (mode === 'rewind') {
            if (core.audio) {
                core.audio.currentTime = Math.max(0, core.audio.currentTime - 10);
            }
        } else if (mode === 'equalizer') {
            if (!equalizerUI && core && core.audio && typeof EqualizerUI === 'function') {
                try {
                    equalizerUI = new EqualizerUI(equalizerContainer, core.audio, { type: 'full' });
                } catch { /* ignore */ }
            }
            const isActive = equalizerUI ? equalizerUI.toggle() : false;
            section.classList.toggle('is-eq-open', isActive);
        }
    };

    const cleanupOptionLongPress = UI.setupLongPress(optionBtn, {
        onShortPress: () => {
            handleOptionClick();
        },
        onLongPress: () => {
            optionBtn.classList.add('animate-outline');
            setTimeout(() => optionBtn.classList.remove('animate-outline'), 320);
            toggleMode();
        },
        delay: 500
    });
    updateOptionIcon();

    // Play/Pause Action
    playBtn.addEventListener('click', () => {
        equalizerUI?.initAudio?.();
        core.togglePlay();
    });

    // Core Event Subscriptions
    const unsubscribeCore = core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            if (event === 'play') equalizerUI?.initAudio?.();
            UI.updatePlayIcon(playBtn, core.audio ? core.audio.paused : true);
        }
        if (event === 'tracksLoaded') {
            renderPresets();
        }
        if (event === 'trackChanged' && data) {
            UI.updateTrackInfo({ title: titleEl, artist: artistEl, artBtn: currentArtBtn }, data);
            UI.updateMarquee?.(titleEl);
        }
    });

    // Populate initial track state if available
    const initialTrack = core.currentTrack || (core.tracks && core.tracks[core.currentIndex]);
    if (initialTrack) {
        UI.updateTrackInfo({ title: titleEl, artist: artistEl, artBtn: currentArtBtn }, initialTrack);
        UI.updateMarquee?.(titleEl);
    }

    return {
        section,
        equalizerUI,
        popoverEl,
        destroy() {
            if (popoverHideTimer) clearTimeout(popoverHideTimer);
            cleanupOptionLongPress?.();
            cleanupPresetsLongPress?.();
            unsubscribeCore?.();
            equalizerContainer?.removeEventListener?.('eq-closed', handleEqClosed);
            UI.unobserveMarquee?.(titleEl);
            UI.unobserveMarquee?.(artistEl);
            section?.remove?.();
        }
    };
}

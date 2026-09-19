import { UI } from './MediaPlayerUI.js';
import { SVG_PATHS } from './Constants.js';

export const WIDGET_PLAYER_ICONS = {
    PREV: "M240-240v-480h80v480h-80Zm440 0L400-480l280-240v480Z",
    NEXT: "M640-240v-480h80v480h-80ZM280-240v-480l280 240-280 240Z",
    MUSIC: "M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z",
    PLAY: SVG_PATHS.PLAY,
    PAUSE: SVG_PATHS.PAUSE,
    LIKE: SVG_PATHS.LIKE,
    LIKE_FILLED: SVG_PATHS.LIKE_FILLED,
    DISLIKE: SVG_PATHS.DISLIKE,
    DISLIKE_FILLED: SVG_PATHS.DISLIKE_FILLED
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
 * Standard factory that builds the modular Media Player Widget component.
 * Ensures complete component and DOM parity between lab/media-player-widget.html and
 * lab/media-player-selector.html.
 *
 * @param {HTMLElement} mount - Parent container where the player is mounted
 * @param {import('./MediaPlayerCore.js').MediaPlayerCore} core - Core audio provider
 * @param {Document} [doc=document] - Document context
 * @returns {object} Controller instance with cleanup & DOM references
 */
export function buildWidgetPlayer(mount, core, doc = document) {
    const section = doc.createElement('section');
    section.className = 'media-player';

    // Current track art button (Row span 2 in widget grid)
    const currentArtBtn = doc.createElement('button');
    currentArtBtn.className = 'media-player__current themed-background';
    currentArtBtn.dataset.analyticsElement = 'Current Track';
    currentArtBtn.title = 'Current Track';
    currentArtBtn.setAttribute('aria-label', 'Current Track Art');
    currentArtBtn.appendChild(createSvg(doc, WIDGET_PLAYER_ICONS.MUSIC));
    section.appendChild(currentArtBtn);

    // Meta block
    const meta = doc.createElement('div');
    meta.className = 'media-player__meta';

    const titleEl = doc.createElement('div');
    titleEl.className = 'media-player__meta__title';
    titleEl.textContent = 'Select Track';

    const artistEl = doc.createElement('div');
    artistEl.className = 'media-player__meta__artist';
    artistEl.textContent = '...';

    meta.appendChild(titleEl);
    meta.appendChild(artistEl);
    section.appendChild(meta);

    // Controls block
    const controls = doc.createElement('div');
    controls.className = 'media-player__controls';

    const dislikeBtn = doc.createElement('button');
    dislikeBtn.className = 'media-player__dislike';
    dislikeBtn.dataset.analyticsElement = 'Dislike';
    dislikeBtn.title = 'Dislike';
    dislikeBtn.setAttribute('aria-label', 'Dislike');
    dislikeBtn.appendChild(createSvg(doc, WIDGET_PLAYER_ICONS.DISLIKE));
    controls.appendChild(dislikeBtn);

    const prevBtn = doc.createElement('button');
    prevBtn.className = 'media-player__prev';
    prevBtn.dataset.analyticsElement = 'Previous';
    prevBtn.title = 'Previous';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.appendChild(createSvg(doc, WIDGET_PLAYER_ICONS.PREV));
    controls.appendChild(prevBtn);

    const playBtn = doc.createElement('button');
    playBtn.className = 'media-player__play';
    playBtn.dataset.analyticsElement = 'Play';
    playBtn.title = 'Play';
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.appendChild(createSvg(doc, WIDGET_PLAYER_ICONS.PLAY));
    controls.appendChild(playBtn);

    const nextBtn = doc.createElement('button');
    nextBtn.className = 'media-player__next';
    nextBtn.dataset.analyticsElement = 'Next';
    nextBtn.title = 'Next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.appendChild(createSvg(doc, WIDGET_PLAYER_ICONS.NEXT));
    controls.appendChild(nextBtn);

    const likeBtn = doc.createElement('button');
    likeBtn.className = 'media-player__like';
    likeBtn.dataset.analyticsElement = 'Like';
    likeBtn.title = 'Like';
    likeBtn.setAttribute('aria-label', 'Like');
    likeBtn.appendChild(createSvg(doc, WIDGET_PLAYER_ICONS.LIKE));
    controls.appendChild(likeBtn);

    section.appendChild(controls);
    mount.appendChild(section);

    // Event Bindings
    playBtn.addEventListener('click', () => core.togglePlay());
    prevBtn.addEventListener('click', () => core.prev());
    nextBtn.addEventListener('click', () => core.next());

    // Mutual exclusivity for Like & Dislike
    let isLiked = false;
    let isDisliked = false;

    const likePath = likeBtn.querySelector('path');
    const dislikePath = dislikeBtn.querySelector('path');

    likeBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        if (isLiked) {
            isDisliked = false;
            dislikePath?.setAttribute('d', WIDGET_PLAYER_ICONS.DISLIKE);
        }
        likePath?.setAttribute('d', isLiked ? WIDGET_PLAYER_ICONS.LIKE_FILLED : WIDGET_PLAYER_ICONS.LIKE);
    });

    dislikeBtn.addEventListener('click', () => {
        isDisliked = !isDisliked;
        if (isDisliked) {
            isLiked = false;
            likePath?.setAttribute('d', WIDGET_PLAYER_ICONS.LIKE);
        }
        dislikePath?.setAttribute('d', isDisliked ? WIDGET_PLAYER_ICONS.DISLIKE_FILLED : WIDGET_PLAYER_ICONS.DISLIKE);
    });

    // Core Event Subscriptions
    const unsubscribeCore = core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            UI.updatePlayIcon(playBtn, core.audio ? core.audio.paused : true);
        }
        if (event === 'trackChanged' && data) {
            UI.updateTrackInfo({ title: titleEl, artist: artistEl, artBtn: currentArtBtn }, data);
        }
    });

    // Initial track state
    const initialTrack = core.currentTrack || (core.tracks && core.tracks[core.currentIndex]);
    if (initialTrack) {
        UI.updateTrackInfo({ title: titleEl, artist: artistEl, artBtn: currentArtBtn }, initialTrack);
    }

    return {
        section,
        destroy() {
            unsubscribeCore?.();
            section?.remove?.();
        }
    };
}

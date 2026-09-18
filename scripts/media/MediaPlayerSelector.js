import { MediaPlayerCore } from './MediaPlayerCore.js';
import { UI } from './MediaPlayerUI.js';
import { SVG_PATHS } from './Constants.js';

export const players = [
    { id: 'main', title: "Main Media Player", variantClass: 'player-variant--main' },
    { id: 'inline', title: "Inline Widget", variantClass: 'player-variant--inline' },
    { id: 'lock-screen', title: "Lock Screen Player", variantClass: 'player-variant--lock-screen' },
    { id: 'widget', title: "Media Player Widget", variantClass: 'player-variant--widget' }
];

const ICONS = {
    PREV: "M240-240v-480h80v480h-80Zm440 0L400-480l280-240v480Z",
    NEXT: "M640-240v-480h80v480h-80ZM280-240v-480l280 240-280 240Z",
    REWIND: "M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5-77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80ZM360-320v-180h-60v-60h120v240h-60Zm140 0q-17 0-28.5-11.5T460-360v-160q0-17 11.5-28.5T500-560h80q17 0 28.5 11.5T620-520v160q0 17-11.5 28.5T580-320h-80Zm20-60h40v-120h-40v120Z",
    MUSIC: "M360-400h400L622-580l-92 120-62-80-108 140Zm-40 160q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z",
    SHUFFLE: "M560-160v-80h164L531-433l56-56 193 193v-164h80v280H560Zm-344 0-56-56 193-193-193-193 56-56 193 193 193-193 56 56-193 193 193 193-56 56-193-193L216-160Z",
    PHONE: "M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z",
    EQ: "M280-240v-480h80v480h-80ZM440-80v-800h80v800h-80ZM120-400v-160h80v160h-80Zm480 160v-480h80v480h-80Zm160-160v-160h80v160h-80Z"
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
    const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", fill);
    svg.appendChild(path);
    return svg;
}

/* 1. Main Media Player Factory */
function buildMainPlayer(mount, core, doc) {
    const section = doc.createElement('section');
    section.className = 'media-player';

    // Controls bar (stagger child 1)
    const controls = doc.createElement('div');
    controls.className = 'media-player__controls';

    const currentBtn = doc.createElement('button');
    currentBtn.className = 'media-player__controls__current';
    currentBtn.setAttribute('aria-label', 'Current Track Art');
    currentBtn.appendChild(createSvg(doc, ICONS.MUSIC));
    controls.appendChild(currentBtn);

    const meta = doc.createElement('div');
    meta.className = 'media-player__meta';
    const titleEl = doc.createElement('div');
    titleEl.className = 'media-player__meta__title';
    titleEl.innerHTML = '<span>Select Track</span>';
    const artistEl = doc.createElement('div');
    artistEl.className = 'media-player__meta__artist';
    artistEl.innerHTML = '<span>...</span>';
    meta.appendChild(titleEl);
    meta.appendChild(artistEl);
    controls.appendChild(meta);

    const optionBtn = doc.createElement('button');
    optionBtn.className = 'media-player__controls__option';
    optionBtn.setAttribute('aria-label', 'Options / Like');
    optionBtn.appendChild(createSvg(doc, SVG_PATHS.LIKE));
    controls.appendChild(optionBtn);

    const playBtn = doc.createElement('button');
    playBtn.className = 'media-player__controls__play';
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.appendChild(createSvg(doc, SVG_PATHS.PLAY));
    controls.appendChild(playBtn);

    section.appendChild(controls);

    // Presets (stagger child 2)
    const presets = doc.createElement('div');
    presets.className = 'media-player__presets';

    const renderPresets = () => {
        if (!core.tracks || !core.tracks.length) return;
        if (presets.childElementCount === core.tracks.length) return;
        presets.replaceChildren();
        core.tracks.forEach((track, idx) => {
            const presetBtn = doc.createElement('button');
            presetBtn.className = 'media-player__presets__preset';
            presetBtn.dataset.id = track.id || idx;
            presetBtn.title = track.title;
            presetBtn.setAttribute('aria-label', `Play ${track.title}`);

            const img = doc.createElement('img');
            img.src = track.albumArt || '';
            img.alt = track.title;
            img.loading = 'lazy';
            img.crossOrigin = 'anonymous';
            presetBtn.appendChild(img);

            presetBtn.addEventListener('click', () => {
                core.loadTrack(idx);
                core.play();
            });
            presets.appendChild(presetBtn);
        });
    };
    renderPresets();

    section.appendChild(presets);
    mount.appendChild(section);

    // Event Bindings
    playBtn.addEventListener('click', () => core.togglePlay());
    let isLiked = false;
    optionBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        const path = optionBtn.querySelector('path');
        if (path) path.setAttribute('d', isLiked ? SVG_PATHS.LIKE_FILLED : SVG_PATHS.LIKE);
    });

    // Subscriptions
    core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            UI.updatePlayIcon(playBtn, core.audio ? core.audio.paused : true);
        }
        if (event === 'tracksLoaded') {
            renderPresets();
        }
        if (event === 'trackChanged' && data) {
            UI.updateTrackInfo({ title: titleEl, artist: artistEl, artBtn: currentBtn }, data);
        }
    });
}

/* 2. Inline Widget Factory */
function buildInlinePlayer(mount, core, doc) {
    const container = doc.createElement('div');
    container.className = 'player-container';

    const section = doc.createElement('section');
    section.className = 'media-player-inline';

    // Meta (stagger child 1)
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

    // Controls (stagger child 2)
    const controls = doc.createElement('div');
    controls.className = 'media-player-inline__controls';

    const prevBtn = doc.createElement('button');
    prevBtn.className = 'media-player-inline__prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.appendChild(createSvg(doc, ICONS.PREV));
    controls.appendChild(prevBtn);

    const playBtn = doc.createElement('button');
    playBtn.className = 'media-player-inline__play';
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.appendChild(createSvg(doc, SVG_PATHS.PLAY));
    controls.appendChild(playBtn);

    const nextBtn = doc.createElement('button');
    nextBtn.className = 'media-player-inline__next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.appendChild(createSvg(doc, ICONS.NEXT));
    controls.appendChild(nextBtn);

    section.appendChild(controls);

    // Progress (stagger child 3)
    const progress = doc.createElement('div');
    progress.className = 'media-player-inline__progress';

    const curTime = doc.createElement('span');
    curTime.className = 'media-player-inline__time current';
    curTime.textContent = '0:00';
    progress.appendChild(curTime);

    const slider = doc.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = '0';
    slider.step = '0.1';
    slider.className = 'media-player-inline__slider';
    slider.setAttribute('aria-label', 'Track Progress');
    progress.appendChild(slider);

    const durTime = doc.createElement('span');
    durTime.className = 'media-player-inline__time duration';
    durTime.textContent = '0:00';
    progress.appendChild(durTime);

    section.appendChild(progress);

    // Toggle (stagger child 4)
    const toggle = doc.createElement('div');
    toggle.className = 'media-player-inline__toggle';
    const optBtn = doc.createElement('button');
    optBtn.className = 'media-player-inline__option';
    optBtn.setAttribute('aria-label', 'Shuffle');
    optBtn.appendChild(createSvg(doc, ICONS.SHUFFLE));
    toggle.appendChild(optBtn);
    section.appendChild(toggle);

    container.appendChild(section);
    mount.appendChild(container);

    // Event Bindings
    playBtn.addEventListener('click', () => core.togglePlay());
    prevBtn.addEventListener('click', () => core.prev());
    nextBtn.addEventListener('click', () => core.next());
    slider.addEventListener('input', () => {
        if (core.audio && core.audio.duration) {
            core.audio.currentTime = (slider.value / 100) * core.audio.duration;
        }
    });

    // Subscriptions
    core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            UI.updatePlayIcon(playBtn, core.audio ? core.audio.paused : true);
        }
        if (event === 'trackChanged' && data) {
            titleEl.textContent = data.title;
            artistEl.textContent = data.artist;
        }
        if (event === 'timeupdate' && core.audio) {
            const cur = core.audio.currentTime;
            const dur = core.audio.duration;
            if (dur && !isNaN(dur)) {
                slider.value = (cur / dur) * 100;
                curTime.textContent = formatTime(cur);
                durTime.textContent = formatTime(dur);
            }
        }
    });
}

/* 3. Lock Screen Player Factory */
function buildLockScreenPlayer(mount, core, doc) {
    const section = doc.createElement('section');
    section.className = 'media-player-grid';

    // Row 1 (stagger child 1)
    const row1 = doc.createElement('article');
    row1.className = 'media-player-grid__row';

    const eqBtn = doc.createElement('button');
    eqBtn.className = 'grid-item--eq icon-btn--brand themed-background';
    eqBtn.setAttribute('aria-label', 'Equalizer');
    eqBtn.appendChild(createSvg(doc, ICONS.EQ));
    row1.appendChild(eqBtn);

    const phoneBtn = doc.createElement('button');
    phoneBtn.className = 'grid-item--phone icon-btn--brand themed-background';
    phoneBtn.setAttribute('aria-label', 'Output Device');
    phoneBtn.appendChild(createSvg(doc, ICONS.PHONE, "0 0 24 24"));
    row1.appendChild(phoneBtn);

    section.appendChild(row1);

    // Row 2 (stagger child 2)
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
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.appendChild(createSvg(doc, SVG_PATHS.PLAY));
    row2.appendChild(playBtn);

    section.appendChild(row2);

    // Row 3 (stagger child 3)
    const row3 = doc.createElement('article');
    row3.className = 'media-player-grid__row';

    const prevBtn = doc.createElement('button');
    prevBtn.className = 'media-player__prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.appendChild(createSvg(doc, ICONS.PREV));
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
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.appendChild(createSvg(doc, ICONS.NEXT));
    row3.appendChild(nextBtn);

    const rewindBtn = doc.createElement('button');
    rewindBtn.className = 'media-player__rewind';
    rewindBtn.setAttribute('aria-label', 'Rewind 10s');
    rewindBtn.appendChild(createSvg(doc, ICONS.REWIND));
    row3.appendChild(rewindBtn);

    const optBtn = doc.createElement('button');
    optBtn.className = 'media-player__option';
    optBtn.setAttribute('aria-label', 'Options');
    optBtn.appendChild(createSvg(doc, ICONS.SHUFFLE));
    row3.appendChild(optBtn);

    section.appendChild(row3);
    mount.appendChild(section);

    // Event Bindings
    playBtn.addEventListener('click', () => core.togglePlay());
    prevBtn.addEventListener('click', () => core.prev());
    nextBtn.addEventListener('click', () => core.next());
    rewindBtn.addEventListener('click', () => {
        if (core.audio) core.audio.currentTime = Math.max(0, core.audio.currentTime - 10);
    });
    slider.addEventListener('input', () => {
        if (core.audio && core.audio.duration) {
            core.audio.currentTime = (slider.value / 100) * core.audio.duration;
        }
    });

    // Subscriptions
    core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            UI.updatePlayIcon(playBtn, core.audio ? core.audio.paused : true);
        }
        if (event === 'trackChanged' && data) {
            titleEl.textContent = data.title;
            artistEl.textContent = data.artist;
            if (data.albumArt) {
                section.style.setProperty('--bg-image', `url('${data.albumArt}')`);
            }
        }
        if (event === 'timeupdate' && core.audio) {
            const cur = core.audio.currentTime;
            const dur = core.audio.duration;
            if (dur && !isNaN(dur)) {
                slider.value = (cur / dur) * 100;
            }
        }
    });
}

/* 4. Media Player Widget Factory */
function buildWidgetPlayer(mount, core, doc) {
    const section = doc.createElement('section');
    section.className = 'media-player';

    // Current art (stagger child 1)
    const currentBtn = doc.createElement('button');
    currentBtn.className = 'media-player__current themed-background';
    currentBtn.setAttribute('aria-label', 'Current Track Art');
    currentBtn.appendChild(createSvg(doc, ICONS.MUSIC));
    section.appendChild(currentBtn);

    // Meta (stagger child 2)
    const meta = doc.createElement('div');
    meta.className = 'media-player__meta';
    const titleEl = doc.createElement('span');
    titleEl.className = 'media-player__meta__title';
    titleEl.textContent = 'Select Track';
    const artistEl = doc.createElement('span');
    artistEl.className = 'media-player__meta__artist';
    artistEl.textContent = '...';
    meta.appendChild(titleEl);
    meta.appendChild(artistEl);
    section.appendChild(meta);

    // Controls (stagger child 3)
    const controls = doc.createElement('div');
    controls.className = 'media-player__controls';

    const dislikeBtn = doc.createElement('button');
    dislikeBtn.className = 'media-player__dislike';
    dislikeBtn.setAttribute('aria-label', 'Dislike');
    dislikeBtn.appendChild(createSvg(doc, SVG_PATHS.LIKE));
    controls.appendChild(dislikeBtn);

    const prevBtn = doc.createElement('button');
    prevBtn.className = 'media-player__prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.appendChild(createSvg(doc, ICONS.PREV));
    controls.appendChild(prevBtn);

    const playBtn = doc.createElement('button');
    playBtn.className = 'media-player__play';
    playBtn.setAttribute('aria-label', 'Play or Pause');
    playBtn.appendChild(createSvg(doc, SVG_PATHS.PLAY));
    controls.appendChild(playBtn);

    const nextBtn = doc.createElement('button');
    nextBtn.className = 'media-player__next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.appendChild(createSvg(doc, ICONS.NEXT));
    controls.appendChild(nextBtn);

    const likeBtn = doc.createElement('button');
    likeBtn.className = 'media-player__like';
    likeBtn.setAttribute('aria-label', 'Like');
    likeBtn.appendChild(createSvg(doc, SVG_PATHS.LIKE));
    controls.appendChild(likeBtn);

    section.appendChild(controls);
    mount.appendChild(section);

    // Event Bindings
    playBtn.addEventListener('click', () => core.togglePlay());
    prevBtn.addEventListener('click', () => core.prev());
    nextBtn.addEventListener('click', () => core.next());

    let isLiked = false;
    let isDisliked = false;
    likeBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        if (isLiked) isDisliked = false;
        const likePath = likeBtn.querySelector('path');
        const dislikePath = dislikeBtn.querySelector('path');
        if (likePath) likePath.setAttribute('d', isLiked ? SVG_PATHS.LIKE_FILLED : SVG_PATHS.LIKE);
        if (dislikePath) dislikePath.setAttribute('d', SVG_PATHS.LIKE);
    });

    dislikeBtn.addEventListener('click', () => {
        isDisliked = !isDisliked;
        if (isDisliked) isLiked = false;
        const likePath = likeBtn.querySelector('path');
        const dislikePath = dislikeBtn.querySelector('path');
        if (dislikePath) dislikePath.setAttribute('d', isDisliked ? SVG_PATHS.LIKE_FILLED : SVG_PATHS.LIKE);
        if (likePath) likePath.setAttribute('d', SVG_PATHS.LIKE);
    });

    // Subscriptions
    core.subscribe((event, data) => {
        if (event === 'play' || event === 'pause' || event === 'ended') {
            UI.updatePlayIcon(playBtn, core.audio ? core.audio.paused : true);
        }
        if (event === 'trackChanged' && data) {
            titleEl.textContent = data.title;
            artistEl.textContent = data.artist;
            if (data.albumArt) {
                let img = currentBtn.querySelector('img');
                if (!img) {
                    img = doc.createElement('img');
                    img.alt = data.title;
                    img.crossOrigin = 'anonymous';
                    currentBtn.replaceChildren(img);
                }
                img.crossOrigin = 'anonymous';
                img.src = data.albumArt;
            }
        }
    });
}

export function initMediaPlayerSelector(doc = document, win = typeof window !== 'undefined' ? window : null) {
    const carousel = doc.getElementById('carousel');
    const pagination = doc.getElementById('pagination');
    const prevBtn = doc.getElementById('prev-btn');
    const nextBtn = doc.getElementById('next-btn');
    const audio = doc.getElementById('audio-player');

    if (!carousel || !pagination) return null;

    // Unified Audio Core instance
    const core = audio ? new MediaPlayerCore(audio) : {
        tracks: [],
        currentIndex: 0,
        audio: null,
        subscribe: () => () => {},
        togglePlay: () => {},
        prev: () => {},
        next: () => {},
        loadTrack: () => {},
        play: () => {}
    };

    let currentIndex = 0;
    let isTransitioning = false;
    const dots = [];

    // Render individual native player slides inside the single carousel container
    players.forEach((player, index) => {
        const slide = doc.createElement('div');
        slide.className = `player-slide${index === 0 ? ' active' : ''}`;
        slide.id = `player-slide-${index}`;
        slide.dataset.index = index;
        slide.dataset.player = player.id;
        slide.setAttribute('role', 'tabpanel');
        slide.setAttribute('aria-labelledby', `player-tab-${index}`);
        slide.setAttribute('tabindex', '0');

        // Create Header
        const header = doc.createElement('div');
        header.className = 'card-header';
        const h2 = doc.createElement('h2');
        h2.textContent = player.title;
        header.appendChild(h2);
        slide.appendChild(header);

        // Mount wrapper with scoped BEM class
        const mount = doc.createElement('div');
        mount.className = `player-mount ${player.variantClass}`;

        // Build the native player variant into the mount
        switch (player.id) {
            case 'main':
                buildMainPlayer(mount, core, doc);
                break;
            case 'inline':
                buildInlinePlayer(mount, core, doc);
                break;
            case 'lock-screen':
                buildLockScreenPlayer(mount, core, doc);
                break;
            case 'widget':
                buildWidgetPlayer(mount, core, doc);
                break;
        }

        slide.appendChild(mount);
        carousel.appendChild(slide);

        // Create Accessible Pagination Dot
        const dot = doc.createElement('button');
        dot.className = `dot${index === 0 ? ' active' : ''}`;
        dot.id = `player-tab-${index}`;
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.setAttribute('aria-controls', `player-slide-${index}`);
        dot.setAttribute('aria-label', `Player ${index + 1}: ${player.title}`);
        dot.setAttribute('tabindex', index === 0 ? '0' : '-1');

        dot.addEventListener('click', () => {
            if (index === currentIndex || isTransitioning) return;
            transitionToPlayer(index);
        });

        pagination.appendChild(dot);
        dots.push(dot);
    });

    // Initialize initial track across all variants
    if (core.tracks && core.tracks.length > 0 && core.loadTrack) {
        core.loadTrack(0);
    }

    const transitionToPlayer = (targetIndex) => {
        if (targetIndex === currentIndex || isTransitioning) return;

        let nextIndex = targetIndex;
        if (nextIndex < 0) nextIndex = players.length - 1;
        if (nextIndex >= players.length) nextIndex = 0;

        isTransitioning = true;

        const currentSlide = carousel.querySelector(`.player-slide[data-index="${currentIndex}"]`);
        const nextSlide = carousel.querySelector(`.player-slide[data-index="${nextIndex}"]`);

        const updateDOM = () => {
            currentSlide?.classList.remove('active');
            nextSlide?.classList.add('active');

            dots.forEach((dot, idx) => {
                const isSelected = idx === nextIndex;
                dot.classList.toggle('active', isSelected);
                dot.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                dot.setAttribute('tabindex', isSelected ? '0' : '-1');
            });

            currentIndex = nextIndex;
        };

        // Leverage native View Transitions API with pure cross-fade & stagger
        if (doc.startViewTransition) {
            let transition;
            try {
                transition = doc.startViewTransition({
                    update: updateDOM,
                    types: ['cross-fade']
                });
            } catch {
                transition = doc.startViewTransition(updateDOM);
            }

            transition.finished.finally(() => {
                isTransitioning = false;
            });
        } else {
            updateDOM();
            isTransitioning = false;
        }
    };

    // Nav Button Controls
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            transitionToPlayer(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            transitionToPlayer(currentIndex + 1);
        });
    }

    // Keyboard Arrow Navigation
    if (win) {
        win.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                transitionToPlayer(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                transitionToPlayer(currentIndex + 1);
            }
        });
    }

    // Touch Swipe Gesture Support
    let touchStartX = 0;
    let touchStartY = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
                transitionToPlayer(currentIndex + 1);
            } else {
                transitionToPlayer(currentIndex - 1);
            }
        }
    }, { passive: true });

    return {
        getCurrentIndex: () => currentIndex,
        getCore: () => core,
        transitionToPlayer
    };
}

if (typeof document !== 'undefined' && document.getElementById('carousel')) {
    initMediaPlayerSelector();
}



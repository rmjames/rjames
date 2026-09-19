import { MediaPlayerCore } from './MediaPlayerCore.js';
import { buildMainPlayer } from './MainMediaPlayer.js';
import { buildInlinePlayer } from './InlinePlayer.js';
import { buildLockScreenPlayer } from './LockScreenPlayer.js';
import { buildWidgetPlayer } from './WidgetPlayer.js';

export const players = [
    { id: 'main', title: "Main Media Player", variantClass: 'player-variant--main' },
    { id: 'inline', title: "Inline Widget", variantClass: 'player-variant--inline' },
    { id: 'lock-screen', title: "Lock Screen Player", variantClass: 'player-variant--lock-screen' },
    { id: 'widget', title: "Media Player Widget", variantClass: 'player-variant--widget' }
];

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
    const controllers = [];

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

        // Build the native player variant into the mount using shared component factories
        let ctrl = null;
        switch (player.id) {
            case 'main':
                ctrl = buildMainPlayer(mount, core, doc);
                break;
            case 'inline':
                ctrl = buildInlinePlayer(mount, core, doc);
                break;
            case 'lock-screen':
                ctrl = buildLockScreenPlayer(mount, core, doc);
                break;
            case 'widget':
                ctrl = buildWidgetPlayer(mount, core, doc);
                break;
        }
        controllers.push(ctrl);

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
        getControllers: () => controllers,
        transitionToPlayer,
        destroy() {
            controllers.forEach(ctrl => ctrl?.destroy?.());
        }
    };
}

if (typeof document !== 'undefined' && document.getElementById('carousel')) {
    initMediaPlayerSelector();
}

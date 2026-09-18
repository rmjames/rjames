import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert/strict';
import { initMediaPlayerSelector } from '../../../scripts/media/MediaPlayerSelector.js';
import { audioLibrary } from '../../../scripts/AudioLibrary.js';

class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

class MockClassList {
    constructor() {
        this.classes = new Set();
    }
    add(...names) {
        names.forEach(n => n && n.split(' ').forEach(c => c && this.classes.add(c)));
    }
    remove(...names) {
        names.forEach(n => n && n.split(' ').forEach(c => this.classes.delete(c)));
    }
    toggle(name, force) {
        if (force === undefined) {
            if (this.classes.has(name)) this.classes.delete(name);
            else this.classes.add(name);
        } else if (force) {
            this.classes.add(name);
        } else {
            this.classes.delete(name);
        }
    }
    contains(name) {
        return this.classes.has(name);
    }
    toString() {
        return Array.from(this.classes).join(' ');
    }
}

class MockElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.classList = new MockClassList();
        this.children = [];
        this.attributes = {};
        this.dataset = {};
        this.eventListeners = {};
        this.style = {
            setProperty: (k, v) => { this.style[k] = v; }
        };
        this.innerHTML = '';
        this.textContent = '';
    }

    get className() {
        return this.classList.toString();
    }

    set className(val) {
        this.classList.classes.clear();
        this.classList.add(val);
    }

    setAttribute(key, val) {
        this.attributes[key] = String(val);
    }

    getAttribute(key) {
        return this.attributes[key] || null;
    }

    removeAttribute(key) {
        delete this.attributes[key];
    }

    appendChild(child) {
        try {
            child.parentElement = this;
        } catch {
            // parentElement is read-only on native jsdom nodes
        }
        this.children.push(child);
        return child;
    }

    replaceChildren(...newChildren) {
        this.children = [];
        newChildren.forEach(child => this.appendChild(child));
    }

    addEventListener(event, fn) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(fn);
    }

    dispatchEvent(event) {
        const listeners = this.eventListeners[event.type] || [];
        listeners.forEach(fn => fn(event));
    }

    querySelector(selector) {
        if (selector.startsWith('.player-slide[data-index="')) {
            const index = selector.match(/data-index="(\d+)"/)[1];
            return this.children.find(c => c.classList.contains('player-slide') && String(c.dataset.index) === String(index)) || null;
        }
        const search = (el) => {
            if (selector === 'iframe' && el.tagName === 'IFRAME') return el;
            if (selector === 'svg path' && el.tagName === 'PATH') return el;
            if (selector === 'path' && el.tagName === 'PATH') return el;
            if (selector === 'img' && el.tagName === 'IMG') return el;
            if (selector === 'span' && el.tagName === 'SPAN') return el;
            if (selector === '.media-player' && el.classList.contains('media-player')) return el;
            if (selector === '.media-player-inline' && el.classList.contains('media-player-inline')) return el;
            if (selector === '.media-player-grid' && el.classList.contains('media-player-grid')) return el;
            for (const child of el.children) {
                const found = search(child);
                if (found) return found;
            }
            return null;
        };
        return search(this);
    }

    querySelectorAll(selector) {
        const results = [];
        const search = (el) => {
            if (selector === 'iframe' && el.tagName === 'IFRAME') results.push(el);
            Array.from(el.children || []).forEach(search);
        };
        search(this);
        return results;
    }
}

describe('MediaPlayerSelector Component (Approach B Native DOM)', () => {
    let mockDocument;
    let mockWindow;
    let carousel;
    let pagination;
    let prevBtn;
    let nextBtn;
    let audioPlayer;
    let viewTransitionsCalled;
    let controller;

    beforeEach(() => {
        // Seed mock audio tracks
        audioLibrary._tracks = [
            { id: '1', title: 'Test Track 1', artist: 'Artist 1', src: 'track1.mp3', albumArt: 'art1.jpg' },
            { id: '2', title: 'Test Track 2', artist: 'Artist 2', src: 'track2.mp3', albumArt: 'art2.jpg' }
        ];

        carousel = new MockElement('main');
        carousel.id = 'carousel';

        pagination = new MockElement('div');
        pagination.id = 'pagination';

        prevBtn = new MockElement('button');
        prevBtn.id = 'prev-btn';

        nextBtn = new MockElement('button');
        nextBtn.id = 'next-btn';

        audioPlayer = new MockElement('audio');
        audioPlayer.id = 'audio-player';
        audioPlayer.paused = true;
        audioPlayer.currentTime = 0;
        audioPlayer.duration = 180;
        audioPlayer.src = '';
        audioPlayer.play = () => { audioPlayer.paused = false; audioPlayer.dispatchEvent({ type: 'play' }); return Promise.resolve(); };
        audioPlayer.pause = () => { audioPlayer.paused = true; audioPlayer.dispatchEvent({ type: 'pause' }); };

        const elements = {
            'carousel': carousel,
            'pagination': pagination,
            'prev-btn': prevBtn,
            'next-btn': nextBtn,
            'audio-player': audioPlayer
        };

        viewTransitionsCalled = [];

        mockDocument = {
            documentElement: {
                dataset: {}
            },
            getElementById: (id) => elements[id] || null,
            createElement: (tag) => new MockElement(tag),
            createElementNS: (ns, tag) => new MockElement(tag),
            startViewTransition: (options) => {
                viewTransitionsCalled.push(options);
                if (typeof options === 'function') {
                    options();
                } else if (options && typeof options.update === 'function') {
                    options.update();
                }
                return {
                    finished: Promise.resolve()
                };
            }
        };

        const windowListeners = {};
        mockWindow = {
            addEventListener: (event, fn) => {
                if (!windowListeners[event]) windowListeners[event] = [];
                windowListeners[event].push(fn);
            },
            dispatchEvent: (event) => {
                (windowListeners[event.type] || []).forEach(fn => fn(event));
            }
        };
        controller = initMediaPlayerSelector(mockDocument, mockWindow);
    });

    it('should initialize single container with 4 native slides and zero iframes', () => {
        assert.equal(carousel.children.length, 4, 'Carousel container should hold 4 slides');
        assert.equal(pagination.children.length, 4, 'Pagination should hold 4 dots');

        // Verify zero iframes
        const iframes = carousel.querySelectorAll('iframe');
        assert.equal(iframes.length, 0, 'No iframes should be present in native DOM Approach B');

        // Check slide 0 is active
        const slide0 = carousel.children[0];
        assert.ok(slide0.classList.contains('active'), 'Slide 0 should be active');
        assert.equal(slide0.dataset.player, 'main');

        // Verify native player mount and child components exist
        const mainPlayer = slide0.querySelector('.media-player');
        assert.ok(mainPlayer, 'Main media player should be mounted natively');
        assert.ok(mainPlayer.children.length >= 2, 'Main media player should have direct children for sibling-index() staggering');
    });

    it('should share unified MediaPlayerCore across all player variants', () => {
        const core = controller.getCore();
        assert.ok(core, 'Unified MediaPlayerCore instance should exist');
        assert.equal(core.audio, audioPlayer, 'Core should be bound to the shared audio element');
    });

    it('should cross-fade forward on next button click using view-transitions', () => {
        nextBtn.dispatchEvent({ type: 'click' });

        assert.equal(viewTransitionsCalled.length, 1, 'View transition should have been triggered');
        assert.deepEqual(viewTransitionsCalled[0].types, ['cross-fade'], 'View transition type should be cross-fade');
        assert.equal(carousel.children[0].classList.contains('active'), false, 'Slide 0 should no longer be active');
        assert.equal(carousel.children[1].classList.contains('active'), true, 'Slide 1 (inline) should now be active');
        assert.equal(pagination.children[1].getAttribute('aria-selected'), 'true');
        assert.equal(controller.getCurrentIndex(), 1);
    });

    it('should cross-fade backward on prev button click', () => {
        prevBtn.dispatchEvent({ type: 'click' });

        assert.equal(viewTransitionsCalled.length, 1);
        assert.equal(carousel.children[3].classList.contains('active'), true, 'Should wrap to last player (widget)');
        assert.equal(pagination.children[3].getAttribute('aria-selected'), 'true');
        assert.equal(controller.getCurrentIndex(), 3);
    });

    it('should handle keyboard navigation', async () => {
        mockWindow.dispatchEvent({ type: 'keydown', key: 'ArrowRight' });
        assert.equal(carousel.children[1].classList.contains('active'), true);
        assert.equal(controller.getCurrentIndex(), 1);

        await Promise.resolve();
        mockWindow.dispatchEvent({ type: 'keydown', key: 'ArrowLeft' });
        assert.equal(carousel.children[0].classList.contains('active'), true);
        assert.equal(controller.getCurrentIndex(), 0);
    });

    it('should initialize initial track src and play on togglePlay', async () => {
        const core = controller.getCore();
        assert.ok(core.tracks.length > 0, 'Tracks should be populated');
        assert.ok(audioPlayer.src.includes('track1.mp3'), 'audio.src should be loaded with initial track');

        assert.equal(audioPlayer.paused, true);
        core.togglePlay();
        assert.equal(audioPlayer.paused, false);

        core.togglePlay();
        assert.equal(audioPlayer.paused, true);
    });

    it('should handle touch swipe navigation', () => {
        carousel.dispatchEvent({
            type: 'touchstart',
            changedTouches: [{ screenX: 300, screenY: 100 }]
        });
        carousel.dispatchEvent({
            type: 'touchend',
            changedTouches: [{ screenX: 200, screenY: 100 }]
        });

        assert.equal(carousel.children[1].classList.contains('active'), true);
        assert.equal(controller.getCurrentIndex(), 1);
    });
});

describe('MediaPlayerSelector HTML Specs', () => {
    it('should use sibling-index() for staggered animations and contain zero iframes', async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const html = await fs.readFile(path.resolve('lab/media-player-selector.html'), 'utf-8');

        assert.equal(html.includes('<iframe'), false, 'HTML should not contain any iframe elements');
        assert.ok(html.includes('sibling-index()'), 'HTML should define sibling-index() for component staggering');
        assert.ok(html.includes('id="audio-player"'), 'HTML should contain unified audio element');
        assert.ok(html.includes('::view-transition-group(active-player)'), 'HTML should configure View Transitions active-player group');
    });
});

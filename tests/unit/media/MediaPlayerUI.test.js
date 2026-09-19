import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UI } from '../../../scripts/media/MediaPlayerUI.js';
import { SVG_PATHS } from '../../../scripts/media/Constants.js';
import { ColorExtractor } from '../../../scripts/utils/ColorExtractor.js';

// Mock ColorExtractor
vi.mock('../../../scripts/utils/ColorExtractor.js', () => ({
    ColorExtractor: {
        getAccentColor: vi.fn().mockResolvedValue('oklch(0.5 0.5 180)')
    }
}));

// Mock ResizeObserver
vi.stubGlobal('ResizeObserver', class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
});

describe('MediaPlayerUI', () => {
    beforeEach(() => {
        UI._isMarqueeBatchScheduled = false;
        UI._marqueeElements.clear();
    });

    describe('updatePlayIcon', () => {
        it('should update icon to play when paused', () => {
            const button = document.createElement('button');
            button.innerHTML = '<svg><path d=""/></svg>';

            UI.updatePlayIcon(button, true); // isPaused = true

            const path = button.querySelector('path');
            expect(path.getAttribute('d')).toBe(SVG_PATHS.PLAY);
        });

        it('should update icon to pause when playing', () => {
            const button = document.createElement('button');
            button.innerHTML = '<svg><path d=""/></svg>';

            UI.updatePlayIcon(button, false); // isPaused = false

            const path = button.querySelector('path');
            expect(path.getAttribute('d')).toBe(SVG_PATHS.PAUSE);
        });
    });

    describe('updateTrackInfo', () => {
        let elements;
        const track = {
            title: 'Test Title',
            artist: 'Test Artist',
            albumArt: 'art.jpg'
        };

        beforeEach(() => {
            elements = {
                title: document.createElement('div'),
                artist: document.createElement('div'),
                artBtn: document.createElement('button')
            };
        });

        it('should update title and artist', () => {
            UI.updateTrackInfo(elements, track);
            expect(elements.title.textContent).toBe('Test Title');
            expect(elements.artist.textContent).toBe('Test Artist');
        });

        it('should update album art if present', () => {
            UI.updateTrackInfo(elements, track);
            expect(elements.artBtn.classList.contains('has-art')).toBe(true);
            const img = elements.artBtn.querySelector('img');
            expect(img).not.toBeNull();
            expect(img.getAttribute('src')).toBe('art.jpg');
            expect(img.getAttribute('crossorigin')).toBe('anonymous');
        });

        it('should show placeholder if no album art', () => {
            const noArtTrack = { ...track, albumArt: null };
            UI.updateTrackInfo(elements, noArtTrack);
            expect(elements.artBtn.classList.contains('has-art')).toBe(false);
            expect(elements.artBtn.innerHTML).toContain('<svg');
        });
    });

    describe('updateSliderVisuals', () => {
        it('should update slider fill and thumb position', () => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <input type="range" min="0" max="100" value="75" />
                <div class="eq-slider__fill"></div>
                <div class="eq-slider__thumb"></div>
            `;
            const input = wrapper.querySelector('input');
            const fill = wrapper.querySelector('.eq-slider__fill');
            const thumb = wrapper.querySelector('.eq-slider__thumb');

            UI.updateSliderVisuals(input);

            // 75% -> top should be 25%
            expect(thumb.style.top).toBe('25%');
            // Above 50% -> fill starts from top 25% and height is 25% (75-50)
            expect(fill.style.top).toBe('25%');
            expect(fill.style.height).toBe('25%');
        });

        it('should update slider correctly for values below center', () => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <input type="range" min="0" max="100" value="25" />
                <div class="eq-slider__fill"></div>
                <div class="eq-slider__thumb"></div>
            `;
            const input = wrapper.querySelector('input');
            const fill = wrapper.querySelector('.eq-slider__fill');
            const thumb = wrapper.querySelector('.eq-slider__thumb');

            UI.updateSliderVisuals(input);

            // 25% -> top 75%
            expect(thumb.style.top).toBe('75%');
            // Below 50% -> fill starts from 50% and height is 25% (50-25)
            expect(fill.style.top).toBe('50%');
            expect(fill.style.height).toBe('25%');
        });
    });

    describe('popover methods', () => {
        let popoverEl, anchorBtn;

        beforeEach(() => {
            popoverEl = document.createElement('div');
            // Mock Popover API if missing in JSDOM
            popoverEl.showPopover = vi.fn();
            popoverEl.hidePopover = vi.fn();

            anchorBtn = document.createElement('button');
        });

        it('should show popover with track info', () => {
            const track = { title: 'T', artist: 'A', album: 'Alb' };
            UI.showPopover(popoverEl, anchorBtn, track);

            expect(popoverEl.innerHTML).toContain('A');
            expect(popoverEl.innerHTML).toContain('Alb');
            expect(anchorBtn.style.anchorName).toBe('--active-preset');
            expect(popoverEl.showPopover).toHaveBeenCalled();
        });

        it('should hide popover and clean up', () => {
            anchorBtn.style.anchorName = '--active-preset';
            UI.hidePopover(popoverEl, anchorBtn);

            expect(popoverEl.hidePopover).toHaveBeenCalled();
            expect(anchorBtn.style.anchorName).toBe('');
        });
    });

    describe('updateBackgroundArt', () => {
        it('should set css variable for background', () => {
            const element = document.createElement('div');
            const track = { albumArt: 'test.jpg' };

            UI.updateBackgroundArt(element, track);
            expect(element.style.getPropertyValue('--bg-image')).toBe('url("test.jpg")');
        });

        it('should handle missing art', () => {
            const element = document.createElement('div');
            const track = { albumArt: null };

            UI.updateBackgroundArt(element, track);
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');
        });

        it('should preserve already percent-encoded URLs without double-encoding', () => {
            const element = document.createElement('div');
            const track = { albumArt: 'https://media.example.com/audio/Album%20Name/Cover.jpg' };

            UI.updateBackgroundArt(element, track);
            expect(element.style.getPropertyValue('--bg-image')).toBe('url("https://media.example.com/audio/Album%20Name/Cover.jpg")');
        });

        it('should encode URLs with unencoded spaces and strip quotes/parentheses', () => {
            const element = document.createElement('div');
            const track = { albumArt: 'https://media.example.com/audio/Album Name/Cover"test().jpg' };

            UI.updateBackgroundArt(element, track);
            expect(element.style.getPropertyValue('--bg-image')).toBe('url("https://media.example.com/audio/Album%20Name/Covertest.jpg")');
        });

        it('should reject dangerous schemes like javascript:, data:, and blob:', () => {
            const element = document.createElement('div');
            
            UI.updateBackgroundArt(element, { albumArt: 'javascript:alert(1)' });
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');

            UI.updateBackgroundArt(element, { albumArt: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' });
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');

            UI.updateBackgroundArt(element, { albumArt: 'blob:https://example.com/uuid' });
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');
        });

        it('should reject URLs containing control characters, backslashes, or unescaped delimiters', () => {
            const element = document.createElement('div');

            UI.updateBackgroundArt(element, { albumArt: 'https://media.example.com/art\\22.jpg' });
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');

            UI.updateBackgroundArt(element, { albumArt: 'https://media.example.com/art\nnewline.jpg' });
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');

            UI.updateBackgroundArt(element, { albumArt: 'https://media.example.com/art;pwned.jpg' });
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');
        });

        it('should reject unsupported schemes like ftp: or file:', () => {
            const element = document.createElement('div');

            UI.updateBackgroundArt(element, { albumArt: 'ftp://example.com/art.jpg' });
            expect(element.style.getPropertyValue('--bg-image')).toBe('none');
        });
    });

    describe('applyAccentColor', () => {
        it('should apply extracted color', async () => {
            const element = document.createElement('div');
            const track = { albumArt: 'test.jpg' };

            await UI.applyAccentColor(element, track, '--accent-color');

            expect(ColorExtractor.getAccentColor).toHaveBeenCalledWith('test.jpg');
            expect(element.style.getPropertyValue('--accent-color')).toBe('oklch(0.5 0.5 180)');
        });

        it('should reject invalid CSS custom property names', async () => {
            const element = document.createElement('div');
            const track = { albumArt: 'test.jpg' };

            await UI.applyAccentColor(element, track, 'color');
            expect(element.style.getPropertyValue('color')).toBe('');

            await UI.applyAccentColor(element, track, '--invalid;property');
            expect(element.style.getPropertyValue('--invalid;property')).toBe('');
        });
    });

    describe('updateMarquee', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            // Mock requestAnimationFrame
            vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        });

        afterEach(() => {
            vi.useRealTimers();
            vi.unstubAllGlobals();
        });

        it('should add is-marquee class if content overflows', () => {
            const el = document.createElement('div');
            el.innerHTML = '<span>Long Text</span>';

            // Mock properties
            Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
            Object.defineProperty(el, 'scrollWidth', { value: 200, configurable: true });

            UI.updateMarquee(el);

            expect(el.classList.contains('is-marquee')).toBe(true);
            expect(el.style.getPropertyValue('--marquee-width')).toBe('100px');
        });

        it('should remove is-marquee class if content fits', () => {
            const el = document.createElement('div');
            el.classList.add('is-marquee');
            el.innerHTML = '<span>Short</span>';

            Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
            Object.defineProperty(el, 'scrollWidth', { value: 50, configurable: true });

            UI.updateMarquee(el);

            expect(el.classList.contains('is-marquee')).toBe(false);
            expect(el.style.getPropertyValue('--marquee-width')).toBe('0px');
        });

        it('should avoid re-observing already observed elements on subsequent updates', () => {
            const el = document.createElement('div');
            el.innerHTML = '<span>Text</span>';
            Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
            Object.defineProperty(el, 'scrollWidth', { value: 150, configurable: true });

            UI._initResizeObserver();
            const observeSpy = vi.spyOn(UI._resizeObserver, 'observe');

            UI.updateMarquee(el);
            UI.updateMarquee(el);

            expect(observeSpy).toHaveBeenCalledTimes(1);
        });

        it('should process ResizeObserver entries directly in the batch without re-observing', () => {
            const el = document.createElement('div');
            el.innerHTML = '<span>Resized Long Content</span>';
            Object.defineProperty(el, 'scrollWidth', { value: 300, configurable: true });

            UI._initResizeObserver();
            const observeSpy = vi.spyOn(UI._resizeObserver, 'observe');
            observeSpy.mockClear();

            // Simulate ResizeObserver callback triggering
            UI._resizeObserver.callback([
                {
                    target: el,
                    contentRect: { width: 150 }
                }
            ]);

            expect(observeSpy).not.toHaveBeenCalled();
            expect(el.classList.contains('is-marquee')).toBe(true);
            expect(el.style.getPropertyValue('--marquee-width')).toBe('150px');
        });

        it('should unobserve element and remove cached widths via unobserveMarquee', () => {
            const el = document.createElement('div');
            UI._initResizeObserver();
            const unobserveSpy = vi.spyOn(UI._resizeObserver, 'unobserve');

            UI.updateMarquee(el);
            UI._parentWidths.set(el, 120);

            UI.unobserveMarquee(el);
            expect(unobserveSpy).toHaveBeenCalledWith(el);
            expect(UI._parentWidths.get(el)).toBeUndefined();
        });

        it('should throttle multiple rAF requests to a single batch per frame', () => {
            const el1 = document.createElement('div');
            const el2 = document.createElement('div');

            let rafCount = 0;
            vi.stubGlobal('requestAnimationFrame', () => {
                rafCount++;
                // simulate pending callback without executing immediately
            });

            UI._isMarqueeBatchScheduled = false;
            UI.updateMarquee(el1);
            UI.updateMarquee(el2);

            expect(rafCount).toBe(1);
        });
    });

    describe('updateTrackInfo (with marquee)', () => {
        let elements;
        const track = { title: 'T', artist: 'A' };

        beforeEach(() => {
            elements = {
                title: document.createElement('div'),
                artist: document.createElement('div')
            };
            vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('should wrap text in span and call updateMarquee', () => {
            const spy = vi.spyOn(UI, 'updateMarquee');

            UI.updateTrackInfo(elements, track);

            expect(elements.title.querySelector('span').textContent).toBe('T');
            expect(elements.artist.querySelector('span').textContent).toBe('A');
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('setupLongPress', () => {
        let button;
        let onShortPress;
        let onLongPress;

        beforeEach(() => {
            vi.useFakeTimers();
            button = document.createElement('button');
            document.body.appendChild(button);
            onShortPress = vi.fn();
            onLongPress = vi.fn();
        });

        afterEach(() => {
            vi.useRealTimers();
            button.remove();
        });

        it('should trigger onShortPress on normal pointer click', () => {
            UI.setupLongPress(button, { onShortPress, onLongPress, delay: 500 });

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(100);
            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click'));

            expect(onShortPress).toHaveBeenCalledTimes(1);
            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('should trigger onLongPress when held for delay and suppress subsequent short press', () => {
            UI.setupLongPress(button, { onShortPress, onLongPress, delay: 500 });

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledTimes(1);

            // User releases pointer and browser fires synthetic click
            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click', { cancelable: true }));

            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('should suppress synthetic mousedown and click following pointer long press', () => {
            UI.setupLongPress(button, { onShortPress, onLongPress, delay: 500 });

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledTimes(1);

            // User releases pointer
            button.dispatchEvent(new Event('pointerup'));
            // Synthetic mouse events emitted by browser after touch release
            button.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            button.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
            button.dispatchEvent(new MouseEvent('click', { cancelable: true }));

            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('should cancel long press if pointer moves beyond tolerance threshold', () => {
            UI.setupLongPress(button, { onShortPress, onLongPress, delay: 500 });

            const downEvent = new Event('pointerdown');
            downEvent.clientX = 10;
            downEvent.clientY = 10;
            button.dispatchEvent(downEvent);

            // Large move > 10px
            const moveEvent = new Event('pointermove');
            moveEvent.clientX = 50;
            moveEvent.clientY = 50;
            button.dispatchEvent(moveEvent);

            vi.advanceTimersByTime(500);
            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('should NOT cancel long press if pointer moves within jitter tolerance (<= 10px)', () => {
            UI.setupLongPress(button, { onShortPress, onLongPress, delay: 500 });

            const downEvent = new Event('pointerdown');
            downEvent.clientX = 10;
            downEvent.clientY = 10;
            button.dispatchEvent(downEvent);

            // Micro move (2px)
            const moveEvent = new Event('pointermove');
            moveEvent.clientX = 12;
            moveEvent.clientY = 11;
            button.dispatchEvent(moveEvent);

            vi.advanceTimersByTime(500);
            expect(onLongPress).toHaveBeenCalledTimes(1);
        });

        it('should support keyboard accessibility with Space and Enter', () => {
            UI.setupLongPress(button, { onShortPress, onLongPress, delay: 500 });

            // Keyboard tap with Enter
            button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            vi.advanceTimersByTime(50);
            button.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
            button.dispatchEvent(new MouseEvent('click'));

            expect(onShortPress).toHaveBeenCalledTimes(1);
            expect(onLongPress).not.toHaveBeenCalled();

            // Keyboard hold with Space
            button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledTimes(1);

            button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
            button.dispatchEvent(new MouseEvent('click', { cancelable: true }));

            // Still only 1 short press from earlier tap
            expect(onShortPress).toHaveBeenCalledTimes(1);
        });

        it('should clean up event listeners on teardown', () => {
            const cleanup = UI.setupLongPress(button, { onShortPress, onLongPress, delay: 500 });
            cleanup();

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(600);
            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click'));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('should bind elements using a CSS selector string', () => {
            button.className = 'test-selector-btn';
            const cleanup = UI.setupLongPress('.test-selector-btn', { onShortPress, onLongPress, delay: 300 });

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(300);

            expect(onLongPress).toHaveBeenCalledTimes(1);
            cleanup();
        });

        it('should bind an array or NodeList of elements and pass (e, button) to callbacks', () => {
            const btn2 = document.createElement('button');
            document.body.appendChild(btn2);

            const shortArgs = [];
            const longArgs = [];

            const cleanup = UI.setupLongPress([button, btn2], {
                onShortPress: (e, el) => shortArgs.push(el),
                onLongPress: (e, el) => longArgs.push(el),
                delay: 400
            });

            // Short press on button 1
            button.dispatchEvent(new MouseEvent('click'));
            expect(shortArgs).toEqual([button]);

            // Long press on button 2
            btn2.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(400);
            expect(longArgs).toEqual([btn2]);

            cleanup();
            btn2.remove();
        });

        it('should gracefully handle invalid or non-matching selectors without errors', () => {
            const cleanup1 = UI.setupLongPress('.non-existent-class', { onLongPress });
            expect(typeof cleanup1).toBe('function');
            expect(() => cleanup1()).not.toThrow();

            const cleanup2 = UI.setupLongPress(':::invalid-selector', { onLongPress });
            expect(typeof cleanup2).toBe('function');
            expect(() => cleanup2()).not.toThrow();

            const cleanup3 = UI.setupLongPress(null, { onLongPress });
            expect(typeof cleanup3).toBe('function');
            expect(() => cleanup3()).not.toThrow();
        });
    });
});

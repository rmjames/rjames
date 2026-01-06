import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UI } from '../../../scripts/media/MediaPlayerUI.js';
import { SVG_PATHS } from '../../../scripts/media/Constants.js';
import { ColorExtractor } from '../../../scripts/media/ColorExtractor.js';

// Mock ColorExtractor
vi.mock('../../../scripts/media/ColorExtractor.js', () => ({
    ColorExtractor: {
        getAccentColor: vi.fn().mockResolvedValue('oklch(0.5 0.5 180)')
    }
}));

describe('MediaPlayerUI', () => {
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
            expect(elements.artBtn.innerHTML).toContain('<img src="art.jpg"');
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
    });

    describe('applyAccentColor', () => {
        it('should apply extracted color', async () => {
            const element = document.createElement('div');
            const track = { albumArt: 'test.jpg' };

            await UI.applyAccentColor(element, track, '--accent-color');

            expect(ColorExtractor.getAccentColor).toHaveBeenCalledWith('test.jpg');
            expect(element.style.getPropertyValue('--accent-color')).toBe('oklch(0.5 0.5 180)');
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
});

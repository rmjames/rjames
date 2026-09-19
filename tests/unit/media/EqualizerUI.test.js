import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EqualizerUI } from '../../../scripts/media/EqualizerUI.js';
import { EQ_CONFIG } from '../../../scripts/media/Constants.js';

describe('EqualizerUI', () => {
    let container;
    let audioElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        audioElement = document.createElement('audio');

        // Mock window.AudioContext
        window.AudioContext = vi.fn().mockImplementation(function() {
            return {
                createMediaElementSource: vi.fn().mockReturnValue({
                    connect: vi.fn(),
                    disconnect: vi.fn()
                }),
                createBiquadFilter: vi.fn().mockImplementation(() => ({
                    type: '',
                    frequency: { value: 0 },
                    Q: { value: 0 },
                    gain: { value: 0, setTargetAtTime: vi.fn() },
                    connect: vi.fn(),
                    disconnect: vi.fn()
                })),
                destination: {},
                state: 'running',
                currentTime: 0,
                resume: vi.fn(),
                close: vi.fn().mockResolvedValue()
            };
        });

        localStorage.clear();
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('should render simple equalizer UI with WCAG accessibility attributes (A11Y-01, A11Y-02)', () => {
        const ui = new EqualizerUI(container, audioElement, { type: 'simple' });

        expect(container.classList.contains('media-player__equalizer')).toBe(true);
        const sliders = container.querySelectorAll('input[type="range"]');
        expect(sliders.length).toBe(EQ_CONFIG.length);

        sliders.forEach((slider, index) => {
            expect(slider.getAttribute('aria-label')).toBe(EQ_CONFIG[index].label);
            expect(slider.getAttribute('aria-orientation')).toBe('vertical');
            expect(slider.getAttribute('aria-valuemin')).toBe('-20');
            expect(slider.getAttribute('aria-valuemax')).toBe('20');
            expect(slider.getAttribute('aria-valuenow')).toBe('0');
            expect(slider.getAttribute('aria-valuetext')).toBe('0 dB');
        });

        const closeBtn = container.querySelector('#eq-close-btn');
        expect(closeBtn).not.toBeNull();
        expect(closeBtn.getAttribute('aria-label')).toBe('Close Equalizer');

        ui.destroy();
    });

    it('should safely construct DOM elements without innerHTML XSS injection sink (SEC-03)', () => {
        const ui = new EqualizerUI(container, audioElement);

        const sliderWrappers = container.querySelectorAll('.media-player__equalizer__slider');
        expect(sliderWrappers.length).toBe(EQ_CONFIG.length);

        sliderWrappers.forEach((wrapper, index) => {
            const labelSpan = wrapper.querySelector('.eq-slider__label');
            expect(labelSpan).not.toBeNull();
            expect(labelSpan.textContent).toBe(EQ_CONFIG[index].label);
        });

        ui.destroy();
    });

    it('should cache fill and thumb references on slider containers for fast rendering (PERF-04)', () => {
        const ui = new EqualizerUI(container, audioElement);

        const sliderContainers = container.querySelectorAll('.eq-slider__wrapper');
        sliderContainers.forEach(wrapper => {
            expect(wrapper._cachedFill).toBeDefined();
            expect(wrapper._cachedThumb).toBeDefined();
            expect(wrapper._cachedFill.classList.contains('eq-slider__fill')).toBe(true);
            expect(wrapper._cachedThumb.classList.contains('eq-slider__thumb')).toBe(true);
        });

        ui.destroy();
    });

    it('should safely handle corrupt or non-array localStorage data (SEC-04)', () => {
        // Prototype pollution attempt / non-array object
        localStorage.setItem('rj-eq-settings', JSON.stringify({ malicious: true, '__proto__': { polluted: true } }));

        const ui = new EqualizerUI(container, audioElement, { type: 'full' });
        const inputs = container.querySelectorAll('input[type="range"]');

        inputs.forEach(input => {
            expect(input.value).toBe('0');
        });

        ui.destroy();
    });

    it('should save and load valid clamped settings in full mode (SEC-04, PERF-07)', () => {
        const ui = new EqualizerUI(container, audioElement, { type: 'full' });
        const inputs = container.querySelectorAll('input[type="range"]');

        // Modify first slider to 12.5dB
        inputs[0].value = '12.5';
        const saveBtn = container.querySelector('#eq-save-btn');
        saveBtn.click();

        const stored = JSON.parse(localStorage.getItem('rj-eq-settings'));
        expect(stored[0]).toBe(12.5);

        // Modify again and reload
        inputs[0].value = '-5';
        const loadBtn = container.querySelector('#eq-load-btn');
        loadBtn.click();

        expect(inputs[0].value).toBe('12.5');

        ui.destroy();
    });

    it('should tear down event listeners, clear container, and destroy equalizer on destroy() (PERF-03)', () => {
        const ui = new EqualizerUI(container, audioElement, { type: 'full' });
        const eqDestroySpy = vi.spyOn(ui.eq, 'destroy');

        ui.destroy();

        expect(eqDestroySpy).toHaveBeenCalledTimes(1);
        expect(container.innerHTML).toBe('');
        expect(container.classList.contains('active')).toBe(false);
    });

    it('should toggle visibility state on show(), hide(), and toggle()', () => {
        const ui = new EqualizerUI(container, audioElement);

        expect(ui.isActive).toBe(false);
        expect(container.classList.contains('active')).toBe(false);

        ui.show();
        expect(ui.isActive).toBe(true);
        expect(container.classList.contains('active')).toBe(true);

        ui.hide();
        expect(ui.isActive).toBe(false);
        expect(container.classList.contains('active')).toBe(false);

        ui.toggle();
        expect(ui.isActive).toBe(true);

        ui.toggle();
        expect(ui.isActive).toBe(false);

        ui.destroy();
    });
});

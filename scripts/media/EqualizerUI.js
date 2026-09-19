import { EQ_CONFIG } from './Constants.js';
import { Equalizer } from './Equalizer.js';
import { UI } from './MediaPlayerUI.js';

export class EqualizerUI {
    constructor(container, audioElement, options = {}) {
        this.container = container;
        this.audioElement = audioElement;
        this.type = options.type || 'simple';
        this.eq = new Equalizer(audioElement);
        this.isEqOn = true;
        this.isActive = false;
        this._abortController = new AbortController();

        this._render();
        this._bindEvents();
    }

    _getSavedSettings() {
        if (this.type !== 'full') return [];
        try {
            const raw = localStorage.getItem('rj-eq-settings');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch {
            // Storage access blocked or JSON syntax error (SEC-04)
        }
        return [];
    }

    _render() {
        this.container.classList.add('media-player__equalizer');
        this.container.innerHTML = '';

        if (this.type === 'full') {
            this.container.innerHTML = `
                <div class="eq-sidebar">
                    <button class="eq-sidebar__btn" id="eq-close-btn" data-analytics-element="Close Equalizer" aria-label="Close Equalizer">
                        <svg viewBox="0 -960 960 960"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>
                    </button>
                    <button class="eq-sidebar__btn active" id="eq-power-btn" data-analytics-element="Toggle Equalizer" aria-label="Toggle Equalizer">
                        <svg viewBox="0 -960 960 960"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm0-80q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm-40-560h80v240h-80v-240Zm40 320q17 0 28.5-11.5T520-480q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480q0 17 11.5 28.5T480-440Zm0 40Z" /></svg>
                    </button>
                    <button class="eq-sidebar__btn" id="eq-save-btn" data-analytics-element="Save Settings" aria-label="Save Settings">
                        <svg viewBox="0 -960 960 960"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" /></svg>
                    </button>
                    <button class="eq-sidebar__btn" id="eq-load-btn" data-analytics-element="Load Settings" aria-label="Load Settings">
                        <svg viewBox="0 -960 960 960"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" /></svg>
                    </button>
                </div>
                <div class="eq-grid"></div>
            `;
        } else {
            this.container.innerHTML = `
                <div class="eq-header">
                    <h3>Equalizer</h3>
                    <button class="eq-close" id="eq-close-btn" title="Close" aria-label="Close Equalizer" data-analytics-element="Close">
                        <svg viewBox="0 -960 960 960">
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                        </svg>
                    </button>
                </div>
                <div class="eq-grid"></div>
            `;
        }

        const eqGrid = this.container.querySelector('.eq-grid');
        const savedSettings = this._getSavedSettings();

        EQ_CONFIG.forEach((config, index) => {
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'media-player__equalizer__slider';

            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'eq-slider__wrapper';

            const track = document.createElement('div');
            track.className = 'eq-slider__track';

            const fill = document.createElement('div');
            fill.className = 'eq-slider__fill';

            const thumb = document.createElement('div');
            thumb.className = 'eq-slider__thumb';

            // Cache fill and thumb references to avoid layout thrashing during input events (PERF-04)
            sliderContainer._cachedFill = fill;
            sliderContainer._cachedThumb = thumb;

            const input = document.createElement('input');
            input.type = 'range';
            input.min = '-20';
            input.max = '20';
            input.step = '.1';

            // Pre-load saved value to eliminate redundant second-pass reflow (PERF-07)
            let initialVal = 0;
            if (savedSettings[index] !== undefined) {
                const parsedVal = parseFloat(savedSettings[index]);
                if (Number.isFinite(parsedVal)) {
                    initialVal = Math.max(-20, Math.min(20, parsedVal));
                }
            }
            input.value = String(initialVal);

            // Accessibility attributes (A11Y-01)
            input.setAttribute('aria-label', config.label);
            input.setAttribute('aria-orientation', 'vertical');
            input.setAttribute('aria-valuemin', '-20');
            input.setAttribute('aria-valuemax', '20');
            input.setAttribute('aria-valuenow', String(initialVal));
            input.setAttribute('aria-valuetext', `${initialVal > 0 ? '+' : ''}${initialVal} dB`);

            sliderContainer.append(track, fill, thumb, input);

            // Safe DOM text assignment to close DOM XSS sink (SEC-03)
            const labelSpan = document.createElement('span');
            labelSpan.className = 'eq-slider__label';
            labelSpan.textContent = config.label;

            sliderWrapper.append(sliderContainer, labelSpan);
            eqGrid.appendChild(sliderWrapper);

            if (initialVal !== 0 && this.isEqOn) {
                this.eq.setGain(index, initialVal);
            }
        });

        this.inputs = this.container.querySelectorAll('input[type="range"]');
        this.inputs.forEach((input) => {
            UI.updateSliderVisuals(input);
        });
    }

    _bindEvents() {
        const { signal } = this._abortController;

        this.inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                UI.updateSliderVisuals(e.target);
                if (this.isEqOn) {
                    const gainVal = parseFloat(e.target.value);
                    if (Number.isFinite(gainVal)) {
                        this.eq.setGain(index, gainVal);
                    }
                }
            }, { signal });
        });

        const closeBtn = this.container.querySelector('#eq-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
                this.container.dispatchEvent(new CustomEvent('eq-closed', { bubbles: true }));
            }, { signal });
        }

        if (this.type === 'full') {
            const powerBtn = this.container.querySelector('#eq-power-btn');
            const saveBtn = this.container.querySelector('#eq-save-btn');
            const loadBtn = this.container.querySelector('#eq-load-btn');

            if (powerBtn) {
                powerBtn.addEventListener('click', () => {
                    this.isEqOn = !this.isEqOn;
                    powerBtn.classList.toggle('active', this.isEqOn);
                    this.container.classList.toggle('disabled', !this.isEqOn);
                    this.eq.setEnabled(this.isEqOn);
                    this.inputs.forEach((input, index) => {
                        const val = parseFloat(input.value);
                        this.eq.setGain(index, this.isEqOn && Number.isFinite(val) ? val : 0);
                    });
                }, { signal });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    try {
                        const settings = Array.from(this.inputs).map(i => {
                            const val = parseFloat(i.value);
                            return Number.isFinite(val) ? Math.max(-20, Math.min(20, val)) : 0;
                        });
                        localStorage.setItem('rj-eq-settings', JSON.stringify(settings));
                        saveBtn.classList.add('active');
                        setTimeout(() => saveBtn.classList.remove('active'), 1000);
                    } catch (err) {
                        console.warn('Failed to save EQ settings to localStorage:', err);
                    }
                }, { signal });
            }

            if (loadBtn) {
                loadBtn.addEventListener('click', () => {
                    this._loadSettings();
                    loadBtn.classList.add('active');
                    setTimeout(() => loadBtn.classList.remove('active'), 1000);
                }, { signal });
            }
        }
    }

    _loadSettings() {
        const savedSettings = this._getSavedSettings();
        this.inputs.forEach((input, index) => {
            if (savedSettings[index] !== undefined) {
                const parsedVal = parseFloat(savedSettings[index]);
                if (Number.isFinite(parsedVal)) {
                    const clamped = Math.max(-20, Math.min(20, parsedVal));
                    input.value = String(clamped);
                    UI.updateSliderVisuals(input);
                    if (this.isEqOn) this.eq.setGain(index, clamped);
                }
            }
        });
    }

    show() {
        this.eq.init();
        this.eq.resume();
        this.isActive = true;
        this.container.classList.add('active');
    }

    hide() {
        this.isActive = false;
        this.container.classList.remove('active');
    }

    toggle() {
        if (this.isActive) {
            this.hide();
        } else {
            this.show();
        }
        return this.isActive;
    }

    initAudio() {
        this.eq.init();
    }

    destroy() {
        if (this._abortController) {
            this._abortController.abort();
        }
        if (this.eq) {
            this.eq.destroy();
        }
        this.container.innerHTML = '';
        this.container.classList.remove('media-player__equalizer', 'active', 'disabled');
        this.inputs = [];
    }
}


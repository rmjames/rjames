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

        this._render();
        this._bindEvents();

        if (this.type === 'full') {
            this._loadSettings();
        }
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
                    <button class="eq-close" id="eq-close-btn" title="Close" data-analytics-element="Close">
                        <svg viewBox="0 -960 960 960">
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                        </svg>
                    </button>
                </div>
                <div class="eq-grid"></div>
            `;
        }

        const eqGrid = this.container.querySelector('.eq-grid');

        EQ_CONFIG.forEach((config) => {
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'media-player__equalizer__slider';
            sliderWrapper.innerHTML = `
                <div class="eq-slider__wrapper">
                    <div class="eq-slider__track"></div>
                    <div class="eq-slider__fill"></div>
                    <div class="eq-slider__thumb"></div>
                    <input type="range" min="-12" max="12" value="0" step="0.1" aria-label="${config.label}">
                </div>
                <span class="eq-slider__label">${config.label}</span>
            `;
            eqGrid.appendChild(sliderWrapper);
        });

        this.inputs = this.container.querySelectorAll('input[type="range"]');
        this.inputs.forEach((input) => {
            UI.updateSliderVisuals(input);
        });
    }

    _bindEvents() {
        this.inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                UI.updateSliderVisuals(e.target);
                if (this.isEqOn) this.eq.setGain(index, parseFloat(e.target.value));
            });
        });

        const closeBtn = this.container.querySelector('#eq-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
                // Dispatch custom event for the parent component to handle local states if needed
                this.container.dispatchEvent(new CustomEvent('eq-closed', { bubbles: true }));
            });
        }

        if (this.type === 'full') {
            const powerBtn = this.container.querySelector('#eq-power-btn');
            const saveBtn = this.container.querySelector('#eq-save-btn');
            const loadBtn = this.container.querySelector('#eq-load-btn');

            powerBtn.addEventListener('click', () => {
                this.isEqOn = !this.isEqOn;
                powerBtn.classList.toggle('active', this.isEqOn);
                this.container.classList.toggle('disabled', !this.isEqOn);
                this.inputs.forEach((input, index) => {
                    this.eq.setGain(index, this.isEqOn ? parseFloat(input.value) : 0);
                });
            });

            saveBtn.addEventListener('click', () => {
                const settings = Array.from(this.inputs).map(i => i.value);
                localStorage.setItem('rj-eq-settings', JSON.stringify(settings));
                saveBtn.classList.add('active');
                setTimeout(() => saveBtn.classList.remove('active'), 1000);
            });

            loadBtn.addEventListener('click', () => {
                this._loadSettings();
                loadBtn.classList.add('active');
                setTimeout(() => loadBtn.classList.remove('active'), 1000);
            });
        }
    }

    _loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('rj-eq-settings') || '[]');
        this.inputs.forEach((input, index) => {
            if (savedSettings[index] !== undefined) {
                input.value = savedSettings[index];
                UI.updateSliderVisuals(input);
                if (this.isEqOn) this.eq.setGain(index, parseFloat(input.value));
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

    // Allows external triggers to init audio context (e.g. on play)
    initAudio() {
        this.eq.init();
    }
}

export class MediaProgress extends HTMLElement {
    static get observedAttributes() {
        return ['value', 'max', 'current-time', 'duration'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._value = 0;
        this._max = 100;
        this._currentTime = '0:00';
        this._duration = '0:00';
    }

    connectedCallback() {
        this.render();
        const slider = this.shadowRoot.querySelector('input');
        slider.addEventListener('input', (e) => {
            this.dispatchEvent(new CustomEvent('media-seek', {
                detail: { value: e.target.value },
                bubbles: true,
                composed: true
            }));
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') this._value = newValue;
        if (name === 'max') this._max = newValue;
        if (name === 'current-time') this._currentTime = newValue;
        if (name === 'duration') this._duration = newValue;
        this.updateSlider();
    }

    updateSlider() {
        const slider = this.shadowRoot.querySelector('input');
        const currentLabel = this.shadowRoot.querySelector('.time--current');
        const durationLabel = this.shadowRoot.querySelector('.time--duration');
        if (slider) {
            slider.value = this._value;
            slider.max = this._max;
        }
        if (currentLabel) currentLabel.textContent = this._currentTime;
        if (durationLabel) durationLabel.textContent = this._duration;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    gap: 0.75rem;
                    container-type: inline-size;
                    color: white;
                    inline-size: 100%;
                }

                .time {
                    font-size: 0.75rem;
                    font-variant-numeric: tabular-nums;
                    opacity: 0.7;
                    min-inline-size: 2.5rem;
                }

                .time--current { text-align: right; }
                .time--duration { text-align: left; }

                input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                    cursor: pointer;
                    width: 100%;
                }

                input[type="range"]::-webkit-slider-runnable-track {
                    background: oklch(from white l c h / 0.1);
                    height: 4px;
                    border-radius: 2px;
                }

                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 12px;
                    width: 12px;
                    background-color: white;
                    border-radius: 50%;
                    margin-top: -4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                @container (max-width: 12rem) {
                    .time {
                        display: none;
                    }
                    :host {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            <span class="time time--current">${this._currentTime}</span>
            <input type="range" min="0" max="${this._max}" value="${this._value}">
            <span class="time time--duration">${this._duration}</span>
        `;
    }
}

if (!customElements.get('media-progress')) {
    customElements.define('media-progress', MediaProgress);
}

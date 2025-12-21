export class MediaEqualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._gains = [0, 0, 0, 0, 0];
        this._labels = ['50Hz', '230Hz', '910Hz', '4kHz', '12kHz'];
        this._active = true;
    }

    set gains(value) {
        this._gains = value;
        this.updateSliders();
    }

    connectedCallback() {
        this.render();
    }

    updateSliders() {
        const sliders = this.shadowRoot.querySelectorAll('input');
        sliders.forEach((s, i) => {
            s.value = this._gains[i];
            this._updateSliderVisuals(s);
        });
    }

    _updateSliderVisuals(input) {
        const pct = ((input.value - -12) / (12 - -12)) * 100;
        const wrapper = input.parentElement;
        const fill = wrapper.querySelector('.fill');
        const thumb = wrapper.querySelector('.thumb');

        const topPos = 100 - pct;
        thumb.style.top = `${topPos}%`;

        const center = 50;
        if (pct >= center) {
            fill.style.top = `${topPos}%`;
            fill.style.height = `${pct - center}%`;
        } else {
            fill.style.top = `50%`;
            fill.style.height = `${center - pct}%`;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 1rem;
                    background: oklch(from #222 l c h);
                    padding: 1rem;
                    border-radius: 1.25rem;
                    container-type: inline-size;
                    color: white;
                }

                .sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.5rem;
                }

                .slider-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .wrapper {
                    position: relative;
                    height: 8rem;
                    width: 0.75rem;
                    background: oklch(from white l c h / 0.1);
                    border-radius: 1rem;
                    overflow: hidden;
                }

                .fill {
                    position: absolute;
                    width: 100%;
                    background: oklch(0.6 0.2 260);
                    border-radius: 1rem;
                }

                .thumb {
                    position: absolute;
                    width: 1.5rem;
                    height: 0.25rem;
                    background: white;
                    left: 50%;
                    transform: translateX(-50%);
                    pointer-events: none;
                    z-index: 2;
                }

                input {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    cursor: pointer;
                    writing-mode: bt-lr; /* vertical range */
                    appearance: slider-vertical;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                }

                .label {
                    font-size: 0.65rem;
                    opacity: 0.7;
                }

                @container (max-width: 15rem) {
                    :host {
                        grid-template-columns: 1fr;
                    }
                    .sidebar {
                        flex-direction: row;
                    }
                }
            </style>
            <div class="sidebar">
                <slot name="actions"></slot>
            </div>
            <div class="grid">
                ${this._labels.map((label, i) => `
                    <div class="slider-container">
                        <div class="wrapper">
                            <div class="fill"></div>
                            <div class="thumb"></div>
                            <input type="range" min="-12" max="12" value="${this._gains[i]}" step="0.1" data-index="${i}">
                        </div>
                        <span class="label">${label}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.shadowRoot.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                this._updateSliderVisuals(e.target);
                this.dispatchEvent(new CustomEvent('media-eq-change', {
                    detail: { index: parseInt(e.target.dataset.index), value: e.target.value },
                    bubbles: true,
                    composed: true
                }));
            });
            this._updateSliderVisuals(input);
        });
    }
}

if (!customElements.get('media-equalizer')) {
    customElements.define('media-equalizer', MediaEqualizer);
}

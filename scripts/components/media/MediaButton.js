import { SVG_PATHS } from '../../media/Constants.js';

export class MediaButton extends HTMLElement {
    static get observedAttributes() {
        return ['type', 'active', 'label'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._type = 'play';
        this._active = false;
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener('click', this._handleClick.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'type') this._type = newValue;
        if (name === 'active') this._active = newValue !== null;
        this.render();
    }

    _handleClick(e) {
        let action = this._type;
        if (this._type === 'play' && this._active) action = 'pause';

        this.dispatchEvent(new CustomEvent('media-action', {
            detail: { action },
            bubbles: true,
            composed: true
        }));
    }

    getIcon() {
        switch (this._type) {
            case 'play': return { path: this._active ? SVG_PATHS.PAUSE : SVG_PATHS.PLAY, viewbox: '0 -960 960 960' };
            case 'next': return { path: SVG_PATHS.NEXT, viewbox: '0 -960 960 960' };
            case 'prev': return { path: SVG_PATHS.PREV, viewbox: '0 -960 960 960' };
            case 'like': return { path: this._active ? SVG_PATHS.LIKE_FILLED : SVG_PATHS.LIKE, viewbox: '0 -960 960 960' };
            case 'shuffle': return { path: SVG_PATHS.RANDOM, viewbox: '0 0 24 24' };
            default: return { path: '', viewbox: '0 -960 960 960' };
        }
    }

    render() {
        const { path, viewbox } = this.getIcon();
        const label = this.getAttribute('label') || this._type;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    container-type: inline-size;
                    inline-size: 100%;
                    block-size: 100%;
                    --icon-size: 1.5rem;
                    --btn-bg: transparent;
                    --btn-color: currentColor;
                    --btn-radius: 0.75rem;
                }

                button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    inline-size: 100%;
                    block-size: 100%;
                    padding: 0.5rem;
                    background: var(--btn-bg);
                    border: none;
                    border-radius: var(--btn-radius);
                    color: var(--btn-color);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                button:hover {
                    background: oklch(from var(--btn-color) l c h / 0.1);
                }

                button:active {
                    transform: scale(0.95);
                }

                svg {
                    inline-size: var(--icon-size);
                    block-size: var(--icon-size);
                    fill: currentColor;
                }

                @container (min-width: 3rem) {
                    :host {
                        --icon-size: 2rem;
                    }
                }
            </style>
            <button type="button" aria-label="${label}">
                <svg viewBox="${viewbox}">
                    <path d="${path}" />
                </svg>
            </button>
        `;
    }
}

if (!customElements.get('media-button')) {
    customElements.define('media-button', MediaButton);
}

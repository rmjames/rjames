export class MediaArt extends HTMLElement {
    static get observedAttributes() {
        return ['src', 'alt'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._src = '';
        this._alt = 'Album Art';
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src') this._src = newValue;
        if (name === 'alt') this._alt = newValue;
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    container-type: inline-size;
                    aspect-ratio: 1;
                    overflow: hidden;
                    border-radius: 1rem;
                    background: oklch(from #333 l c h / 0.5);
                    position: relative;
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.3s ease;
                    display: block;
                }

                .fallback {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: ${this._src ? 0 : 1};
                }

                svg {
                    width: 40%;
                    height: 40%;
                    fill: white;
                    opacity: 0.3;
                }

                @container (max-width: 5rem) {
                    :host {
                        border-radius: 0.5rem;
                    }
                }
            </style>
            <div class="fallback">
                <svg viewBox="0 -960 960 960">
                    <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
                </svg>
            </div>
            ${this._src ? `<img src="${this._src}" alt="${this._alt}" />` : ''}
        `;
    }
}

if (!customElements.get('media-art')) {
    customElements.define('media-art', MediaArt);
}

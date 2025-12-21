export class MediaPresets extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._tracks = [];
    }

    set tracks(value) {
        this._tracks = value;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
                    gap: 0.5rem;
                    container-type: inline-size;
                    inline-size: 100%;
                }

                .preset {
                    aspect-ratio: 1;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    border: none;
                    background: oklch(from #333 l c h);
                    cursor: pointer;
                    transition: transform 0.2s ease;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .preset:hover {
                    transform: scale(1.05);
                }

                .preset img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preset svg {
                    width: 50%;
                    height: 50%;
                    fill: white;
                    opacity: 0.5;
                }

                @container (min-width: 15rem) {
                    :host {
                        grid-template-columns: repeat(5, 1fr);
                    }
                }
            </style>
            ${this._tracks.map((track, index) => `
                <button class="preset" data-index="${index}" title="${track.title} - ${track.artist}">
                    ${track.albumArt ? `<img src="${track.albumArt}" alt="${track.title}" loading="lazy">` : `
                        <svg viewBox="0 -960 960 960">
                            <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
                        </svg>
                    `}
                </button>
            `).join('')}
        `;

        this.shadowRoot.querySelectorAll('.preset').forEach(btn => {
            btn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('media-select-track', {
                    detail: { index: parseInt(btn.dataset.index) },
                    bubbles: true,
                    composed: true
                }));
            });
        });
    }
}

if (!customElements.get('media-presets')) {
    customElements.define('media-presets', MediaPresets);
}

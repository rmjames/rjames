export class MediaMeta extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'artist'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._title = 'Loading...';
        this._artist = '...';
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'title') this._title = newValue;
        if (name === 'artist') this._artist = newValue;
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 0.125rem;
                    min-inline-size: 0;
                    container-type: inline-size;
                    color: white;
                }

                .title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin: 0;
                }

                .artist {
                    font-size: 0.75rem;
                    color: oklch(from white l c h / 0.6);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin: 0;
                }

                @container (min-width: 15rem) {
                    .title { font-size: 1rem; }
                    .artist { font-size: 0.875rem; }
                }

                @container (min-width: 25rem) {
                    .title { font-size: 1.25rem; }
                    .artist { font-size: 1rem; }
                }
            </style>
            <h3 class="title">${this._title}</h3>
            <p class="artist">${this._artist}</p>
        `;
    }
}

if (!customElements.get('media-meta')) {
    customElements.define('media-meta', MediaMeta);
}

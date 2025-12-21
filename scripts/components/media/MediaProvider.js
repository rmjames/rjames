import { MediaPlayerCore } from '../../media/MediaPlayerCore.js';

export class MediaProvider extends HTMLElement {
    constructor() {
        super();
        this._core = null;
        this._audio = null;
    }

    connectedCallback() {
        console.log('MediaProvider connected');
        if (!this._audio) {
            this._audio = document.createElement('audio');
            this._audio.id = 'media-provider-audio';
            this._audio.crossOrigin = 'anonymous';
            this.appendChild(this._audio);
            console.log('Audio element created');
        }

        if (!this._core) {
            this._core = new MediaPlayerCore(this._audio);
            this._core.subscribe((event, data) => {
                console.log('Media state change:', event, data);
                this.dispatchEvent(new CustomEvent('media-state-change', {
                    detail: { event, data },
                    bubbles: true,
                    composed: true
                }));
            });
            console.log('MediaPlayerCore initialized');
        }
    }

    get core() {
        return this._core;
    }

    get audio() {
        return this._audio;
    }

    loadTrack(index) {
        return this._core.loadTrack(index);
    }

    play() {
        return this._core.play();
    }

    pause() {
        return this._core.pause();
    }

    togglePlay() {
        return this._core.togglePlay();
    }

    next() {
        return this._core.next();
    }

    prev() {
        return this._core.prev();
    }
}

if (!customElements.get('media-provider')) {
    customElements.define('media-provider', MediaProvider);
}

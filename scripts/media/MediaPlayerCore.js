import { audioLibrary } from '../AudioLibrary.js';

export class MediaPlayerCore {
    constructor(audioElement) {
        this.audio = audioElement;
        this.tracks = audioLibrary.getAll();
        this.currentIndex = 0;
        this.listeners = new Set();

        this._initAudioEvents();
    }

    _initAudioEvents() {
        this.audio.addEventListener('play', () => this.notify('play'));
        this.audio.addEventListener('pause', () => this.notify('pause'));
        this.audio.addEventListener('ended', () => this.notify('ended'));
        this.audio.addEventListener('error', (e) => this.notify('error', e));
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(event, data) {
        this.listeners.forEach(cb => cb(event, data));
    }

    loadTrack(index) {
        if (index < 0) index = this.tracks.length - 1;
        if (index >= this.tracks.length) index = 0;

        this.currentIndex = index;
        const track = this.tracks[this.currentIndex];

        if (!this.audio.src.endsWith(track.src)) {
            this.audio.src = track.src;
        }

        this.notify('trackChanged', track);
        return track;
    }

    play() {
        if (!this.audio.src && this.tracks.length > 0) {
            this.loadTrack(0);
        }
        return this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    togglePlay() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    next() {
        const track = this.loadTrack(this.currentIndex + 1);
        this.play();
        return track;
    }

    prev() {
        const track = this.loadTrack(this.currentIndex - 1);
        this.play();
        return track;
    }

    get currentTrack() {
        return this.tracks[this.currentIndex];
    }

    shuffle() {
        if (this.tracks.length <= 1) return this.currentTrack;

        let nextRandom;
        do {
            nextRandom = Math.floor(Math.random() * this.tracks.length);
        } while (nextRandom === this.currentIndex);

        const track = this.loadTrack(nextRandom);
        this.play();
        return track;
    }
}

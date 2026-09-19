import { audioLibrary, resolveMediaUrl } from '../AudioLibrary.js';
import { mediaSessionService } from './MediaSessionService.js';

/**
 * Checks if a signed media URL's expiration timestamp has passed or is close to expiring.
 */
export function isStreamUrlExpired(url, skewSeconds = 15) {
    if (!url || typeof url !== 'string') return true;
    try {
        const dummyBase = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null')
            ? window.location.origin
            : 'https://localhost';
        const parsed = new URL(url, dummyBase);
        const expires = parsed.searchParams.get('expires');
        if (!expires) return false;
        const expireTime = parseInt(expires, 10);
        if (!Number.isFinite(expireTime)) return true;
        const now = Math.floor(Date.now() / 1000);
        return expireTime <= (now + skewSeconds);
    } catch {
        return false;
    }
}

/**
 * Fetches signed stream URL from application backend (Model 1: Signed Stream URLs).
 * Falls back to direct track.src if backend signing route is unavailable.
 */
export async function fetchStreamUrl(trackOrId) {
    if (!trackOrId) return '';
    const track = typeof trackOrId === 'string'
        ? (audioLibrary.getById(trackOrId) || { id: trackOrId, src: resolveMediaUrl(trackOrId) })
        : trackOrId;

    if (track.streamUrl && !isStreamUrlExpired(track.streamUrl)) {
        return track.streamUrl;
    }

    const episodeId = track.id || track.src;

    // 1. Try episode-specific stream-url route
    try {
        const res = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}/stream-url`);
        if (res.ok) {
            const data = await res.json();
            if (data?.streamUrl) {
                track.streamUrl = data.streamUrl;
                return data.streamUrl;
            }
        }
    } catch {
        // Backend route not reachable
    }

    // 2. Try generic path-based stream-url route
    try {
        const path = track.rawSrc || track.src;
        const res = await fetch(`/api/stream-url?path=${encodeURIComponent(path)}`);
        if (res.ok) {
            const data = await res.json();
            if (data?.streamUrl) {
                track.streamUrl = data.streamUrl;
                return data.streamUrl;
            }
        }
    } catch {
        // Backend route not reachable
    }

    // Fall back to resolved direct media URL
    return track.src || '';
}

/**
 * Fetch audio chunk using HTTP Range headers for custom buffering or Web Audio API synthesis.
 */
export async function fetchAudioChunk(url, startByte, endByte, options = {}) {
    if (!url || typeof url !== 'string') {
        throw new TypeError('Invalid audio URL');
    }

    // Validate URL protocol to prevent SSRF and unsafe schemes (SEC-05)
    try {
        const dummyBase = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null')
            ? window.location.origin
            : 'https://localhost';
        const parsed = new URL(url, dummyBase);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new Error(`Unsupported protocol for audio chunk fetch: ${parsed.protocol}`);
        }
    } catch (err) {
        if (err.message && err.message.includes('Unsupported protocol')) throw err;
        throw new TypeError('Invalid audio URL', { cause: err });
    }

    const start = parseInt(startByte, 10);
    const end = parseInt(endByte, 10);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) {
        throw new RangeError('Invalid byte range parameters');
    }

    const MAX_CHUNK_BYTES = 10 * 1024 * 1024; // 10MB safety buffer cap (SEC-05)
    if ((end - start + 1) > MAX_CHUNK_BYTES) {
        throw new RangeError('Requested range exceeds maximum buffer limit (10MB)');
    }

    const response = await fetch(url, {
        headers: {
            'Range': `bytes=${start}-${end}`
        },
        signal: options.signal
    });

    if (response.status !== 206 && response.status !== 200) {
        throw new Error(`Failed to load audio chunk: ${response.status}`);
    }

    return await response.arrayBuffer();
}

export class MediaPlayerCore {
    constructor(audioElement, options = {}) {
        this.audio = audioElement;
        this.options = options;
        // Clone array to prevent mutating shared AudioLibrary singleton (SEC-06)
        this.tracks = [...audioLibrary.getAll()];
        this.currentIndex = 0;
        this.listeners = new Set();
        this._resolveStreamPromise = null;
        this._loadId = 0;
        this._abortController = new AbortController();

        // Enforce CORS safety before loading audio to prevent Web Audio taints (SEC-01)
        if (this.audio && !this.audio.crossOrigin) {
            this.audio.crossOrigin = 'anonymous';
        }

        this._initAudioEvents();

        if (this.options.mediaSession !== false) {
            mediaSessionService.connect(this);
        }
    }

    _initAudioEvents() {
        const { signal } = this._abortController;
        this.audio.addEventListener('play', () => this.notify('play'), { signal });
        this.audio.addEventListener('pause', () => this.notify('pause'), { signal });
        this.audio.addEventListener('ended', () => this.notify('ended'), { signal });
        this.audio.addEventListener('error', (e) => {
            const currentSrc = this.audio.src || '';
            if (currentSrc && !currentSrc.includes('/media/audio/coffee_shop.ogg') && !currentSrc.includes('/media/audio/fire.ogg')) {
                this.audio.src = '/media/audio/coffee_shop.ogg';
                this.audio.play().catch(() => {});
            }
            this.notify('error', e);
        }, { signal });
        this.audio.addEventListener('timeupdate', () => this.notify('timeupdate'), { signal });
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(event, data) {
        this.listeners.forEach(cb => cb(event, data));
    }

    loadTrack(index) {
        if (!this.tracks || this.tracks.length === 0) return null;
        if (index < 0) index = this.tracks.length - 1;
        if (index >= this.tracks.length) index = 0;

        this.currentIndex = index;
        const track = this.tracks[this.currentIndex];
        if (!track) return null;

        const initialSrc = track.streamUrl || track.src;
        if (initialSrc && !this.audio.src.endsWith(initialSrc) && this.audio.src !== initialSrc) {
            this.audio.src = initialSrc;
        }

        // Monotonic load generation counter to eliminate async race conditions (SEC-02)
        const currentLoadId = ++this._loadId;

        // Asynchronously resolve/refresh signed stream URL (Model 1)
        this._resolveStreamPromise = (async () => {
            try {
                const streamUrl = await fetchStreamUrl(track);
                // Stale response check: discard late-resolving requests if track changed
                if (this._loadId !== currentLoadId) {
                    return streamUrl;
                }

                const isDifferentSrc = streamUrl &&
                    this.audio.src !== streamUrl &&
                    !this.audio.src.endsWith(streamUrl);

                if (isDifferentSrc) {
                    const wasPlaying = !this.audio.paused && this.audio.currentTime > 0;
                    const currentTime = this.audio.currentTime;
                    this.audio.src = streamUrl;
                    if (wasPlaying) {
                        this.audio.currentTime = currentTime;
                        this.audio.play().catch(() => {});
                    }
                }
                return streamUrl;
            } catch (err) {
                console.warn('Failed to resolve signed stream URL:', err);
                return track.src;
            }
        })();

        this.notify('trackChanged', track);
        return track;
    }

    async playEpisode(episodeId) {
        let index = this.tracks.findIndex(t => t.id === episodeId);
        if (index === -1) {
            this.tracks.push({ id: episodeId, src: resolveMediaUrl(episodeId) });
            index = this.tracks.length - 1;
        }
        this.loadTrack(index);
        if (this._resolveStreamPromise) {
            await this._resolveStreamPromise;
        }
        return this.play();
    }

    play() {
        if (this.options.mediaSession !== false) {
            try {
                mediaSessionService.connect(this);
            } catch {
                // Media session unsupported or error
            }
        }
        if (!this.tracks || this.tracks.length === 0) {
            this.tracks = audioLibrary.getAll();
        }
        if (!this.audio.src && this.tracks.length > 0) {
            this.loadTrack(0);
        }
        const promise = this.audio.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(err => {
                console.warn('Playback prevented or failed:', err);
                this.notify('pause');
            });
        }
        return promise;
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
        return (this.tracks && this.tracks.length > 0) ? this.tracks[this.currentIndex] : null;
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

    destroy() {
        if (this._abortController) {
            this._abortController.abort();
        }
        if (mediaSessionService.activeCore === this) {
            mediaSessionService.disconnect();
        }
        this.listeners.clear();
    }
}

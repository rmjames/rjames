
export const MEDIA_BASE_URL = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEDIA_BASE_URL) || '').replace(/\/+$/, '');

export const resolveMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }
    // Strip leading relative indicators '../assets/', 'assets/', './assets/', etc.
    let clean = url.replace(/^(\.\.\/|\.\/|\/)?(assets\/)?/, '');
    if (!clean.startsWith('audio/')) {
        clean = `audio/${clean}`;
    }
    // Encode URI path segments while preserving slashes
    const encodedPath = clean.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return MEDIA_BASE_URL ? `${MEDIA_BASE_URL}/${encodedPath}` : `/${encodedPath}`;
};

export class AudioLibrary {
    constructor() {
        this._tracks = null;
        this._loadingPromise = null;
    }

    async load() {
        if (this._tracks) return;
        if (this._loadingPromise) return this._loadingPromise;

        this._loadingPromise = (async () => {
            try {
                // Fetch track data: prefer remote R2 CDN when configured, fall back to local /data/tracks.json
                const cdnUrl = MEDIA_BASE_URL ? `${MEDIA_BASE_URL}/data/tracks.json` : null;
                const localUrl = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null')
                    ? new URL('/data/tracks.json', window.location.origin).href
                    : '/data/tracks.json';

                let response;
                if (cdnUrl) {
                    try {
                        response = await fetch(cdnUrl);
                        if (response && typeof response.ok === 'boolean' && !response.ok) {
                            throw new Error(`CDN status ${response.status}`);
                        }
                    } catch {
                        response = await fetch(localUrl);
                    }
                } else {
                    response = await fetch(localUrl);
                }

                const rawTracks = await response.json();

                this._tracks = rawTracks.map(track => ({
                    ...track,
                    src: resolveMediaUrl(track.src),
                    albumArt: resolveMediaUrl(track.albumArt) || null
                }));
            } catch (err) {
                console.error('Failed to load AudioLibrary metadata:', err);
                this._tracks = [];
            }
        })();

        return this._loadingPromise;
    }

    get tracks() { 
        if (!this._tracks) {
            console.warn('AudioLibrary tracks accessed before load. Returning empty array.');
            return [];
        }
        return this._tracks; 
    }
    getAll() { 
        return this.tracks; 
    }
    getById(id) { 
        return this.tracks.find(track => track.id === id); 
    }
    addTrack(track) { 
        this.tracks.push(track); 
    }
}

export const audioLibrary = new AudioLibrary();

// Top-level await for seamless integration in modern browsers/Vite (skipped in test runner)
const isTestEnv = typeof process !== 'undefined' && process.env?.VITEST;
if (typeof window !== 'undefined' && !isTestEnv) {
    await audioLibrary.load();
}

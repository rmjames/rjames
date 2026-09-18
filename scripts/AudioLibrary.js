
// Obfuscated media service base URL for public repository safety
const _OBF_MEDIA_ENDPOINT = typeof atob === 'function'
    ? atob('aHR0cHM6Ly9tZWRpYS5yb2JlcnRqYW1lcy5ueWM=')
    : (typeof Buffer !== 'undefined' ? Buffer.from('aHR0cHM6Ly9tZWRpYS5yb2JlcnRqYW1lcy5ueWM=', 'base64').toString('utf-8') : '');

export const DEFAULT_MEDIA_BASE_URL = _OBF_MEDIA_ENDPOINT;
export const MEDIA_BASE_URL = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEDIA_BASE_URL) || DEFAULT_MEDIA_BASE_URL).replace(/\/+$/, '');

export const DEFAULT_FALLBACK_TRACKS = [
    {
        id: 'coffee-shop',
        title: 'Coffee Shop Ambience',
        artist: 'Ambient Soundscape',
        album: 'Focus & Relax',
        genre: 'Ambient',
        duration: 120,
        src: '/media/audio/coffee_shop.ogg',
        rawSrc: '/media/audio/coffee_shop.ogg',
        albumArt: '/media/images/cover1.jpg'
    },
    {
        id: 'campfire',
        title: 'Campfire by the Lake',
        artist: 'Nature Sounds',
        album: 'Focus & Relax',
        genre: 'Ambient',
        duration: 180,
        src: '/media/audio/fire.ogg',
        rawSrc: '/media/audio/fire.ogg',
        albumArt: '/media/images/cover2.jpg'
    }
];

export const resolveMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }
    // Direct local root paths like /media/ or /public/media/
    if (url.startsWith('/media/') || url.startsWith('/public/media/')) {
        return url;
    }
    if (url.startsWith('./media/')) {
        return url.slice(1);
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
                // Fetch track data directly from media-service with local fallback
                const cdnUrl = `${MEDIA_BASE_URL}/data/tracks.json`;
                const localUrl = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null')
                    ? new URL('/data/tracks.json', window.location.origin).href
                    : '/data/tracks.json';

                let response;
                try {
                    response = await fetch(cdnUrl);
                    if (!response || (typeof response.ok === 'boolean' && !response.ok)) {
                        throw new Error(`CDN status ${response ? response.status : 'offline'}`);
                    }
                } catch {
                    response = await fetch(localUrl);
                }

                const rawTracks = await response.json();

                this._tracks = rawTracks.map(track => ({
                    ...track,
                    rawSrc: track.src,
                    src: resolveMediaUrl(track.src),
                    albumArt: resolveMediaUrl(track.albumArt) || null
                }));
            } catch (err) {
                console.warn('Failed to load AudioLibrary metadata, using local fallbacks:', err);
                this._tracks = [...DEFAULT_FALLBACK_TRACKS];
            }
        })();

        return this._loadingPromise;
    }

    get tracks() { 
        if (!this._tracks) {
            return DEFAULT_FALLBACK_TRACKS;
        }
        return this._tracks.length > 0 ? this._tracks : DEFAULT_FALLBACK_TRACKS; 
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

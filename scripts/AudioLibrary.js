
const audioAssets = (typeof import.meta !== 'undefined' && typeof import.meta.glob === 'function')
    ? import.meta.glob('../assets/audio/**/*', { eager: true, query: '?url', import: 'default' })
    : {};

const cleanAssetUrl = (url) => typeof url === 'string' ? url.replace(/[?&]import(?:&.*)?$/, '') : url;

// Helper to find asset key robustly
function findAssetKey(src) {
    if (!src) return null;
    if (audioAssets[src]) return src;
    
    const keys = Object.keys(audioAssets);
    const fileName = src.split('/').pop();
    const lowerFileName = fileName.toLowerCase();

    const match = keys.find(k => 
        k.endsWith('/' + fileName) || 
        k === fileName ||
        k.toLowerCase().endsWith('/' + lowerFileName) || 
        k.toLowerCase() === lowerFileName
    );
    
    if (match) {
        console.debug('Fuzzy matched asset:', src, '->', match);
        return match;
    }
    return null;
}

class AudioLibrary {
    constructor() {
        this._tracks = null;
        this._loadingPromise = null;
    }

    async load() {
        if (this._tracks) return;
        if (this._loadingPromise) return this._loadingPromise;

        this._loadingPromise = (async () => {
            try {
                // Fetch the static track data (PERF-19)
                const response = await fetch('/data/tracks.json');
                const rawTracks = await response.json();

                this._tracks = rawTracks.map(track => {
                    const srcKey = findAssetKey(track.src);
                    const rawSrc = srcKey ? audioAssets[srcKey] : null;
                    const srcUrl = cleanAssetUrl(rawSrc);

                    const artKey = findAssetKey(track.albumArt);
                    const rawArt = artKey ? audioAssets[artKey] : null;
                    const mappedArt = cleanAssetUrl(rawArt);

                    if (!srcUrl && Object.keys(audioAssets).length > 0) { 
                        console.warn('Audio asset not found in build:', track.src);
                    }

                    return {
                        ...track,
                        src: srcUrl || track.src,
                        albumArt: mappedArt || track.albumArt || null
                    };
                });
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

// Top-level await for seamless integration in modern browsers/Vite
await audioLibrary.load();

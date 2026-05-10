const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/audio');
const DATA_DIR = path.join(__dirname, '../public/data');
const JSON_FILE = path.join(DATA_DIR, 'tracks.json');
const OUTPUT_FILE = path.join(__dirname, 'AudioLibrary.js');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to check if file is audio
const isAudioFile = (filename) => /\.(mp3|ogg|wav|m4a|flac)$/i.test(filename);
// ... [REST OF HELPERS REMAIN SAME] ...
const findArtInDir = (dir) => {
    try {
        const files = fs.readdirSync(dir);
        const images = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        if (images.length === 0) return null;
        const best = images.find(f => /front|cover/i.test(f)) || images[0];
        return path.join(dir, best);
    } catch { return null; }
};

const toForwardSlashes = (p) => p.split(path.sep).join('/');

async function parseTrackInfo(filePath, mm) {
    const relativePath = path.relative(__dirname, filePath);
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);
    const albumDir = path.basename(dirName);

    let metadata = null;
    try {
        metadata = await mm.parseFile(filePath);
    } catch (err) {
        console.warn(`Could not parse metadata for ${fileName}:`, err.message);
    }

    let title = metadata?.common?.title;
    let artist = metadata?.common?.artist;
    let album = metadata?.common?.album;
    let genre = metadata?.common?.genre?.[0] || 'Hip Hop';
    let duration = metadata?.format?.duration || null;

    if (!title) {
        title = fileName.replace(/\.[^/.]+$/, "");
        title = title.replace(/^\d+\s*[-.]\s*/, '');
        title = title.replace(/\([^)]*\.com\)/i, '').trim();
        title = title.replace(/\(DatPiff Exclusive\)/i, '').trim();
    }

    if (!artist || !album) {
        let dirArtist = 'Unknown Artist';
        let dirAlbum = albumDir;
        const parts = albumDir.split(/\s*-\s*/);
        if (parts.length >= 2) {
            dirArtist = parts[0].trim();
            dirAlbum = parts.slice(1).join(' - ').trim();
        }
        if (!artist) artist = dirArtist;
        if (!album) album = dirAlbum;
    }

    album = album.replace(/\([^)]*\.com\)/i, '').trim();

    let albumArt = null;
    let artFullPath = findArtInDir(dirName);

    if (!artFullPath) {
        const parentDir = path.dirname(dirName);
        const relParent = path.relative(ASSETS_DIR, parentDir);
        if (!relParent.startsWith('..') && parentDir !== dirName) {
            artFullPath = findArtInDir(parentDir);
        }
    }

    if (artFullPath) {
        albumArt = toForwardSlashes(path.relative(__dirname, artFullPath));
    }

    if (!albumArt && metadata?.common?.picture?.[0]) {
        try {
            const pic = metadata.common.picture[0];
            const ext = pic.format === 'image/jpeg' ? '.jpg' : (pic.format === 'image/png' ? '.png' : '.jpg');
            const coverName = `extracted_cover_${album.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${ext}`;
            const coverPath = path.join(dirName, coverName);
            if (!fs.existsSync(coverPath)) {
                fs.writeFileSync(coverPath, pic.data);
            }
            albumArt = toForwardSlashes(path.relative(__dirname, coverPath));
        } catch (e) {
            console.warn(`Failed to extract art for ${fileName}:`, e.message);
        }
    }

    const id = (artist + '-' + title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id, title, artist, src: toForwardSlashes(relativePath), genre, album, duration, albumArt
    };
}

const trackCache = new Map();
let isWatchMode = process.argv.includes('--watch');
let debounceTimer = null;
let mmVal = null;

const saveLibrary = () => {
    const sortedTracks = Array.from(trackCache.values()).sort((a, b) => a.id.localeCompare(b.id));

    // 1. Write JSON data (PERF-19)
    fs.writeFileSync(JSON_FILE, JSON.stringify(sortedTracks, null, 4));

    // 2. Write AudioLibrary.js with fetch logic
    const fileContent = `
const audioAssets = import.meta.glob('../assets/audio/**/*', { eager: true, query: '?url', import: 'default' });

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
                    const srcUrl = srcKey ? audioAssets[srcKey] : null;

                    const artKey = findAssetKey(track.albumArt);
                    const mappedArt = artKey ? audioAssets[artKey] : null;

                    if (!srcUrl) { 
                        console.warn('Audio asset not found in build:', track.src);
                    }

                    return {
                        ...track,
                        src: srcUrl || track.src,
                        albumArt: mappedArt || null
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
`;
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`[${new Date().toLocaleTimeString()}] Updated AudioLibrary.js and tracks.json with ${sortedTracks.length} tracks.`);
};

const triggerSave = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        saveLibrary();
    }, 1000);
};

const main = async () => {
    console.log(`Starting Audio Scanner\${isWatchMode ? ' in WATCH mode' : ''}...`);
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`Directory not found: \${ASSETS_DIR}`);
        return;
    }

    try {
        mmVal = await import('music-metadata');
    } catch (e) {
        console.error('Failed to load music-metadata.');
        process.exit(1);
    }

    let chokidar;
    if (isWatchMode) {
        try { chokidar = require('chokidar'); } catch (e) {
            console.error('Chokidar not found.');
            process.exit(1);
        }
    }
    if (isWatchMode) {
        const watcher = chokidar.watch(ASSETS_DIR, {
            ignored: /(^|[/\\])\../,
            persistent: true,
            ignoreInitial: false
        });

        watcher
            .on('add', async (path) => {
                if (isAudioFile(path)) {
                    const track = await parseTrackInfo(path, mmVal);
                    trackCache.set(path, track);
                    triggerSave();
                }
            })
            .on('change', async (path) => {
                if (isAudioFile(path)) {
                    const track = await parseTrackInfo(path, mmVal);
                    trackCache.set(path, track);
                    triggerSave();
                }
            })
            .on('unlink', (path) => {
                if (trackCache.has(path)) {
                    trackCache.delete(path);
                    triggerSave();
                }
            })
            .on('ready', () => {
                console.log('Initial scan complete. Watching for changes...');
                triggerSave();
            });

    } else {
        const scanDirectory = (dir) => {
            let results = [];
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                if (item.isDirectory()) {
                    results = results.concat(scanDirectory(path.join(dir, item.name)));
                } else if (isAudioFile(item.name)) {
                    results.push(path.join(dir, item.name));
                }
            }
            return results;
        };

        const files = scanDirectory(ASSETS_DIR);
        const tracks = await Promise.all(files.map(f => parseTrackInfo(f, mmVal)));
        files.forEach((f, i) => trackCache.set(f, tracks[i]));
        saveLibrary();
    }
};

main();

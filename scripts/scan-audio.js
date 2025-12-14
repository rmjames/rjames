const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/audio');
const OUTPUT_FILE = path.join(__dirname, 'AudioLibrary.js');

// Helper to check if file is audio
const isAudioFile = (filename) => /\.(mp3|ogg|wav|m4a|flac)$/i.test(filename);

// Helper to find art in a directory
const findArtInDir = (dir) => {
    try {
        const files = fs.readdirSync(dir);
        const images = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        if (images.length === 0) return null;
        const best = images.find(f => /front|cover/i.test(f)) || images[0];
        return path.join(dir, best);
    } catch { return null; }
};

// Helper to separate path normalization
const toForwardSlashes = (p) => p.split(path.sep).join('/');

// Helper to parse a single track
async function parseTrackInfo(filePath, mm) {
    // Calculate path relative to THIS script (which is where AudioLibrary.js will live)
    const relativePath = path.relative(__dirname, filePath);
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);
    const albumName = path.basename(dirName);

    let title = fileName.replace(/\.[^/.]+$/, "");
    title = title.replace(/^\d+\s*[-.]\s*/, '');
    title = title.replace(/\([^)]*\.com\)/i, '').trim();
    title = title.replace(/\(DatPiff Exclusive\)/i, '').trim();

    let artist = 'Unknown Artist';
    let album = albumName;

    if (albumName.includes(' - ')) {
        const parts = albumName.split(' - ');
        artist = parts[0].trim();
        album = parts.slice(1).join(' - ').trim();
    }
    album = album.replace(/\([^)]*\.com\)/i, '').trim();

    let albumArt = null;
    let artFullPath = findArtInDir(dirName);

    if (!artFullPath) {
        // Try parent directory
        const parentDir = path.dirname(dirName);
        const relParent = path.relative(ASSETS_DIR, parentDir);
        if (!relParent.startsWith('..') && parentDir !== dirName) {
            artFullPath = findArtInDir(parentDir);
        }
    }

    if (artFullPath) {
        // Relative to THIS script
        albumArt = toForwardSlashes(path.relative(__dirname, artFullPath));
    }

    let duration = null;
    let metadata = null;
    try {
        metadata = await mm.parseFile(filePath);
        if (metadata && metadata.format && metadata.format.duration) {
            duration = metadata.format.duration;
        }
    } catch (err) {
        console.warn(`Could not parse metadata for ${fileName}:`, err.message);
    }

    // Attempt to extract embedded art if no file art found
    if (!albumArt && metadata && metadata.common && metadata.common.picture && metadata.common.picture.length > 0) {
        try {
            const pic = metadata.common.picture[0];
            const ext = pic.format === 'image/jpeg' ? '.jpg' : (pic.format === 'image/png' ? '.png' : '.jpg');
            const coverName = `extracted_cover${ext}`;
            const coverPath = path.join(dirName, coverName);

            // Only write if it doesn't exist to avoid constant rewrites (and watcher loops)
            if (!fs.existsSync(coverPath)) {
                fs.writeFileSync(coverPath, pic.data);
                console.log(`Extracted album art for ${album} to ${coverName}`);
            }

            // Relative to THIS script
            albumArt = toForwardSlashes(path.relative(__dirname, coverPath));
        } catch (e) {
            console.warn(`Failed to extract art for ${fileName}:`, e.message);
        }
    }

    const id = (artist + '-' + title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return {
        id, title, artist, src: toForwardSlashes(relativePath), genre: 'Hip Hop', album, duration, albumArt
    };
}

// Global Cache
const trackCache = new Map();
let isWatchMode = process.argv.includes('--watch');
let debounceTimer = null;
let mmVal = null; // Music Metadata instance

const saveLibrary = () => {
    // Sort tracks by ID for consistency
    const sortedTracks = Array.from(trackCache.values()).sort((a, b) => a.id.localeCompare(b.id));

    const fileContent = `class AudioLibrary {
    constructor() {
        const rawTracks = ${JSON.stringify(sortedTracks, null, 4)};
        this._tracks = rawTracks.map(track => ({
            ...track,
            src: new URL(track.src, import.meta.url).href,
            albumArt: track.albumArt ? new URL(track.albumArt, import.meta.url).href : null
        }));
    }
    get tracks() { return this._tracks; }
    getAll() { return this._tracks; }
    getById(id) { return this._tracks.find(track => track.id === id); }
    addTrack(track) { this._tracks.push(track); }
}
export const audioLibrary = new AudioLibrary();
`;
    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`[${new Date().toLocaleTimeString()}] Updated AudioLibrary.js with ${sortedTracks.length} tracks.`);
};

// Debounced Save
const triggerSave = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        saveLibrary();
    }, 1000); // 1 second debounce
};

// Main Scanner / Watcher
const main = async () => {
    console.log(`Starting Audio Scanner${isWatchMode ? ' in WATCH mode' : ''}...`);
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`Directory not found: ${ASSETS_DIR}`);
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
            ignored: /(^|[\/\\])\../,
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

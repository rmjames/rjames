#!/usr/bin/env node

/**
 * Script to sync and upload local audio assets to Cloudflare R2.
 * Supports:
 *  - Dry-run mode (--dry-run)
 *  - Key normalization (relative path to 'audio/...')
 *  - Wrangler CLI batch upload or AWS S3 SDK (when configured)
 *
 * Usage:
 *   node scripts/upload-audio-r2.js [--dry-run] [--bucket <name>]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.resolve(__dirname, '../assets/audio');
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'your-r2-bucket';
const isDryRun = process.argv.includes('--dry-run');

// Known media extensions to upload
const VALID_EXTENSIONS = new Set(['.mp3', '.m4a', '.ogg', '.wav', '.flac', '.jpg', '.jpeg', '.png', '.webp', '.svg']);

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.mp3': 'audio/mpeg',
        '.m4a': 'audio/mp4',
        '.ogg': 'audio/ogg',
        '.wav': 'audio/wav',
        '.flac': 'audio/flac',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
    };
    return map[ext] || 'application/octet-stream';
}

function collectFiles(dir, baseDir = dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(collectFiles(fullPath, baseDir));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (VALID_EXTENSIONS.has(ext)) {
                const relPath = path.relative(baseDir, fullPath).split(path.sep).join('/');
                const r2Key = `audio/${relPath}`;
                const stat = fs.statSync(fullPath);
                files.push({
                    fullPath,
                    relPath,
                    r2Key,
                    size: stat.size,
                    mimeType: getMimeType(fullPath)
                });
            }
        }
    }
    return files;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

async function main() {
    console.log(`\n=== Cloudflare R2 Media Asset Uploader ===`);
    console.log(`Target Bucket: ${BUCKET_NAME}`);
    console.log(`Dry Run Mode : ${isDryRun ? 'YES (No files will be uploaded)' : 'NO'}`);
    console.log(`Source Dir   : ${ASSETS_DIR}\n`);

    if (!fs.existsSync(ASSETS_DIR)) {
        console.error(`Error: Source directory not found at ${ASSETS_DIR}`);
        process.exit(1);
    }

    const files = collectFiles(ASSETS_DIR);
    const tracksJsonPath = path.resolve(__dirname, '../public/data/tracks.json');
    if (fs.existsSync(tracksJsonPath)) {
        const stat = fs.statSync(tracksJsonPath);
        files.push({
            fullPath: tracksJsonPath,
            relPath: 'data/tracks.json',
            r2Key: 'data/tracks.json',
            size: stat.size,
            mimeType: 'application/json'
        });
    }

    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

    console.log(`Found ${files.length} media/metadata files totaling ${formatBytes(totalBytes)}.\n`);

    if (files.length === 0) {
        console.log('No media files found to upload.');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = `[${i + 1}/${files.length}]`;

        if (isDryRun) {
            console.log(`${progress} [DRY-RUN] ${file.r2Key} (${formatBytes(file.size)}) -> ${file.mimeType}`);
            successCount++;
            continue;
        }

        try {
            console.log(`${progress} Uploading ${file.r2Key} (${formatBytes(file.size)})...`);
            // Execute wrangler r2 object put
            const cmd = `npx wrangler r2 object put "${BUCKET_NAME}/${file.r2Key}" --file="${file.fullPath}" --content-type="${file.mimeType}" --remote`;
            execSync(cmd, { stdio: 'pipe' });
            successCount++;
        } catch (err) {
            console.error(`❌ Failed to upload ${file.r2Key}:`, err.message);
            failCount++;
        }
    }

    console.log(`\n=== Upload Summary ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed : ${failCount}`);
    console.log(`Total Size: ${formatBytes(totalBytes)}\n`);
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});

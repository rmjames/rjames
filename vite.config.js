import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Get all HTML files from the lab directory
const labDir = resolve(__dirname, 'lab');
const labFiles = fs.readdirSync(labDir)
    .filter(file => file.endsWith('.html'))
    .reduce((acc, file) => {
        const name = file.replace('.html', '');
        acc[`lab/${name}`] = resolve(labDir, file);
        return acc;
    }, {});

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                resume: resolve(__dirname, 'resume.html'),
                lab: resolve(__dirname, 'lab.html'),
                patternLibrary: resolve(__dirname, 'pattern-library.html'),
                ...labFiles
            },
        },
    },
    server: {
        host: true
    }
});

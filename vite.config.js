import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                resume: resolve(__dirname, 'resume.html'),
                lab: resolve(__dirname, 'lab.html'),
                patternLibrary: resolve(__dirname, 'pattern-library.html'),
            },
        },
    },
    server: {
        host: true
    }
});

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Get all HTML files from the lab directory
const labDir = resolve(__dirname, 'lab');
const labFiles = fs.readdirSync(labDir)
    .filter(file => file.endsWith('.html'))
    .reduce((acc, file) => {
        const name = file.replace('.html', '');
        acc[`lab/${name}`] = resolve(labDir, file);
        return acc;
    }, {});

// Custom plugin to copy static files
const copyStaticFiles = () => {
    return {
        name: 'copy-static-files',
        closeBundle() {
            const filesToCopy = [
                { src: 'manifest.json', dest: 'manifest.json' },
                { src: 'sw.js', dest: 'sw.js' },
                { src: 'robot.txt', dest: 'robot.txt' },
                { src: 'sitemap.xml', dest: 'sitemap.xml' },
                { src: 'scripts/register-sw.js', dest: 'scripts/register-sw.js' },
                { src: 'scripts/analytics-loader.js', dest: 'scripts/analytics-loader.js' },
                { src: 'scripts/copyright.js', dest: 'scripts/copyright.js' },
                { src: 'resume_icon.svg', dest: 'resume_icon.svg' },
                { src: 'lab_icon.svg', dest: 'lab_icon.svg' },
            ];

            // Add favicons
            const files = fs.readdirSync(__dirname);
            files.forEach(file => {
                if (file.startsWith('favicon') && file.endsWith('.png')) {
                    filesToCopy.push({ src: file, dest: file });
                }
            });

            // Add directories to copy
            const dirsToCopy = ['images', 'fonts', 'styles'];

            filesToCopy.forEach(({ src, dest }) => {
                const srcPath = resolve(__dirname, src);
                const destPath = resolve(__dirname, 'dist', dest);

                if (fs.existsSync(srcPath)) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`Copied ${src} to ${dest}`);
                }
            });

            dirsToCopy.forEach(dir => {
                const srcDir = resolve(__dirname, dir);
                const destDir = resolve(__dirname, 'dist', dir);
                if (fs.existsSync(srcDir)) {
                    fs.cpSync(srcDir, destDir, { recursive: true });
                    console.log(`Copied directory ${dir} to dist/${dir}`);
                }
            });
        }
    };
};

export default defineConfig({
    plugins: [copyStaticFiles()],
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

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

// Get all HTML files from the tools directory
const toolsDir = resolve(__dirname, 'tools');
const toolsFiles = fs.existsSync(toolsDir)
    ? fs.readdirSync(toolsDir)
        .filter(file => file.endsWith('.html'))
        .reduce((acc, file) => {
            const name = file.replace('.html', '');
            acc[`tools/${name}`] = resolve(toolsDir, file);
            return acc;
        }, {})
    : {};

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
                { src: 'llms.txt', dest: 'llms.txt' },
                { src: 'scripts/register-sw.js', dest: 'scripts/register-sw.js' },
                { src: 'scripts/analytics-loader.js', dest: 'scripts/analytics-loader.js' },
                { src: 'scripts/copyright.js', dest: 'scripts/copyright.js' },
                { src: 'scripts/favicon-animator.js', dest: 'scripts/favicon-animator.js' },
                { src: 'resume_icon.svg', dest: 'resume_icon.svg' },
                { src: 'lab_icon.svg', dest: 'lab_icon.svg' },
                { src: 'tools_icon.svg', dest: 'tools_icon.svg' },
            ];

            // Add favicons
            const files = fs.readdirSync(__dirname);
            files.forEach(file => {
                if (file.startsWith('favicon') && file.endsWith('.png')) {
                    filesToCopy.push({ src: file, dest: file });
                }
            });

            // Add directories to copy
            const dirsToCopy = ['images', 'fonts', 'styles', 'scripts', 'assets'];

            filesToCopy.forEach(({ src, dest }) => {
                const srcPath = resolve(__dirname, src);
                const destPath = resolve(__dirname, 'dist', dest);

                if (fs.existsSync(srcPath)) {
                    try {
                        fs.mkdirSync(path.dirname(destPath), { recursive: true });
                        fs.copyFileSync(srcPath, destPath);
                        console.log(`Copied ${src} to ${dest}`);
                    } catch (err) {
                        console.warn(`Failed to copy ${src} to ${dest}: ${err.message}`);
                    }
                }
            });

            dirsToCopy.forEach(dir => {
                const srcDir = resolve(__dirname, dir);
                const destDir = resolve(__dirname, 'dist', dir);
                if (fs.existsSync(srcDir)) {
                    try {
                        fs.cpSync(srcDir, destDir, { 
                            recursive: true,
                            force: true,
                            filter: (src) => {
                                // Exclude test files and internal tooling scripts from production build
                                const excluded = ['.test.', '/test/', 'scan-audio.js', 'upload-audio-r2.js', 'judge.js'];
                                return !excluded.some(pattern => src.includes(pattern));
                            }
                        });
                        console.log(`Copied directory ${dir} to dist/${dir}`);
                    } catch (err) {
                        console.warn(`Failed to copy directory ${dir} to dist/${dir}: ${err.message}`);
                    }
                }
            });
        }
    };
};

export default defineConfig({
    plugins: [copyStaticFiles()],
    build: {
        target: 'esnext',
        emptyOutDir: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                resume: resolve(__dirname, 'resume.html'),
                lab: resolve(__dirname, 'lab.html'),
                patternLibrary: resolve(__dirname, 'pattern-library.html'),
                ...toolsFiles,
                ...labFiles
            },
        },
    },
    server: {
        host: true
    }
});

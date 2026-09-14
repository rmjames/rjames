import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Dynamic HTML transform plugin for replacing __MEDIA_CDN__ and __CONTACT_EMAIL__ placeholders
const envTransformPlugin = (mediaOrigin = '', contactEmail = '') => {
    return {
        name: 'env-html-transform',
        transformIndexHtml(html) {
            let transformed = html;
            if (mediaOrigin) {
                transformed = transformed.replace(/__MEDIA_CDN__/g, mediaOrigin);
            } else {
                transformed = transformed.replace(/__MEDIA_CDN__\s*/g, '');
            }
            if (contactEmail) {
                transformed = transformed.replace(/__CONTACT_EMAIL__/g, contactEmail);
            }
            return transformed;
        }
    };
};

// Local dev API plugin simulating Cloudflare Pages Functions for /api/stream-url and /api/episodes/:id/stream-url
const mediaServiceDevPlugin = (mediaOrigin = '', apiKey = '') => {
    return {
        name: 'media-service-dev-api',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const isEpisodeStream = url.pathname.startsWith('/api/episodes/') && url.pathname.endsWith('/stream-url');
                const isGenericStream = url.pathname === '/api/stream-url';

                if (!isEpisodeStream && !isGenericStream) {
                    return next();
                }

                let path = '';
                if (isEpisodeStream) {
                    const match = url.pathname.match(/^\/api\/episodes\/(.+)\/stream-url$/);
                    path = match ? decodeURIComponent(match[1]) : '';
                } else {
                    path = decodeURIComponent(url.searchParams.get('path') || '');
                }

                if (!path.startsWith('http://') && !path.startsWith('https://')) {
                    path = path.replace(/^(\.\.\/|\.\/|\/)?(assets\/)?/, '');
                    if (!path.startsWith('audio/')) {
                        path = `audio/${path}`;
                    }
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-store');

                if (apiKey) {
                    try {
                        const signUrl = `${mediaOrigin}/api/v1/sign?path=${encodeURIComponent(path)}&ttl=3600`;
                        const signRes = await fetch(signUrl, {
                            headers: { 'Authorization': `Bearer ${apiKey}` }
                        });
                        if (signRes.ok) {
                            const data = await signRes.json();
                            res.statusCode = 200;
                            res.end(JSON.stringify({ streamUrl: data.url, path: data.path, expiresAt: data.expiresAt }));
                            return;
                        }
                    } catch (e) {
                        console.warn('[media-service-dev] Failed to mint signed URL:', e);
                    }
                }

                const streamUrl = `${mediaOrigin}/${encodeURI(path)}`;
                res.statusCode = 200;
                res.end(JSON.stringify({ streamUrl, path }));
            });
        }
    };
};

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

            // Add directories to copy (media assets now hosted on Cloudflare R2/Worker)
            const dirsToCopy = ['images', 'fonts', 'styles', 'scripts'];
            if (process.env.INCLUDE_LOCAL_AUDIO === 'true') {
                dirsToCopy.push('assets');
            }

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

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const mediaOrigin = (env.VITE_MEDIA_BASE_URL || process.env.VITE_MEDIA_BASE_URL || '').replace(/\/+$/, '');
    const contactEmail = env.VITE_CONTACT_EMAIL || process.env.VITE_CONTACT_EMAIL || '';

    return {
        plugins: [copyStaticFiles(), envTransformPlugin(mediaOrigin, contactEmail)],
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
    };
});

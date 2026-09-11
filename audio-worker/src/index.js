/**
 * Cloudflare Worker for streaming audio and media assets from Cloudflare R2.
 * Supports HTTP Range requests (206 Partial Content), ETag 304 caching, and CORS.
 */

const MIME_TYPES = {
    'mp3': 'audio/mpeg',
    'm4a': 'audio/mp4',
    'ogg': 'audio/ogg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'json': 'application/json'
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type, If-None-Match',
    'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges, ETag, Cache-Control',
    'Access-Control-Max-Age': '86400'
};

function getMimeType(key) {
    const ext = key.split('.').pop()?.toLowerCase() || '';
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function getCacheControl(key) {
    if (key.endsWith('.json')) {
        return 'public, max-age=3600, stale-while-revalidate=86400';
    }
    return 'public, max-age=31536000, immutable';
}

function normalizeKey(pathname) {
    let key = decodeURIComponent(pathname.replace(/^\/+/, ''));
    // Strip optional leading 'assets/' or 'media/' prefixes if clients request them
    if (key.startsWith('assets/')) {
        key = key.replace(/^assets\//, '');
    }
    return key;
}

export default {
    async fetch(request, env) {
        // 1. Handle CORS Preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: CORS_HEADERS
            });
        }

        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return new Response('Method Not Allowed', {
                status: 405,
                headers: {
                    ...CORS_HEADERS,
                    'Allow': 'GET, HEAD, OPTIONS'
                }
            });
        }

        const url = new URL(request.url);
        const key = normalizeKey(url.pathname);

        // Security check: Path traversal prevention
        if (!key || key.includes('..') || key.includes('\0')) {
            return new Response('Not Found', {
                status: 404,
                headers: CORS_HEADERS
            });
        }

        if (!env.AUDIO_BUCKET) {
            return new Response('R2 Bucket not configured', {
                status: 500,
                headers: CORS_HEADERS
            });
        }

        try {
            const rangeHeader = request.headers.get('range');

            // Handle HEAD requests
            if (request.method === 'HEAD') {
                const object = await env.AUDIO_BUCKET.head(key);
                if (!object) {
                    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
                }

                const headers = new Headers(CORS_HEADERS);
                headers.set('Content-Type', object.httpMetadata?.contentType || getMimeType(key));
                headers.set('Content-Length', object.size.toString());
                headers.set('Accept-Ranges', 'bytes');
                headers.set('Cache-Control', getCacheControl(key));
                if (object.httpEtag) {
                    headers.set('ETag', object.httpEtag);
                }

                return new Response(null, { status: 200, headers });
            }

            // Handle GET requests (with optional Range)
            const getOptions = {
                onlyIf: request.headers
            };

            if (rangeHeader) {
                getOptions.range = request.headers;
            }

            const object = await env.AUDIO_BUCKET.get(key, getOptions);

            if (!object) {
                return new Response('Not Found', {
                    status: 404,
                    headers: CORS_HEADERS
                });
            }

            // Handle conditional requests (304 Not Modified)
            if (!('body' in object)) {
                return new Response(null, {
                    status: 304,
                    headers: CORS_HEADERS
                });
            }

            const headers = new Headers(CORS_HEADERS);
            headers.set('Content-Type', object.httpMetadata?.contentType || getMimeType(key));
            headers.set('Accept-Ranges', 'bytes');
            headers.set('Cache-Control', getCacheControl(key));
            if (object.httpEtag) {
                headers.set('ETag', object.httpEtag);
            }

            // Range response (206 Partial Content)
            if (object.range) {
                const offset = object.range.offset ?? 0;
                const length = object.range.length ?? (object.size - offset);
                const end = offset + length - 1;

                headers.set('Content-Range', `bytes ${offset}-${end}/${object.size}`);
                headers.set('Content-Length', length.toString());

                return new Response(object.body, {
                    status: 206,
                    headers
                });
            }

            // Full content response (200 OK)
            headers.set('Content-Length', object.size.toString());
            return new Response(object.body, {
                status: 200,
                headers
            });

        } catch (err) {
            return new Response(`Server Error: ${err.message}`, {
                status: 500,
                headers: CORS_HEADERS
            });
        }
    }
};

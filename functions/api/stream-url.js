/**
 * Cloudflare Pages Function: Generic Stream URL
 * Route: GET /api/stream-url?path=...
 * Mints media stream URLs via media-service (Model 1: Signed Stream URLs)
 */
const _OBF_MEDIA_ENDPOINT = typeof atob === 'function'
    ? atob('aHR0cHM6Ly9tZWRpYS5yb2JlcnRqYW1lcy5ueWM=')
    : '';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const rawPath = url.searchParams.get('path');

    if (!rawPath) {
        return new Response(JSON.stringify({ error: 'Bad Request', message: 'Missing path query parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const mediaBaseUrl = (env?.VITE_MEDIA_BASE_URL || _OBF_MEDIA_ENDPOINT).replace(/\/+$/, '');
    const apiKey = env?.MEDIA_SERVICE_API_KEY;

    let path = decodeURIComponent(rawPath);
    if (!path.startsWith('http://') && !path.startsWith('https://')) {
        path = path.replace(/^(\.\.\/|\.\/|\/)?(assets\/)?/, '');
        if (!path.startsWith('audio/')) {
            path = `audio/${path}`;
        }
    } else {
        try {
            const parsed = new URL(path);
            path = parsed.pathname.replace(/^\/+/, '');
        } catch {
            // Keep as is
        }
    }

    if (apiKey) {
        try {
            const signUrl = `${mediaBaseUrl}/api/v1/sign?path=${encodeURIComponent(path)}&ttl=3600`;
            const signRes = await fetch(signUrl, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (signRes.ok) {
                const data = await signRes.json();
                return new Response(JSON.stringify({ streamUrl: data.url, path: data.path, expiresAt: data.expiresAt }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
                });
            }
        } catch (err) {
            console.error('Failed to call media-service sign API:', err);
        }
    }

    const directUrl = `${mediaBaseUrl}/${encodeURI(path)}`;
    return new Response(JSON.stringify({ streamUrl: directUrl, path }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
}

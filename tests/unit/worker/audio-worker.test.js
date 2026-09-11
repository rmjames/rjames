import { describe, it, expect, vi } from 'vitest';
import worker from '../../../audio-worker/src/index.js';

describe('audio-worker', () => {
    const mockR2Bucket = {
        get: vi.fn(),
        head: vi.fn()
    };

    const env = {
        AUDIO_BUCKET: mockR2Bucket
    };

    it('handles CORS preflight OPTIONS request', async () => {
        const req = new Request('https://media.example.com/audio/test.mp3', {
            method: 'OPTIONS'
        });
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(204);
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
        expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('rejects unsupported HTTP methods', async () => {
        const req = new Request('https://media.example.com/audio/test.mp3', {
            method: 'POST'
        });
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(405);
    });

    it('rejects path traversal attempts with 404', async () => {
        const req = new Request('https://media.example.com/../secret.json');
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(404);
    });

    it('returns 404 when object is not found in R2', async () => {
        mockR2Bucket.get.mockResolvedValue(null);

        const req = new Request('https://media.example.com/audio/nonexistent.mp3');
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(404);
    });

    it('returns 200 with full audio stream and correct MIME headers', async () => {
        const mockStream = new ReadableStream();
        mockR2Bucket.get.mockResolvedValue({
            body: mockStream,
            size: 5000000,
            httpEtag: '"mock-etag"',
            httpMetadata: {
                contentType: 'audio/mpeg'
            }
        });

        const req = new Request('https://media.example.com/audio/sample.mp3');
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
        expect(res.headers.get('Content-Length')).toBe('5000000');
        expect(res.headers.get('Accept-Ranges')).toBe('bytes');
        expect(res.headers.get('ETag')).toBe('"mock-etag"');
        expect(res.headers.get('Cache-Control')).toContain('public');
    });

    it('returns 206 Partial Content when Range header is provided', async () => {
        const mockStream = new ReadableStream();
        mockR2Bucket.get.mockResolvedValue({
            body: mockStream,
            size: 5000000,
            range: {
                offset: 0,
                length: 1000
            },
            httpEtag: '"mock-etag"',
            httpMetadata: {
                contentType: 'audio/mpeg'
            }
        });

        const req = new Request('https://media.example.com/audio/sample.mp3', {
            headers: {
                'Range': 'bytes=0-999'
            }
        });
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(206);
        expect(res.headers.get('Content-Range')).toBe('bytes 0-999/5000000');
        expect(res.headers.get('Content-Length')).toBe('1000');
        expect(res.headers.get('Accept-Ranges')).toBe('bytes');
    });

    it('returns 304 Not Modified when body is omitted for conditional requests', async () => {
        mockR2Bucket.get.mockResolvedValue({
            status: 304,
            size: 5000000
        });

        const req = new Request('https://media.example.com/audio/sample.mp3', {
            headers: {
                'If-None-Match': '"mock-etag"'
            }
        });
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(304);
    });

    it('handles HEAD requests with metadata only', async () => {
        mockR2Bucket.head.mockResolvedValue({
            size: 5000000,
            httpEtag: '"mock-etag"',
            httpMetadata: {
                contentType: 'audio/mpeg'
            }
        });

        const req = new Request('https://media.example.com/audio/sample.mp3', {
            method: 'HEAD'
        });
        const res = await worker.fetch(req, env);

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Length')).toBe('5000000');
        expect(res.body).toBeNull();
    });
});

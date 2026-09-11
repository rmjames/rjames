import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveMediaUrl, AudioLibrary, MEDIA_BASE_URL } from '../../../scripts/AudioLibrary.js';

describe('AudioLibrary', () => {
    describe('resolveMediaUrl', () => {
        it('returns original URL if already absolute or data URI', () => {
            expect(resolveMediaUrl('https://example.com/song.mp3')).toBe('https://example.com/song.mp3');
            expect(resolveMediaUrl('http://example.com/song.mp3')).toBe('http://example.com/song.mp3');
            expect(resolveMediaUrl('data:image/svg+xml;base64,...')).toBe('data:image/svg+xml;base64,...');
            expect(resolveMediaUrl('blob:http://localhost/123')).toBe('blob:http://localhost/123');
        });

        it('returns null or empty unchanged', () => {
            expect(resolveMediaUrl(null)).toBeNull();
            expect(resolveMediaUrl('')).toBe('');
        });

        it('normalizes relative audio paths to CDN URL', () => {
            const relPath = '../assets/audio/J. Dilla - Ruff Draft - 2007/04 - Nothing Like This.mp3';
            const prefix = MEDIA_BASE_URL || '';
            const expected = `${prefix}/audio/J.%20Dilla%20-%20Ruff%20Draft%20-%202007/04%20-%20Nothing%20Like%20This.mp3`;
            expect(resolveMediaUrl(relPath)).toBe(expected);
        });

        it('normalizes direct audio paths', () => {
            const path = 'audio/Kendrick Lamar-Section.80/Cover.jpg';
            const prefix = MEDIA_BASE_URL || '';
            const expected = `${prefix}/audio/Kendrick%20Lamar-Section.80/Cover.jpg`;
            expect(resolveMediaUrl(path)).toBe(expected);
        });

        it('handles paths without leading audio/', () => {
            const path = 'Kendrick Lamar-Section.80/Cover.jpg';
            const prefix = MEDIA_BASE_URL || '';
            const expected = `${prefix}/audio/Kendrick%20Lamar-Section.80/Cover.jpg`;
            expect(resolveMediaUrl(path)).toBe(expected);
        });
    });

    describe('AudioLibrary load and track mapping', () => {
        beforeEach(() => {
            vi.restoreAllMocks();
        });

        it('loads tracks and maps URLs through resolveMediaUrl', async () => {
            const mockTracks = [
                {
                    id: 'track-1',
                    title: 'Track 1',
                    artist: 'Artist 1',
                    src: '../assets/audio/Album 1/01 Track.mp3',
                    albumArt: '../assets/audio/Album 1/Cover.jpg'
                }
            ];

            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockTracks)
            });
            global.fetch = fetchMock;

            const lib = new AudioLibrary();
            await lib.load();

            const prefix = MEDIA_BASE_URL || '';
            const tracks = lib.getAll();
            expect(tracks).toHaveLength(1);
            expect(tracks[0].src).toBe(`${prefix}/audio/Album%201/01%20Track.mp3`);
            expect(tracks[0].albumArt).toBe(`${prefix}/audio/Album%201/Cover.jpg`);
            expect(lib.getById('track-1')).toBe(tracks[0]);
        });

        it('falls back to local /data/tracks.json when CDN request fails', async () => {
            const fallbackTracks = [
                {
                    id: 'local-1',
                    title: 'Local Track',
                    artist: 'Local Artist',
                    src: '../assets/audio/Local/01.mp3',
                    albumArt: null
                }
            ];

            let callCount = 0;
            const fetchMock = vi.fn().mockImplementation(() => {
                callCount++;
                if (MEDIA_BASE_URL && callCount === 1) {
                    return Promise.reject(new Error('CDN offline'));
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(fallbackTracks)
                });
            });
            global.fetch = fetchMock;

            const lib = new AudioLibrary();
            await lib.load();

            expect(lib.getAll()).toHaveLength(1);
            expect(lib.getById('local-1').title).toBe('Local Track');
        });
    });
});

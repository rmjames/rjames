import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaPlayerCore } from '../../../scripts/media/MediaPlayerCore.js';
import { audioLibrary } from '../../../scripts/AudioLibrary.js';

// Mock dependencies
vi.mock('../../../scripts/AudioLibrary.js', () => ({
    audioLibrary: {
        getAll: vi.fn().mockReturnValue([])
    }
}));

describe('MediaPlayerCore', () => {
    let audioElement;
    let mediaPlayer;
    const mockTracks = [
        { title: 'Track 1', src: 'track1.mp3' },
        { title: 'Track 2', src: 'track2.mp3' },
        { title: 'Track 3', src: 'track3.mp3' }
    ];

    beforeEach(() => {
        // Setup mock tracks
        audioLibrary.getAll.mockReturnValue(mockTracks);

        // Mock audio element
        audioElement = document.createElement('audio');
        // JSDOM doesn't implement play/pause fully
        audioElement.play = vi.fn();
        audioElement.pause = vi.fn();

        mediaPlayer = new MediaPlayerCore(audioElement);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with tracks from audioLibrary', () => {
        expect(mediaPlayer.tracks).toEqual(mockTracks);
        expect(mediaPlayer.currentIndex).toBe(0);
    });

    it('should notify listeners on audio events', () => {
        const listener = vi.fn();
        mediaPlayer.subscribe(listener);

        // Simulate events
        audioElement.dispatchEvent(new Event('play'));
        expect(listener).toHaveBeenCalledWith('play', undefined);

        audioElement.dispatchEvent(new Event('pause'));
        expect(listener).toHaveBeenCalledWith('pause', undefined);

        audioElement.dispatchEvent(new Event('ended'));
        expect(listener).toHaveBeenCalledWith('ended', undefined);
    });

    it('should load track correctly', () => {
        const listener = vi.fn();
        mediaPlayer.subscribe(listener);

        const track = mediaPlayer.loadTrack(1);

        expect(track).toBe(mockTracks[1]);
        expect(mediaPlayer.currentIndex).toBe(1);
        expect(audioElement.src).toContain('track2.mp3');
        expect(listener).toHaveBeenCalledWith('trackChanged', track);
    });

    it('should loop tracks when loading out of bounds', () => {
        // Next from last
        mediaPlayer.loadTrack(3); // index 3 is out of bounds (length 3) -> should go to 0
        expect(mediaPlayer.currentIndex).toBe(0);

        // Prev from first
        mediaPlayer.loadTrack(-1); // should go to last (2)
        expect(mediaPlayer.currentIndex).toBe(2);
    });

    it('should play the current track', () => {
        mediaPlayer.play();
        expect(audioElement.play).toHaveBeenCalled();
    });

    it('should load first track if trying to play with no src', () => {
        expect(audioElement.src).toBe('');
        mediaPlayer.play();
        expect(mediaPlayer.currentIndex).toBe(0);
        expect(audioElement.src).toContain('track1.mp3');
        expect(audioElement.play).toHaveBeenCalled();
    });

    it('should pause playback', () => {
        mediaPlayer.pause();
        expect(audioElement.pause).toHaveBeenCalled();
    });

    it('should toggle playback', () => {
        // Originally paused
        Object.defineProperty(audioElement, 'paused', { value: true, configurable: true });
        mediaPlayer.togglePlay();
        expect(audioElement.play).toHaveBeenCalled();

        // Now playing
        Object.defineProperty(audioElement, 'paused', { value: false, configurable: true });
        mediaPlayer.togglePlay();
        expect(audioElement.pause).toHaveBeenCalled();
    });

    it('should go to next track', () => {
        mediaPlayer.next();
        expect(mediaPlayer.currentIndex).toBe(1);
        expect(audioElement.play).toHaveBeenCalled();
    });

    it('should go to previous track', () => {
        mediaPlayer.prev();
        expect(mediaPlayer.currentIndex).toBe(2); // Loops to last
        expect(audioElement.play).toHaveBeenCalled();
    });

    it('should shuffle to a random track', () => {
        // With 3 tracks, shuffle should pick a different index
        mediaPlayer.shuffle();
        expect(mediaPlayer.currentIndex).not.toBe(0); // Assuming it starts at 0 and changes
        expect(audioElement.play).toHaveBeenCalled();
    });

    it('should handle shuffle with single track gracefully', () => {
         audioLibrary.getAll.mockReturnValue([mockTracks[0]]);
         const singlePlayer = new MediaPlayerCore(audioElement);

         const track = singlePlayer.shuffle();
         expect(singlePlayer.currentIndex).toBe(0);
         expect(track).toBe(mockTracks[0]);
    });

    it('should respect mediaSession: false option in constructor', () => {
        const noSessionPlayer = new MediaPlayerCore(audioElement, { mediaSession: false });
        expect(noSessionPlayer.options.mediaSession).toBe(false);
    });

    it('should clean up listeners and disconnect mediaSession on destroy', () => {
        const listener = vi.fn();
        mediaPlayer.subscribe(listener);

        mediaPlayer.destroy();
        audioElement.dispatchEvent(new Event('play'));
        expect(listener).not.toHaveBeenCalled();
    });

    describe('Model 1: Signed Stream URLs & Range Streaming', () => {
        it('should detect expired or valid stream URLs with isStreamUrlExpired', async () => {
            const { isStreamUrlExpired } = await import('../../../scripts/media/MediaPlayerCore.js');
            const now = Math.floor(Date.now() / 1000);
            
            expect(isStreamUrlExpired(null)).toBe(true);
            expect(isStreamUrlExpired('invalid-url')).toBe(false);
            expect(isStreamUrlExpired(`https://media.example.com/track.mp3?token=abc&expires=${now - 50}`)).toBe(true);
            expect(isStreamUrlExpired(`https://media.example.com/track.mp3?token=abc&expires=${now + 3600}`)).toBe(false);
        });

        it('should fetch signed stream URL via fetchStreamUrl', async () => {
            const { fetchStreamUrl } = await import('../../../scripts/media/MediaPlayerCore.js');
            const signedStreamUrl = 'https://media.example.com/audio/ep1.mp3?token=sig123&expires=9999999999';
            
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ streamUrl: signedStreamUrl })
            });

            const url = await fetchStreamUrl({ id: 'ep-1', src: 'ep1.mp3' });
            expect(global.fetch).toHaveBeenCalledWith('/api/episodes/ep-1/stream-url');
            expect(url).toBe(signedStreamUrl);
        });

        it('should play episode directly using playEpisode', async () => {
            const signedStreamUrl = 'https://media.example.com/audio/ep2.mp3?token=sig456&expires=9999999999';
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ streamUrl: signedStreamUrl })
            });

            mediaPlayer.tracks = [
                { id: 'ep-2', src: 'audio/ep2.mp3', title: 'Episode 2' }
            ];

            await mediaPlayer.playEpisode('ep-2');
            expect(audioElement.src).toBe(signedStreamUrl);
            expect(audioElement.play).toHaveBeenCalled();
        });

        it('should fetch range chunks with fetchAudioChunk', async () => {
            const { fetchAudioChunk } = await import('../../../scripts/media/MediaPlayerCore.js');
            const mockBuffer = new ArrayBuffer(1024);

            global.fetch = vi.fn().mockResolvedValue({
                status: 206,
                arrayBuffer: () => Promise.resolve(mockBuffer)
            });

            const buffer = await fetchAudioChunk('https://media.example.com/audio/ep1.mp3', 0, 1023);
            expect(global.fetch).toHaveBeenCalledWith('https://media.example.com/audio/ep1.mp3', {
                headers: { 'Range': 'bytes=0-1023' }
            });
            expect(buffer).toBe(mockBuffer);
        });

        it('should throw error when fetchAudioChunk receives non-200/206 status', async () => {
            const { fetchAudioChunk } = await import('../../../scripts/media/MediaPlayerCore.js');

            global.fetch = vi.fn().mockResolvedValue({
                status: 403
            });

            await expect(fetchAudioChunk('https://media.example.com/audio/ep1.mp3', 0, 1023))
                .rejects.toThrow('Failed to load audio chunk: 403');
        });
    });
});

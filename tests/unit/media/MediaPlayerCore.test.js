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
        const track = mediaPlayer.shuffle();
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
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaSessionService } from '../../../scripts/media/MediaSessionService.js';

describe('MediaSessionService', () => {
    let service;
    let mockMediaSession;
    let mockAudio;
    let mockCore;

    beforeEach(() => {
        const actionHandlers = new Map();
        mockMediaSession = {
            metadata: null,
            playbackState: 'none',
            setActionHandler: vi.fn((action, handler) => {
                actionHandlers.set(action, handler);
            }),
            setPositionState: vi.fn(),
            _handlers: actionHandlers
        };

        // Mock global navigator.mediaSession
        Object.defineProperty(globalThis.navigator, 'mediaSession', {
            value: mockMediaSession,
            configurable: true,
            writable: true
        });

        // Mock global MediaMetadata
        globalThis.MediaMetadata = class MockMediaMetadata {
            constructor(init) {
                this.title = init.title;
                this.artist = init.artist;
                this.album = init.album;
                this.artwork = init.artwork;
            }
        };

        mockAudio = {
            paused: true,
            currentTime: 15,
            duration: 120,
            playbackRate: 1,
            play: vi.fn(),
            pause: vi.fn()
        };

        const subscribers = new Set();
        mockCore = {
            audio: mockAudio,
            currentTrack: {
                title: 'Test Song',
                artist: 'Test Artist',
                album: 'Test Album',
                albumArt: 'cover.jpg'
            },
            subscribe: vi.fn((cb) => {
                subscribers.add(cb);
                return () => subscribers.delete(cb);
            }),
            notify: (event, data) => {
                subscribers.forEach(cb => cb(event, data));
            },
            play: vi.fn(() => {
                mockAudio.paused = false;
            }),
            pause: vi.fn(() => {
                mockAudio.paused = true;
            }),
            prev: vi.fn(),
            next: vi.fn()
        };

        service = new MediaSessionService();
    });

    afterEach(() => {
        service.disconnect();
        vi.clearAllMocks();
    });

    it('should report isSupported when navigator.mediaSession is present', () => {
        expect(service.isSupported).toBe(true);
    });

    it('should connect to MediaPlayerCore and initialize metadata and playbackState', () => {
        service.connect(mockCore);

        expect(service.activeCore).toBe(mockCore);
        expect(mockMediaSession.metadata.title).toBe('Test Song');
        expect(mockMediaSession.metadata.artist).toBe('Test Artist');
        expect(mockMediaSession.metadata.album).toBe('Test Album');
        expect(mockMediaSession.metadata.artwork.length).toBe(6);
        expect(mockMediaSession.playbackState).toBe('paused');
    });

    it('should update metadata when core emits trackChanged', () => {
        service.connect(mockCore);

        const nextTrack = {
            title: 'New Track',
            artist: 'New Artist',
            album: 'New Album',
            albumArt: 'new-cover.jpg'
        };
        mockCore.notify('trackChanged', nextTrack);

        expect(mockMediaSession.metadata.title).toBe('New Track');
        expect(mockMediaSession.metadata.artist).toBe('New Artist');
    });

    it('should update playbackState and positionState when core plays or pauses', () => {
        service.connect(mockCore);

        mockAudio.paused = false;
        mockCore.notify('play');
        expect(mockMediaSession.playbackState).toBe('playing');
        expect(mockMediaSession.setPositionState).toHaveBeenCalledWith({
            duration: 120,
            playbackRate: 1,
            position: 15
        });

        mockAudio.paused = true;
        mockCore.notify('pause');
        expect(mockMediaSession.playbackState).toBe('paused');
    });

    it('should register action handlers and forward calls to activeCore', () => {
        service.connect(mockCore);

        const handlers = mockMediaSession._handlers;
        expect(handlers.has('play')).toBe(true);
        expect(handlers.has('pause')).toBe(true);
        expect(handlers.has('previoustrack')).toBe(true);
        expect(handlers.has('nexttrack')).toBe(true);
        expect(handlers.has('seekbackward')).toBe(true);
        expect(handlers.has('seekforward')).toBe(true);
        expect(handlers.has('seekto')).toBe(true);
        expect(handlers.has('stop')).toBe(true);

        handlers.get('play')();
        expect(mockCore.play).toHaveBeenCalled();

        handlers.get('pause')();
        expect(mockCore.pause).toHaveBeenCalled();

        handlers.get('previoustrack')();
        expect(mockCore.prev).toHaveBeenCalled();

        handlers.get('nexttrack')();
        expect(mockCore.next).toHaveBeenCalled();
    });

    it('should handle seek backward, forward, and seekto correctly', () => {
        service.connect(mockCore);
        const handlers = mockMediaSession._handlers;

        // seekbackward default 10s
        mockAudio.currentTime = 30;
        handlers.get('seekbackward')({});
        expect(mockAudio.currentTime).toBe(20);

        // seekbackward with custom offset
        handlers.get('seekbackward')({ seekOffset: 5 });
        expect(mockAudio.currentTime).toBe(15);

        // seekbackward bound at 0
        handlers.get('seekbackward')({ seekOffset: 50 });
        expect(mockAudio.currentTime).toBe(0);

        // seekforward
        mockAudio.currentTime = 50;
        handlers.get('seekforward')({ seekOffset: 15 });
        expect(mockAudio.currentTime).toBe(65);

        // seekto
        handlers.get('seekto')({ seekTime: 85 });
        expect(mockAudio.currentTime).toBe(85);

        // stop
        handlers.get('stop')();
        expect(mockCore.pause).toHaveBeenCalled();
        expect(mockAudio.currentTime).toBe(0);
    });

    it('should not throw or update positionState if duration is invalid or zero', () => {
        service.connect(mockCore);
        mockMediaSession.setPositionState.mockClear();

        mockAudio.duration = NaN;
        service.updatePositionState();
        expect(mockMediaSession.setPositionState).not.toHaveBeenCalled();

        mockAudio.duration = 0;
        service.updatePositionState();
        expect(mockMediaSession.setPositionState).not.toHaveBeenCalled();
    });

    it('should cleanly switch active core when connecting a new core', () => {
        service.connect(mockCore);
        expect(service.activeCore).toBe(mockCore);

        const secondAudio = { paused: false, currentTime: 5, duration: 60, playbackRate: 1 };
        const secondCore = {
            audio: secondAudio,
            currentTrack: { title: 'Second Song', artist: 'Second Artist' },
            subscribe: vi.fn(() => () => {}),
            play: vi.fn(),
            pause: vi.fn()
        };

        service.connect(secondCore);
        expect(service.activeCore).toBe(secondCore);
        expect(mockMediaSession.metadata.title).toBe('Second Song');
        expect(mockMediaSession.playbackState).toBe('playing');
    });

    it('should clean up action handlers and metadata on disconnect', () => {
        service.connect(mockCore);
        service.disconnect();

        expect(service.activeCore).toBeNull();
        expect(mockMediaSession.metadata).toBeNull();
        expect(mockMediaSession.playbackState).toBe('none');
        expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith('play', null);
        expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith('pause', null);
    });
});

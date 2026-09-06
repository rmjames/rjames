/**
 * MediaSessionService
 * Centralized service managing the native Media Session API (navigator.mediaSession)
 * for audio players across /lab.
 */

export class MediaSessionService {
    constructor() {
        this.activeCore = null;
        this.unsubscribe = null;
    }

    get isSupported() {
        return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
    }

    /**
     * Connects a MediaPlayerCore instance as the active media controller.
     * Detaches any previously active player.
     * @param {import('./MediaPlayerCore.js').MediaPlayerCore} core
     */
    connect(core) {
        if (!this.isSupported || !core) return;

        // If already connected to this core, just ensure metadata & state are in sync
        if (this.activeCore === core) {
            this.updateMetadata(core.currentTrack);
            this.updatePlaybackState();
            this.updatePositionState();
            return;
        }

        // Clean up previous core subscription
        this.disconnect();

        this.activeCore = core;
        this._setupActionHandlers();

        // Subscribe to player events
        this.unsubscribe = core.subscribe((event, data) => {
            switch (event) {
                case 'trackChanged':
                    this.updateMetadata(data);
                    this.updatePlaybackState();
                    this.updatePositionState();
                    break;
                case 'play':
                case 'pause':
                    this.updatePlaybackState();
                    this.updatePositionState();
                    break;
                case 'timeupdate':
                    this.updatePositionState();
                    break;
                case 'ended':
                    this.updatePlaybackState();
                    break;
            }
        });

        if (core.currentTrack) {
            this.updateMetadata(core.currentTrack);
        }
        this.updatePlaybackState();
        this.updatePositionState();
    }

    /**
     * Disconnects the active core and releases media session action handlers.
     */
    disconnect() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        if (this.isSupported) {
            this._clearActionHandlers();
            try {
                navigator.mediaSession.playbackState = 'none';
                navigator.mediaSession.metadata = null;
            } catch {
                // Ignore platform-specific assignment quirks
            }
        }

        this.activeCore = null;
    }

    /**
     * Updates navigator.mediaSession.metadata for the current track.
     * @param {Object} track
     */
    updateMetadata(track) {
        if (!this.isSupported || !track) return;

        const artwork = [];
        if (track.albumArt) {
            const sizes = ['96x96', '128x128', '192x192', '256x256', '384x384', '512x512'];
            for (const size of sizes) {
                artwork.push({
                    src: track.albumArt,
                    sizes: size,
                    type: 'image/jpeg'
                });
            }
        }

        try {
            if (typeof MediaMetadata !== 'undefined') {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.title || 'Unknown Title',
                    artist: track.artist || 'Unknown Artist',
                    album: track.album || '',
                    artwork
                });
            } else {
                navigator.mediaSession.metadata = {
                    title: track.title || 'Unknown Title',
                    artist: track.artist || 'Unknown Artist',
                    album: track.album || '',
                    artwork
                };
            }
        } catch (err) {
            console.warn('Failed to update MediaSession metadata:', err);
        }
    }

    /**
     * Synchronizes playback state ('playing' vs 'paused').
     */
    updatePlaybackState() {
        if (!this.isSupported || !this.activeCore?.audio) return;

        try {
            navigator.mediaSession.playbackState = this.activeCore.audio.paused ? 'paused' : 'playing';
        } catch (err) {
            console.warn('Failed to update MediaSession playbackState:', err);
        }
    }

    /**
     * Safely updates position state (duration, position, playbackRate).
     */
    updatePositionState() {
        if (!this.isSupported || !this.activeCore?.audio) return;
        if (!('setPositionState' in navigator.mediaSession)) return;

        const { audio } = this.activeCore;
        const duration = audio.duration;
        const currentTime = audio.currentTime;

        // Guard against NaN, Infinite, or negative duration values
        if (!Number.isFinite(duration) || duration <= 0) return;
        if (!Number.isFinite(currentTime) || currentTime < 0) return;

        try {
            navigator.mediaSession.setPositionState({
                duration: duration,
                playbackRate: audio.playbackRate || 1,
                position: Math.min(currentTime, duration)
            });
        } catch {
            // Browsers throw if position > duration or values are invalid
        }
    }

    /**
     * Configures OS/platform hardware key and notification action handlers.
     */
    _setupActionHandlers() {
        if (!this.isSupported) return;

        const actions = [
            ['play', () => {
                this.activeCore?.play();
            }],
            ['pause', () => {
                this.activeCore?.pause();
            }],
            ['previoustrack', () => {
                this.activeCore?.prev();
            }],
            ['nexttrack', () => {
                this.activeCore?.next();
            }],
            ['seekbackward', (details) => {
                if (!this.activeCore?.audio) return;
                const offset = details?.seekOffset ?? 10;
                this.activeCore.audio.currentTime = Math.max(this.activeCore.audio.currentTime - offset, 0);
                this.updatePositionState();
            }],
            ['seekforward', (details) => {
                if (!this.activeCore?.audio) return;
                const offset = details?.seekOffset ?? 10;
                const duration = Number.isFinite(this.activeCore.audio.duration)
                    ? this.activeCore.audio.duration
                    : Infinity;
                this.activeCore.audio.currentTime = Math.min(this.activeCore.audio.currentTime + offset, duration);
                this.updatePositionState();
            }],
            ['seekto', (details) => {
                if (!this.activeCore?.audio || details?.seekTime == null) return;
                const targetTime = Math.max(0, details.seekTime);
                if (details.fastSeek && 'fastSeek' in this.activeCore.audio) {
                    this.activeCore.audio.fastSeek(targetTime);
                } else {
                    this.activeCore.audio.currentTime = targetTime;
                }
                this.updatePositionState();
            }],
            ['stop', () => {
                if (!this.activeCore) return;
                this.activeCore.pause();
                if (this.activeCore.audio) {
                    this.activeCore.audio.currentTime = 0;
                }
                this.updatePositionState();
            }]
        ];

        for (const [action, handler] of actions) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch {
                // Some action handlers might not be supported across all browsers
            }
        }
    }

    /**
     * Clears registered action handlers.
     */
    _clearActionHandlers() {
        if (!this.isSupported) return;

        const actions = [
            'play',
            'pause',
            'previoustrack',
            'nexttrack',
            'seekbackward',
            'seekforward',
            'seekto',
            'stop'
        ];

        for (const action of actions) {
            try {
                navigator.mediaSession.setActionHandler(action, null);
            } catch {
                // Ignore unsupported action unbinding
            }
        }
    }
}

export const mediaSessionService = new MediaSessionService();

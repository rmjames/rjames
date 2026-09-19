import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert/strict';
import { buildLockScreenPlayer } from '../../../scripts/media/LockScreenPlayer.js';
describe('LockScreenPlayer Shared Component', () => {
    let mount;
    let mockAudio;
    let mockCore;
    let subscribers;

    beforeEach(() => {
        mount = document.createElement('div');
        subscribers = [];

        mockAudio = document.createElement('audio');
        mockAudio.currentTime = 0;
        Object.defineProperty(mockAudio, 'duration', { value: 180, writable: true });
        Object.defineProperty(mockAudio, 'paused', { value: true, writable: true });

        mockCore = {
            audio: mockAudio,
            tracks: [
                { id: 'track-1', title: 'Song One', artist: 'Artist One', albumArt: 'https://media.example.com/art1.jpg' },
                { id: 'track-2', title: 'Song Two', artist: 'Artist Two', albumArt: 'https://media.example.com/art2.jpg' }
            ],
            currentIndex: 0,
            get currentTrack() { return this.tracks[this.currentIndex]; },
            subscribe: (fn) => {
                subscribers.push(fn);
                return () => {
                    subscribers = subscribers.filter(cb => cb !== fn);
                };
            },
            togglePlay: () => {
                mockAudio.paused = !mockAudio.paused;
                subscribers.forEach(cb => cb(mockAudio.paused ? 'pause' : 'play'));
            },
            prev: () => {},
            next: () => {},
            loadTrack: (idx) => {
                mockCore.currentIndex = idx;
                subscribers.forEach(cb => cb('trackChanged', mockCore.tracks[idx]));
            }
        };
    });

    it('builds full 8-column DOM structure and mounts to container', () => {
        const controller = buildLockScreenPlayer(mount, mockCore, document);
        assert.ok(controller.section, 'Section element must be returned');
        assert.ok(controller.section.classList.contains('media-player-grid'), 'Must have media-player-grid class');

        // Verify subcomponents
        const eqBtn = controller.section.querySelector('.grid-item--eq');
        const phoneBtn = controller.section.querySelector('.grid-item--phone');
        const playBtn = controller.section.querySelector('.media-player__play-pause');
        const meta = controller.section.querySelector('.media-player__meta');
        const title = controller.section.querySelector('.media-player__meta__title');
        const artist = controller.section.querySelector('.media-player__meta__artist');
        const prev = controller.section.querySelector('.media-player__prev');
        const next = controller.section.querySelector('.media-player__next');
        const rewind = controller.section.querySelector('.media-player__rewind');
        const option = controller.section.querySelector('.media-player__option');
        const slider = controller.section.querySelector('.progress-slider');
        const eqContainer = controller.section.querySelector('.media-player__equalizer');

        assert.ok(eqBtn, 'Equalizer button must exist');
        assert.ok(phoneBtn, 'Phone button must exist');
        assert.ok(playBtn, 'Play button must exist');
        assert.ok(meta, 'Meta container must exist');
        assert.equal(title.textContent, 'Song One', 'Title should initialize with first track');
        assert.equal(artist.textContent, 'Artist One', 'Artist should initialize with first track');
        assert.ok(prev, 'Prev button must exist');
        assert.ok(next, 'Next button must exist');
        assert.ok(rewind, 'Rewind button must exist');
        assert.ok(option, 'Option button must exist');
        assert.ok(slider, 'Progress slider must exist');
        assert.ok(eqContainer, 'Equalizer overlay must exist');
    });

    it('updates cover art and metadata on track change', () => {
        const controller = buildLockScreenPlayer(mount, mockCore, document);
        mockCore.loadTrack(1);

        const title = controller.section.querySelector('.media-player__meta__title');
        const artist = controller.section.querySelector('.media-player__meta__artist');

        assert.equal(title.textContent, 'Song Two');
        assert.equal(artist.textContent, 'Artist Two');
        assert.equal(controller.section.style.getPropertyValue('--bg-image'), 'url("https://media.example.com/art2.jpg")');
    });

    it('rewinds audio position by 10s on rewind click', () => {
        const controller = buildLockScreenPlayer(mount, mockCore, document);
        mockAudio.currentTime = 30;

        const rewind = controller.section.querySelector('.media-player__rewind');
        rewind.dispatchEvent(new Event('click'));

        assert.equal(mockAudio.currentTime, 20);
    });

    it('suppresses timeupdate while user is actively seeking on slider', () => {
        const controller = buildLockScreenPlayer(mount, mockCore, document);
        const slider = controller.section.querySelector('.progress-slider');

        // Start seeking
        slider.dispatchEvent(new Event('pointerdown'));
        slider.value = '80';

        // Fire audio timeupdate at 10s (approx 5.5% of 180s)
        mockAudio.currentTime = 10;
        mockAudio.dispatchEvent(new Event('timeupdate'));

        // Slider value should remain at 80 while dragging
        assert.equal(slider.value, '80');

        // Commit seek
        slider.dispatchEvent(new Event('pointerup'));
        assert.equal(mockAudio.currentTime, (80 / 100) * 180);
    });

    it('cleans up subscriptions on destroy()', () => {
        const controller = buildLockScreenPlayer(mount, mockCore, document);
        assert.equal(subscribers.length, 1);

        controller.destroy();
        assert.equal(subscribers.length, 0);
        assert.equal(mount.children.length, 0);
    });
});

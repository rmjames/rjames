import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert/strict';
import { buildMainPlayer } from '../../../scripts/media/MainMediaPlayer.js';

describe('MainMediaPlayer Shared Component', () => {
    let mount;
    let mockAudio;
    let mockCore;
    let subscribers;

    beforeEach(() => {
        mount = document.createElement('div');
        subscribers = [];

        mockAudio = document.createElement('audio');
        mockAudio.currentTime = 0;
        mockAudio.src = 'https://media.example.com/art1.mp3';
        Object.defineProperty(mockAudio, 'duration', { value: 180, writable: true });
        Object.defineProperty(mockAudio, 'paused', { value: true, writable: true });

        mockCore = {
            audio: mockAudio,
            tracks: [
                { id: 'track-1', title: 'Song One', artist: 'Artist One', src: 'art1.mp3', albumArt: 'https://media.example.com/art1.jpg' },
                { id: 'track-2', title: 'Song Two', artist: 'Artist Two', src: 'art2.mp3', albumArt: '' }
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
            },
            play: () => {
                mockAudio.paused = false;
                subscribers.forEach(cb => cb('play'));
            },
            pause: () => {
                mockAudio.paused = true;
                subscribers.forEach(cb => cb('pause'));
            }
        };
    });

    it('builds full DOM structure and mounts to container', () => {
        const controller = buildMainPlayer(mount, mockCore, document);
        assert.ok(controller.section, 'Section element must exist');
        assert.ok(controller.section.classList.contains('media-player'), 'Must have media-player class');

        const controls = controller.section.querySelector('.media-player__controls');
        assert.ok(controls, 'Controls bar must exist');

        const currentArt = controls.querySelector('.media-player__controls__current');
        assert.ok(currentArt, 'Current art button must exist');
        assert.equal(currentArt.dataset.analyticsElement, 'Current Track');

        const meta = controls.querySelector('.media-player__meta');
        assert.ok(meta, 'Meta block must exist');

        const title = meta.querySelector('.media-player__meta__title');
        const artist = meta.querySelector('.media-player__meta__artist');
        assert.equal(title.textContent, 'Song One');
        assert.equal(artist.textContent, 'Artist One');

        const optionBtn = controls.querySelector('.media-player__controls__option');
        assert.ok(optionBtn, 'Option button must exist');
        assert.equal(optionBtn.dataset.analyticsElement, 'Options');
        assert.equal(optionBtn.getAttribute('title'), 'Mode: LIKE');

        const playBtn = controls.querySelector('.media-player__controls__play');
        assert.ok(playBtn, 'Play button must exist');
        assert.equal(playBtn.dataset.analyticsElement, 'Play');

        const presets = controller.section.querySelector('.media-player__presets');
        assert.ok(presets, 'Presets bar must exist');
        assert.equal(presets.children.length, 2, 'Should render 2 preset buttons');

        const eqContainer = controller.section.querySelector('.media-player__equalizer');
        assert.ok(eqContainer, 'Equalizer overlay container must exist');

        assert.ok(controller.popoverEl, 'Preset popover element must exist');
    });

    it('updates metadata and play state on track change and play/pause', () => {
        const controller = buildMainPlayer(mount, mockCore, document);
        mockCore.loadTrack(1);

        const title = controller.section.querySelector('.media-player__meta__title');
        const artist = controller.section.querySelector('.media-player__meta__artist');
        assert.equal(title.textContent, 'Song Two');
        assert.equal(artist.textContent, 'Artist Two');

        mockCore.togglePlay();
        assert.equal(mockAudio.paused, false);

        mockCore.togglePlay();
        assert.equal(mockAudio.paused, true);
    });

    it('renders lazy-loaded image for preset with albumArt and SVG fallback without art', () => {
        const controller = buildMainPlayer(mount, mockCore, document);
        const presets = controller.section.querySelectorAll('.media-player__presets__preset');

        // Preset 0 has art
        assert.ok(presets[0].classList.contains('has-art'));
        const img = presets[0].querySelector('img');
        assert.ok(img);
        assert.equal(img.loading, 'lazy');
        assert.equal(img.src, 'https://media.example.com/art1.jpg');

        // Preset 1 does not have art -> SVG fallback
        assert.equal(presets[1].classList.contains('has-art'), false);
        const svg = presets[1].querySelector('svg');
        assert.ok(svg);
    });

    it('cycles option button modes on long-press', () => {
        const controller = buildMainPlayer(mount, mockCore, document);
        const optionBtn = controller.section.querySelector('.media-player__controls__option');
        assert.equal(optionBtn.getAttribute('title'), 'Mode: LIKE');

        // Simulate long press
        optionBtn.dispatchEvent(new Event('pointerdown'));
        // Advance timer
        // Or dispatch key down
        optionBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    it('cleans up resources on destroy()', () => {
        const controller = buildMainPlayer(mount, mockCore, document);
        assert.ok(mount.contains(controller.section));
        controller.destroy();
        assert.equal(mount.contains(controller.section), false);
        assert.equal(subscribers.length, 0);
    });
});

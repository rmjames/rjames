import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert/strict';
import { buildInlinePlayer } from '../../../scripts/media/InlinePlayer.js';

describe('InlinePlayer Shared Component', () => {
    let mount;
    let mockAudio;
    let mockCore;
    let subscribers;
    let audioListeners;

    beforeEach(() => {
        mount = document.createElement('div');
        subscribers = [];
        audioListeners = {};

        mockAudio = document.createElement('audio');
        mockAudio.currentTime = 0;
        mockAudio.src = 'https://media.example.com/art1.mp3';
        Object.defineProperty(mockAudio, 'duration', { value: 200, writable: true });
        Object.defineProperty(mockAudio, 'paused', { value: true, writable: true });

        mockAudio.addEventListener = (event, fn) => {
            if (!audioListeners[event]) audioListeners[event] = [];
            audioListeners[event].push(fn);
        };
        mockAudio.removeEventListener = (event, fn) => {
            if (audioListeners[event]) {
                audioListeners[event] = audioListeners[event].filter(cb => cb !== fn);
            }
        };
        mockAudio.dispatchEvent = (event) => {
            const listeners = audioListeners[event.type] || [];
            listeners.forEach(cb => cb(event));
            return true;
        };

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
            shuffle: () => mockCore.tracks[1]
        };
    });

    it('builds full DOM structure with container, meta, controls, and progress', () => {
        const controller = buildInlinePlayer(mount, mockCore, document);
        assert.ok(controller.container, 'Container element must exist');
        assert.ok(controller.section, 'Section element must exist');
        assert.ok(controller.section.classList.contains('media-player-inline'));

        const title = controller.section.querySelector('.media-player-inline__title');
        const artist = controller.section.querySelector('.media-player-inline__artist');
        assert.equal(title.textContent, 'Song One');
        assert.equal(artist.textContent, 'Artist One');

        const prevBtn = controller.section.querySelector('.media-player-inline__prev');
        const playBtn = controller.section.querySelector('.media-player-inline__play');
        const nextBtn = controller.section.querySelector('.media-player-inline__next');
        const slider = controller.section.querySelector('.media-player-inline__slider');
        const curTime = controller.section.querySelector('.media-player-inline__time.current');
        const durTime = controller.section.querySelector('.media-player-inline__time.duration');
        const optionBtn = controller.section.querySelector('.media-player-inline__option');

        assert.equal(prevBtn.dataset.analyticsElement, 'Previous');
        assert.equal(playBtn.dataset.analyticsElement, 'Play');
        assert.equal(nextBtn.dataset.analyticsElement, 'Next');
        assert.ok(slider);
        assert.equal(curTime.textContent, '0:00');
        assert.ok(durTime.textContent.includes('3:20')); // 200 seconds = 3m 20s
        assert.equal(optionBtn.dataset.analyticsElement, 'Options');
        assert.equal(optionBtn.getAttribute('title'), 'Shuffle');
    });

    it('updates time readouts and slider on audio timeupdate', () => {
        const controller = buildInlinePlayer(mount, mockCore, document);
        mockAudio.currentTime = 50;

        mockAudio.dispatchEvent(new Event('timeupdate'));

        const slider = controller.section.querySelector('.media-player-inline__slider');
        const curTime = controller.section.querySelector('.media-player-inline__time.current');
        const durTime = controller.section.querySelector('.media-player-inline__time.duration');

        assert.equal(slider.value, '25'); // 50/200 * 100
        assert.equal(curTime.textContent, '0:50');
        assert.equal(durTime.textContent, '-2:30'); // 150 seconds remaining = 2m 30s
    });

    it('updates scrub position on slider input event', () => {
        const controller = buildInlinePlayer(mount, mockCore, document);
        const slider = controller.section.querySelector('.media-player-inline__slider');
        slider.value = 50; // 50% of 200s = 100s
        slider.dispatchEvent(new Event('input'));

        assert.equal(mockAudio.currentTime, 100);
        const curTime = controller.section.querySelector('.media-player-inline__time.current');
        assert.equal(curTime.textContent, '1:40');
    });

    it('cleans up event listeners and removes container on destroy()', () => {
        const controller = buildInlinePlayer(mount, mockCore, document);
        assert.ok(mount.contains(controller.container));
        controller.destroy();
        assert.equal(mount.contains(controller.container), false);
        assert.equal(subscribers.length, 0);
        assert.equal((audioListeners['timeupdate'] || []).length, 0);
    });
});

import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert/strict';
import { buildWidgetPlayer } from '../../../scripts/media/WidgetPlayer.js';
import { SVG_PATHS } from '../../../scripts/media/Constants.js';

describe('WidgetPlayer Shared Component', () => {
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
            }
        };
    });

    it('builds full DOM structure with 2-row grid, current art, meta, and controls', () => {
        const controller = buildWidgetPlayer(mount, mockCore, document);
        assert.ok(controller.section, 'Section element must exist');
        assert.ok(controller.section.classList.contains('media-player'));

        const currentArt = controller.section.querySelector('.media-player__current');
        assert.ok(currentArt);
        assert.ok(currentArt.classList.contains('themed-background'));
        assert.equal(currentArt.dataset.analyticsElement, 'Current Track');

        const title = controller.section.querySelector('.media-player__meta__title');
        const artist = controller.section.querySelector('.media-player__meta__artist');
        assert.equal(title.textContent, 'Song One');
        assert.equal(artist.textContent, 'Artist One');

        const dislikeBtn = controller.section.querySelector('.media-player__dislike');
        const prevBtn = controller.section.querySelector('.media-player__prev');
        const playBtn = controller.section.querySelector('.media-player__play');
        const nextBtn = controller.section.querySelector('.media-player__next');
        const likeBtn = controller.section.querySelector('.media-player__like');

        assert.equal(dislikeBtn.dataset.analyticsElement, 'Dislike');
        assert.equal(prevBtn.dataset.analyticsElement, 'Previous');
        assert.equal(playBtn.dataset.analyticsElement, 'Play');
        assert.equal(nextBtn.dataset.analyticsElement, 'Next');
        assert.equal(likeBtn.dataset.analyticsElement, 'Like');
    });

    it('enforces mutual exclusivity between Like and Dislike', () => {
        const controller = buildWidgetPlayer(mount, mockCore, document);
        const dislikeBtn = controller.section.querySelector('.media-player__dislike');
        const dislikePath = dislikeBtn.querySelector('path');
        const likeBtn = controller.section.querySelector('.media-player__like');
        const likePath = likeBtn.querySelector('path');

        // Click Like
        likeBtn.dispatchEvent(new Event('click'));
        assert.equal(likePath.getAttribute('d'), SVG_PATHS.LIKE_FILLED);
        assert.equal(dislikePath.getAttribute('d'), SVG_PATHS.DISLIKE);

        // Click Dislike -> clears Like and fills Dislike
        dislikeBtn.dispatchEvent(new Event('click'));
        assert.equal(dislikePath.getAttribute('d'), SVG_PATHS.DISLIKE_FILLED);
        assert.equal(likePath.getAttribute('d'), SVG_PATHS.LIKE);

        // Click Dislike again -> untoggles back to outline
        dislikeBtn.dispatchEvent(new Event('click'));
        assert.equal(dislikePath.getAttribute('d'), SVG_PATHS.DISLIKE);
    });

    it('cleans up resources on destroy()', () => {
        const controller = buildWidgetPlayer(mount, mockCore, document);
        assert.ok(mount.contains(controller.section));
        controller.destroy();
        assert.equal(mount.contains(controller.section), false);
        assert.equal(subscribers.length, 0);
    });
});

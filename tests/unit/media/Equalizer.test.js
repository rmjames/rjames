import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Equalizer } from '../../../scripts/media/Equalizer.js';
import { EQ_CONFIG } from '../../../scripts/media/Constants.js';

describe('Equalizer', () => {
    let audioCtxMock;
    let sourceMock;
    let filtersMock;
    let audioElement;

    beforeEach(() => {
        // Mock AudioContext and related nodes
        filtersMock = [];
        sourceMock = {
            connect: vi.fn()
        };

        audioCtxMock = {
            createMediaElementSource: vi.fn().mockReturnValue(sourceMock),
            createBiquadFilter: vi.fn().mockImplementation(() => {
                const filter = {
                    type: '',
                    frequency: { value: 0 },
                    Q: { value: 0 },
                    gain: { value: 0 },
                    connect: vi.fn()
                };
                filtersMock.push(filter);
                return filter;
            }),
            destination: {},
            state: 'running',
            resume: vi.fn()
        };

        window.AudioContext = vi.fn().mockImplementation(() => audioCtxMock);

        audioElement = document.createElement('audio');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize AudioContext and filters only once', () => {
        const eq = new Equalizer(audioElement);
        eq.init();

        expect(window.AudioContext).toHaveBeenCalledTimes(1);
        expect(audioCtxMock.createMediaElementSource).toHaveBeenCalledWith(audioElement);
        expect(audioCtxMock.createBiquadFilter).toHaveBeenCalledTimes(EQ_CONFIG.length);

        // Verify connections
        // Source -> Filter 1 -> Filter 2 ... -> Destination
        expect(sourceMock.connect).toHaveBeenCalled();
        expect(filtersMock[filtersMock.length - 1].connect).toHaveBeenCalledWith(audioCtxMock.destination);

        // Calling init again should not recreate context
        eq.init();
        expect(window.AudioContext).toHaveBeenCalledTimes(1);
    });

    it('should resume AudioContext if suspended', () => {
        const eq = new Equalizer(audioElement);
        eq.init();

        audioCtxMock.state = 'suspended';
        eq.resume();
        expect(audioCtxMock.resume).toHaveBeenCalled();
    });

    it('should set gain correctly', () => {
        const eq = new Equalizer(audioElement);
        eq.init();

        eq.setGain(0, 5);
        expect(filtersMock[0].gain.value).toBe(5);
    });

    it('should set enabled state', () => {
        const eq = new Equalizer(audioElement);
        eq.setEnabled(false);
        expect(eq.isEnabled).toBe(false);
    });
});

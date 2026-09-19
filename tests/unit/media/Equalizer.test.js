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
                    gain: { value: 0, setTargetAtTime: vi.fn() },
                    connect: vi.fn(),
                    disconnect: vi.fn()
                };
                filtersMock.push(filter);
                return filter;
            }),
            destination: {},
            state: 'running',
            currentTime: 10,
            resume: vi.fn(),
            close: vi.fn().mockResolvedValue()
        };

        window.AudioContext = vi.fn().mockImplementation(function() {
            return audioCtxMock;
        });

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

    it('should set crossOrigin = anonymous on audio element during init (SEC-01)', () => {
        const eq = new Equalizer(audioElement);
        expect(audioElement.crossOrigin).toBeFalsy();
        eq.init();
        expect(audioElement.crossOrigin).toBe('anonymous');
    });

    it('should reuse existing MediaElementSourceNode for the same audio element (PERF-01)', () => {
        const eq1 = new Equalizer(audioElement);
        eq1.init();
        expect(audioCtxMock.createMediaElementSource).toHaveBeenCalledTimes(1);

        const eq2 = new Equalizer(audioElement);
        eq2.init();
        // Should reuse cached source without re-calling createMediaElementSource
        expect(audioCtxMock.createMediaElementSource).toHaveBeenCalledTimes(1);
    });

    it('should resume AudioContext if suspended', () => {
        const eq = new Equalizer(audioElement);
        eq.init();

        audioCtxMock.state = 'suspended';
        eq.resume();
        expect(audioCtxMock.resume).toHaveBeenCalled();
    });

    it('should set gain correctly with clamping and audio parameter smoothing (PERF-05)', () => {
        const eq = new Equalizer(audioElement);
        eq.init();

        eq.setGain(0, 5);
        expect(filtersMock[0].gain.value).toBe(5);
        expect(filtersMock[0].gain.setTargetAtTime).toHaveBeenCalledWith(5, 10, 0.015);

        // Clamping to max 20
        eq.setGain(0, 50);
        expect(filtersMock[0].gain.value).toBe(20);

        // Clamping to min -20
        eq.setGain(0, -30);
        expect(filtersMock[0].gain.value).toBe(-20);

        // Ignores non-finite values
        eq.setGain(0, NaN);
        expect(filtersMock[0].gain.value).toBe(-20);
    });

    it('should smoothly bypass filters when disabled and restore when enabled (PERF-06)', () => {
        const eq = new Equalizer(audioElement);
        eq.init();
        eq.setGain(0, 8);
        expect(filtersMock[0].gain.value).toBe(8);

        // Disable EQ -> all filter gains ramp to 0
        eq.setEnabled(false);
        expect(eq.isEnabled).toBe(false);
        expect(filtersMock[0].gain.value).toBe(0);
        expect(filtersMock[0].gain.setTargetAtTime).toHaveBeenCalledWith(0, 10, 0.015);

        // Enable EQ -> restores configured gain
        eq.setEnabled(true);
        expect(eq.isEnabled).toBe(true);
        expect(filtersMock[0].gain.value).toBe(8);
        expect(filtersMock[0].gain.setTargetAtTime).toHaveBeenCalledWith(8, 10, 0.015);
    });

    it('should disconnect nodes and close AudioContext on destroy (PERF-01)', () => {
        sourceMock.disconnect = vi.fn();
        const eq = new Equalizer(audioElement);
        eq.init();

        eq.destroy();
        expect(sourceMock.disconnect).toHaveBeenCalled();
        filtersMock.forEach(filter => {
            expect(filter.disconnect).toHaveBeenCalled();
        });
        expect(audioCtxMock.close).toHaveBeenCalled();
        expect(eq.audioCtx).toBeNull();
        expect(eq.source).toBeNull();
    });
});

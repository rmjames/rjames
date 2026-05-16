import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioEngine } from '../js/AudioEngine.js';

describe('AudioEngine', () => {
  let engine;
  let mockAudioContext;
  let mockSource;
  let mockBuffer;

  beforeEach(() => {
    mockSource = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      playbackRate: { value: 1.0 },
      buffer: null,
      onended: null
    };

    mockBuffer = {
      duration: 100,
      numberOfChannels: 2,
      length: 44100,
      sampleRate: 44100,
      getChannelData: vi.fn().mockReturnValue(new Float32Array(44100))
    };

    mockAudioContext = {
      decodeAudioData: vi.fn().mockResolvedValue(mockBuffer),
      createBuffer: vi.fn().mockReturnValue(mockBuffer),
      createBufferSource: vi.fn().mockReturnValue(mockSource),
      resume: vi.fn(),
      state: 'suspended',
      destination: {},
      currentTime: 10.0
    };

    window.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
    
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
    });

    engine = new AudioEngine();
  });

  it('should initialize correctly', () => {
    expect(engine.audioCtx).toBeNull();
    expect(engine.forwardBuffer).toBeNull();
    expect(engine.currentSource).toBeNull();
  });

  it('should load audio and create reverse buffer', async () => {
    const success = await engine.load('dummy.mp3');
    expect(success).toBe(true);
    expect(engine.audioCtx).toBeDefined();
    expect(engine.forwardBuffer).toBe(mockBuffer);
    expect(engine.reverseBuffer).toBeDefined();
    expect(engine.audioDuration).toBe(100);
    expect(window.AudioContext).toHaveBeenCalled();
  });

  it('should handle load error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const success = await engine.load('dummy.mp3');
    expect(success).toBe(false);
  });

  it('should resume AudioContext if suspended', async () => {
    await engine.load('dummy.mp3');
    engine.resume();
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it('should start playback and connect source', async () => {
    await engine.load('dummy.mp3');
    const onEnded = vi.fn();
    engine.play(5.0, 1.2, onEnded);
    
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockSource.buffer).toBe(mockBuffer);
    expect(mockSource.playbackRate.value).toBe(1.2);
    expect(mockSource.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    expect(mockSource.start).toHaveBeenCalledWith(0, 5.0);
    expect(mockSource.onended).toBe(onEnded);
    expect(engine.currentSource).toBe(mockSource);
  });

  it('should stop playback and disconnect', async () => {
    await engine.load('dummy.mp3');
    engine.play(0, 1.0);
    engine.stop();
    
    expect(mockSource.stop).toHaveBeenCalled();
    expect(mockSource.disconnect).toHaveBeenCalled();
    expect(mockSource.onended).toBeNull();
    expect(engine.currentSource).toBeNull();
  });

  it('should update pitch correctly', async () => {
    await engine.load('dummy.mp3');
    engine.play(0, 1.0);
    engine.updatePitch(1.5);
    expect(mockSource.playbackRate.value).toBe(1.5);
  });

  it('should play scratch audio in forward direction', async () => {
    await engine.load('dummy.mp3');
    engine.playScratch(2.0, 15.0); // positive velocity
    
    expect(engine.scratchDirection).toBe(1);
    expect(engine.scratchSource).toBeDefined();
    expect(engine.scratchSource.buffer).toBe(engine.forwardBuffer);
    expect(mockSource.start).toHaveBeenCalledWith(0, 15.0);
    expect(mockSource.playbackRate.value).toBe(2.0);
  });

  it('should play scratch audio in reverse direction', async () => {
    await engine.load('dummy.mp3');
    engine.playScratch(-2.0, 15.0); // negative velocity
    
    expect(engine.scratchDirection).toBe(-1);
    expect(engine.scratchSource).toBeDefined();
    expect(engine.scratchSource.buffer).toBe(engine.reverseBuffer);
    // startPos = duration (100) - current (15) = 85
    expect(mockSource.start).toHaveBeenCalledWith(0, 85.0); 
    expect(mockSource.playbackRate.value).toBe(2.0);
  });

  it('should stop scratch when velocity is near zero', async () => {
    await engine.load('dummy.mp3');
    engine.playScratch(2.0, 15.0);
    engine.playScratch(0.01, 16.0); // velocity < 0.05
    
    expect(mockSource.stop).toHaveBeenCalled();
    expect(mockSource.disconnect).toHaveBeenCalled();
    expect(engine.scratchSource).toBeNull();
    expect(engine.scratchDirection).toBe(0);
  });

  it('should cap scratch playback rate to 5.0', async () => {
    await engine.load('dummy.mp3');
    engine.playScratch(10.0, 15.0); 
    expect(mockSource.playbackRate.value).toBe(5.0);
  });

  it('should get current time from audio context', async () => {
    expect(engine.getCurrentTime()).toBe(0);
    await engine.load('dummy.mp3');
    expect(engine.getCurrentTime()).toBe(10.0);
  });
});

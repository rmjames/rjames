import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TurntableController } from '../lab/TurntableController.js';
import { AudioEngine } from '../lab/AudioEngine.js';
import { TurntableState } from '../lab/TurntableState.js';

// Mock dependencies
vi.mock('../lab/AudioEngine.js');
vi.mock('../lab/TurntableState.js');

describe('TurntableController', () => {
  let controller;
  let mockElements;

  beforeEach(() => {
    mockElements = {
      'start-stop-btn': { addEventListener: vi.fn() },
      'tonearm': { style: {} },
      'btn-33': { addEventListener: vi.fn() },
      'btn-45': { addEventListener: vi.fn() },
      'btn-33-cap': { setAttribute: vi.fn() },
      'btn-45-cap': { setAttribute: vi.fn() },
      'btn-33-led': { setAttribute: vi.fn() },
      'btn-45-led': { setAttribute: vi.fn() },
      'pitch-zero-led': { setAttribute: vi.fn() },
      'power-switch': { addEventListener: vi.fn() },
      'power-dial': { style: {} },
      'strobe-red-light': { setAttribute: vi.fn(), removeAttribute: vi.fn() },
      'strobe-white-light': { setAttribute: vi.fn() },
      'lp': {
        addEventListener: vi.fn(),
        setPointerCapture: vi.fn(),
        releasePointerCapture: vi.fn(),
        setAttribute: vi.fn(),
        style: {}
      },
      'pitch-slider-knob': {
        addEventListener: vi.fn(),
        setPointerCapture: vi.fn(),
        releasePointerCapture: vi.fn(),
        setAttribute: vi.fn(),
        style: {}
      },
      'loading': { style: {}, innerText: '' }
    };

    document.getElementById = vi.fn((id) => mockElements[id]);

    const mockSVG = {
      pauseAnimations: vi.fn(),
      unpauseAnimations: vi.fn(),
      createSVGPoint: vi.fn(() => ({
        x: 0, y: 0,
        matrixTransform: vi.fn(() => ({ x: 100, y: 100 }))
      })),
      getScreenCTM: vi.fn(() => ({
        inverse: vi.fn()
      }))
    };
    document.querySelector = vi.fn((selector) => {
      if (selector === 'svg') return mockSVG;
      return null;
    });

    // Reset mocks for classes
    AudioEngine.mockClear();
    TurntableState.mockClear();

    // Setup mock instance methods for AudioEngine
    AudioEngine.prototype.load = vi.fn().mockResolvedValue(true);
    AudioEngine.prototype.resume = vi.fn();
    AudioEngine.prototype.play = vi.fn();
    AudioEngine.prototype.stop = vi.fn();
    AudioEngine.prototype.updatePitch = vi.fn();
    AudioEngine.prototype.playScratch = vi.fn();
    AudioEngine.prototype.stopScratch = vi.fn();
    AudioEngine.prototype.getCurrentTime = vi.fn().mockReturnValue(0);

    // Provide default AudioEngine properties
    Object.defineProperty(AudioEngine.prototype, 'forwardBuffer', { value: {}, writable: true });
    Object.defineProperty(AudioEngine.prototype, 'audioDuration', { value: 100, writable: true });

    // Setup mock instance methods for TurntableState
    TurntableState.prototype.setSpeed = vi.fn();
    TurntableState.prototype.applyPitch = vi.fn();
    TurntableState.prototype.startPlayback = vi.fn();
    TurntableState.prototype.stopPlayback = vi.fn();
    TurntableState.prototype.startScratch = vi.fn();
    TurntableState.prototype.updateScratch = vi.fn();
    TurntableState.prototype.stopScratch = vi.fn();
    TurntableState.prototype.syncAudioTime = vi.fn();

    // Stub rAF to prevent infinite loops in tests
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => 0);

    controller = new TurntableController();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize and bind events correctly', () => {
    expect(document.getElementById).toHaveBeenCalledWith('start-stop-btn');
    expect(mockElements['btn-33'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should handle initAudio correctly on success', async () => {
    await controller.initAudio('test.mp3');

    expect(controller.audioEngine.load).toHaveBeenCalledWith('test.mp3');
    expect(controller.loadingDiv.style.display).toBe('none');
    expect(controller.svg.pauseAnimations).toHaveBeenCalled();
  });

  it('should handle initAudio correctly on failure', async () => {
    controller.audioEngine.load.mockResolvedValueOnce(false);
    await controller.initAudio('test.mp3');

    expect(controller.loadingDiv.innerText).toBe('Error decoding audio.');
  });

  it('should stop active playback and reset tonearm and lp rotation on track switch', async () => {
    controller.state.isPlaying = true;
    controller.audioEngine.getCurrentTime.mockReturnValue(50);

    await controller.initAudio('new-track.mp3');

    expect(controller.state.stopPlayback).toHaveBeenCalledWith(50);
    expect(controller.audioEngine.stop).toHaveBeenCalled();
    expect(controller.svg.pauseAnimations).toHaveBeenCalled();
    expect(controller.tonearm.style.transform).toBe('rotate(-25deg)');
    expect(controller.state.currentAudioTime).toBe(0);
    expect(mockElements['lp'].setAttribute).toHaveBeenCalledWith('transform', 'rotate(0)');
  });

  it('should update speed correctly for 45 RPM', () => {
    controller.setSpeed(45);
    expect(controller.state.setSpeed).toHaveBeenCalledWith(45);
    expect(mockElements['btn-33-cap'].setAttribute).toHaveBeenCalledWith('fill', 'var(--gray-0)');
    expect(mockElements['btn-45-cap'].setAttribute).toHaveBeenCalledWith('fill', 'var(--white-0)');
    expect(controller.audioEngine.updatePitch).toHaveBeenCalled();
  });

  it('should stop playback if already playing when toggled', () => {
    controller.state.isPlaying = true;
    controller.togglePlayback();

    expect(controller.state.stopPlayback).toHaveBeenCalled();
    expect(controller.audioEngine.stop).toHaveBeenCalled();
    expect(controller.svg.pauseAnimations).toHaveBeenCalled();
  });

  it('should calculate SVG angle correctly', () => {
    const e = { clientX: 50, clientY: 50 };
    const angle = controller.getAngle(e);
    expect(typeof angle).toBe('number');
    expect(controller.svg.createSVGPoint).toHaveBeenCalled();
  });

  it('should handle pitch pointer events', () => {
    // Mouse down
    const downEvent = { clientY: 100, pointerId: 1 };
    controller.onPitchPointerDown(downEvent);
    expect(controller.isDraggingPitch).toBe(true);
    expect(controller.pitchStartY).toBe(100);
    expect(mockElements['pitch-slider-knob'].setPointerCapture).toHaveBeenCalledWith(1);

    // Mouse move
    const moveEvent = { clientY: 150, pointerId: 1 };
    controller.onPitchPointerMove(moveEvent);
    // 125 + 50 = 175
    expect(mockElements['pitch-slider-knob'].setAttribute).toHaveBeenCalledWith('transform', 'translate(14, 175)');
    expect(controller.state.applyPitch).toHaveBeenCalled();
    expect(controller.audioEngine.updatePitch).toHaveBeenCalled();

    // Mouse up
    const upEvent = { clientY: 150, pointerId: 1 };
    controller.onPitchPointerUp(upEvent);
    expect(controller.isDraggingPitch).toBe(false);
    expect(controller.currentPitchY).toBe(175);
    expect(mockElements['pitch-slider-knob'].releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should trigger scratch down events', () => {
    const downEvent = { pointerId: 1, clientX: 100, clientY: 100 };
    controller.onLpPointerDown(downEvent);

    expect(mockElements['lp'].setPointerCapture).toHaveBeenCalledWith(1);
    expect(controller.state.startScratch).toHaveBeenCalled();
  });

  it('should not play scratch sound when power is off during scratch render loop', () => {
    controller.isPowerOn = false;
    controller.state.isScratching = true;
    controller.state.currentVelocity = 1.5;
    controller.state.lastScratchTime = performance.now();
    controller.state.currentAudioTime = 10;
    controller.state.audioDuration = 100;
    
    controller.renderLoop(performance.now());
    
    expect(controller.audioEngine.playScratch).not.toHaveBeenCalled();
    expect(controller.audioEngine.stopScratch).toHaveBeenCalled();
  });

  it('should return tonearm to rest when power is turned off while scratching', () => {
    controller.isPowerOn = true;
    controller.state.isScratching = true;
    controller.state.wasPlayingBeforeScratch = true;
    controller.tonearm.style.transform = 'rotate(22deg)';
    
    controller.togglePower(); // Turns power OFF
    
    expect(controller.isPowerOn).toBe(false);
    expect(controller.state.wasPlayingBeforeScratch).toBe(false);
    expect(controller.tonearm.style.transform).toBe('rotate(-25deg)');
  });

  it('should not resume playback on pointer release if power is off', () => {
    controller.isPowerOn = false;
    controller.activeLpPointerId = 1;
    controller.state.isScratching = true;
    controller.state.wasPlayingBeforeScratch = true;
    controller.tonearm.style.transform = 'rotate(22deg)';
    
    const upEvent = { pointerId: 1 };
    controller.onLpPointerUp(upEvent);
    
    expect(controller.audioEngine.play).not.toHaveBeenCalled();
    expect(controller.state.wasPlayingBeforeScratch).toBe(false);
    expect(controller.tonearm.style.transform).toBe('rotate(-25deg)');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { TurntableState } from '../lab/TurntableState.js';

describe('TurntableState', () => {
  let state;

  beforeEach(() => {
    state = new TurntableState(100); // 100 seconds audio duration
  });

  it('should initialize with correct default values', () => {
    expect(state.audioDuration).toBe(100);
    expect(state.isPlaying).toBe(false);
    expect(state.basePlaybackRate).toBe(1.0);
    expect(state.pitchMultiplier).toBe(1.0);
    expect(state.isScratching).toBe(false);
  });

  it('should calculate effectivePlaybackRate correctly', () => {
    state.basePlaybackRate = 1.35;
    state.pitchMultiplier = 1.1;
    expect(state.effectivePlaybackRate).toBe(1.35 * 1.1);
  });

  it('should update base playback rate when setting speed', () => {
    state.setSpeed(45);
    expect(state.basePlaybackRate).toBe(1.35);
    state.setSpeed(33);
    expect(state.basePlaybackRate).toBe(1.0);
  });

  it('should handle startPlayback correctly', () => {
    state.startPlayback(5.0);
    expect(state.isPlaying).toBe(true);
    expect(state.lastStartTime).toBe(5.0);
    expect(state.startOffset).toBe(0);
  });

  it('should sync audio time when playing', () => {
    state.startPlayback(5.0);
    state.syncAudioTime(10.0); // 5 seconds elapsed
    expect(state.currentAudioTime).toBe(5.0); // 5s * 1.0 rate
  });

  it('should not sync audio time beyond audio duration', () => {
    state.startPlayback(5.0);
    state.syncAudioTime(200.0);
    expect(state.currentAudioTime).toBe(100); // Max duration is 100
  });

  it('should apply pitch and update offsets', () => {
    state.startPlayback(5.0);
    state.applyPitch(1.2, 10.0); // 5 seconds elapsed at 1.0 rate => currentAudioTime = 5.0
    expect(state.pitchMultiplier).toBe(1.2);
    expect(state.startOffset).toBe(5.0);
    expect(state.lastStartTime).toBe(10.0);
  });

  it('should stop playback and sync time', () => {
    state.startPlayback(5.0);
    state.stopPlayback(15.0);
    expect(state.isPlaying).toBe(false);
    expect(state.currentAudioTime).toBe(10.0);
  });

  it('should handle startScratch', () => {
    state.startPlayback(5.0);
    state.startScratch(90, 1000);
    expect(state.isScratching).toBe(true);
    expect(state.wasPlayingBeforeScratch).toBe(true);
    expect(state.lastScratchAngle).toBe(90);
    expect(state.lastScratchTime).toBe(1000);
    expect(state.currentVelocity).toBe(0);
  });

  it('should calculate scratch velocity correctly', () => {
    state.startScratch(90, 1000);
    state.updateScratch(180, 2000, 0.05); // 90 degrees delta over 1 second, 0.05 secs per degree
    expect(state.lastScratchAngle).toBe(180);
    expect(state.lastScratchTime).toBe(2000);
    expect(state.currentVelocity).toBe((90 * 0.05) / 1); // 4.5
  });

  it('should handle shortest path for scratch angles', () => {
    state.startScratch(350, 1000);
    state.updateScratch(10, 2000, 0.05); // From 350 to 10 is actually +20 degrees
    expect(state.currentVelocity).toBe((20 * 0.05) / 1); // 1.0
  });

  it('should handle stopScratch', () => {
    state.startScratch(90, 1000);
    state.stopScratch();
    expect(state.isScratching).toBe(false);
  });
});

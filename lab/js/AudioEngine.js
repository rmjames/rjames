export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.forwardBuffer = null;
    this.reverseBuffer = null;
    this.currentSource = null;
    this.scratchSource = null;
    this.scratchDirection = 0;
    this.audioDuration = 0;
  }

  async load(url) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.forwardBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.audioDuration = this.forwardBuffer.duration;
      
      const channels = this.forwardBuffer.numberOfChannels;
      this.reverseBuffer = this.audioCtx.createBuffer(channels, this.forwardBuffer.length, this.forwardBuffer.sampleRate);
      
      for (let i = 0; i < channels; i++) {
        const dest = this.reverseBuffer.getChannelData(i);
        const src = this.forwardBuffer.getChannelData(i);
        for (let j = 0; j < this.forwardBuffer.length; j++) {
          dest[j] = src[this.forwardBuffer.length - 1 - j];
        }
      }
      return true;
    } catch (e) {
      console.error("Error loading audio", e);
      return false;
    }
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  play(offset, rate, onEnded) {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        console.warn("Failed to stop previous play source:", e);
      }
    }
    this.currentSource = this.audioCtx.createBufferSource();
    this.currentSource.buffer = this.forwardBuffer;
    this.currentSource.playbackRate.value = rate;
    this.currentSource.connect(this.audioCtx.destination);
    
    // Clamp offset to prevent RangeError if it exceeds buffer duration
    const safeOffset = Math.max(0, Math.min(offset, this.audioDuration - 0.02));
    
    try {
      this.currentSource.start(0, safeOffset);
    } catch (e) {
      console.error("Failed to start play source:", e);
    }
    
    if (onEnded) {
      this.currentSource.onended = onEnded;
    }
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.onended = null;
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        console.warn("Failed to stop play source:", e);
      }
      this.currentSource = null;
    }
  }

  updatePitch(rate) {
    if (this.currentSource) {
      this.currentSource.playbackRate.value = rate;
    }
  }

  playScratch(velocity, currentAudioTime) {
    const absVel = Math.abs(velocity);
    
    // Hysteresis thresholds to avoid audio engine overload from micro-jitter
    const STOP_THRESHOLD = 0.03;
    const START_THRESHOLD = 0.08;

    if (this.scratchDirection === 0) {
      // Currently stopped. Only start if velocity is above START_THRESHOLD
      if (absVel < START_THRESHOLD) {
        return;
      }
    } else {
      // Currently playing. Only stop if velocity falls below STOP_THRESHOLD
      if (absVel < STOP_THRESHOLD) {
        this.stopScratch();
        return;
      }
    }

    const newDir = velocity > 0 ? 1 : -1;
    
    if (this.scratchDirection !== newDir) {
      if (this.scratchSource) {
        try {
          this.scratchSource.stop();
          this.scratchSource.disconnect();
        } catch (e) {
          console.warn("Failed to stop previous scratch source:", e);
        }
      }
      this.scratchSource = this.audioCtx.createBufferSource();
      this.scratchSource.buffer = newDir === 1 ? this.forwardBuffer : this.reverseBuffer;
      this.scratchSource.connect(this.audioCtx.destination);
      
      let startPos = newDir === 1 ? currentAudioTime : this.audioDuration - currentAudioTime;
      // Safety clamp to prevent RangeError
      startPos = Math.max(0, Math.min(startPos, this.audioDuration - 0.02));
      
      try {
        this.scratchSource.start(0, startPos);
      } catch (e) {
        console.error("Failed to start scratch source:", e);
      }
      this.scratchDirection = newDir;
    }
    
    if (this.scratchSource) {
      this.scratchSource.playbackRate.value = Math.min(absVel, 5.0);
    }
  }

  stopScratch() {
    if (this.scratchSource) {
      try {
        this.scratchSource.stop();
        this.scratchSource.disconnect();
      } catch (e) {
        console.warn("Failed to stop scratch source:", e);
      }
      this.scratchSource = null;
      this.scratchDirection = 0;
    }
  }

  getCurrentTime() {
    return this.audioCtx ? this.audioCtx.currentTime : 0;
  }
}

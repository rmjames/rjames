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
      this.currentSource.stop();
      this.currentSource.disconnect();
    }
    this.currentSource = this.audioCtx.createBufferSource();
    this.currentSource.buffer = this.forwardBuffer;
    this.currentSource.playbackRate.value = rate;
    this.currentSource.connect(this.audioCtx.destination);
    
    this.currentSource.start(0, offset);
    if (onEnded) {
      this.currentSource.onended = onEnded;
    }
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.onended = null;
      this.currentSource.stop();
      this.currentSource.disconnect();
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
    
    if (absVel < 0.05) {
      this.stopScratch();
      return;
    }

    const newDir = velocity > 0 ? 1 : -1;
    
    if (this.scratchDirection !== newDir) {
      if (this.scratchSource) {
        this.scratchSource.stop();
        this.scratchSource.disconnect();
      }
      this.scratchSource = this.audioCtx.createBufferSource();
      this.scratchSource.buffer = newDir === 1 ? this.forwardBuffer : this.reverseBuffer;
      this.scratchSource.connect(this.audioCtx.destination);
      
      let startPos = newDir === 1 ? currentAudioTime : this.audioDuration - currentAudioTime;
      this.scratchSource.start(0, startPos);
      this.scratchDirection = newDir;
    }
    
    if (this.scratchSource) {
      this.scratchSource.playbackRate.value = Math.min(absVel, 5.0);
    }
  }

  stopScratch() {
    if (this.scratchSource) {
      this.scratchSource.stop();
      this.scratchSource.disconnect();
      this.scratchSource = null;
      this.scratchDirection = 0;
    }
  }

  getCurrentTime() {
    return this.audioCtx ? this.audioCtx.currentTime : 0;
  }
}

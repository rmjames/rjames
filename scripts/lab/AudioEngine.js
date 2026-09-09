export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.forwardBuffer = null;
    this.reverseBuffer = null;
    this.currentSource = null;
    this.scratchSource = null;
    this.scratchDirection = 0;
    this.audioDuration = 0;
    this.customSoundBuffers = {};
  }

  async load(url) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const cleanUrl = typeof url === 'string' ? url.replace(/[?&]import(?:&.*)?$/, '') : url;
      const response = await fetch(cleanUrl);
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
    const safeOffset = Math.max(0, Math.min(offset, this.audioDuration - .02));
    
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
    const STOP_THRESHOLD = .03;
    const START_THRESHOLD = .08;

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
      startPos = Math.max(0, Math.min(startPos, this.audioDuration - .02));
      
      try {
        this.scratchSource.start(0, startPos);
      } catch (e) {
        console.error("Failed to start scratch source:", e);
      }
      this.scratchDirection = newDir;
    }
    
    if (this.scratchSource) {
      this.scratchSource.playbackRate.value = Math.min(absVel, 5);
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

  getNoiseBuffer() {
    if (this._noiseBuffer) return this._noiseBuffer;
    const bufferSize = this.audioCtx.sampleRate * .2; // .2 seconds
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this._noiseBuffer = buffer;
    return this._noiseBuffer;
  }

  playSpray(t) {
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = this.getNoiseBuffer();
    
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500, t);
    filter.Q.setValueAtTime(1.5, t);
    
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(.12, t);
    gainNode.gain.exponentialRampToValueAtTime(.001, t + .15);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    noiseSource.start(t);
    noiseSource.stop(t + .15);
    
    noiseSource.onended = () => {
      noiseSource.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    };
  }

  async loadCustomSound(url) {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.customSoundBuffers[url]) {
      return this.customSoundBuffers[url];
    }
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.customSoundBuffers[url] = audioBuffer;
      return audioBuffer;
    } catch (e) {
      console.error("Failed to load custom sound file:", url, e);
      return null;
    }
  }

  playCustomSound(audioBuffer) {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    this.resume();
    if (!audioBuffer) return;
    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioCtx.destination);
    source.start(0);
    source.onended = () => {
      source.disconnect();
    };
  }

  playClick(typeOrParams) {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    this.resume();
    const t = this.audioCtx.currentTime;

    let isFileUrl = typeof typeOrParams === 'string' &&
      (typeOrParams.includes('/') || /\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(typeOrParams));
    
    let fileUrl = isFileUrl ? typeOrParams : null;

    if (typeof typeOrParams === 'object' && typeOrParams !== null && typeof typeOrParams.src === 'string') {
      isFileUrl = true;
      fileUrl = typeOrParams.src;
    }

    if (isFileUrl) {
      const cached = this.customSoundBuffers[fileUrl];
      if (cached) {
        this.playCustomSound(cached);
      } else {
        this.loadCustomSound(fileUrl).then(buffer => {
          if (buffer) {
            this.playCustomSound(buffer);
          }
        });
      }
      return;
    }

    if (typeOrParams === 'spray') {
      this.playSpray(t);
      return;
    }

    let params = {
      thumpFreqStart: 150,
      thumpFreqEnd: 60,
      thumpDecay: .025,
      thumpGain: .15,
      snapFreqStart: 8000,
      snapFreqEnd: 2000,
      snapDecay: .008,
      snapGain: .08
    };

    if (typeOrParams === 'switch') {
      params = {
        thumpFreqStart: 120,
        thumpFreqEnd: 50,
        thumpDecay: .035,
        thumpGain: .25,
        snapFreqStart: 6000,
        snapFreqEnd: 1500,
        snapDecay: .012,
        snapGain: .12
      };
    } else if (typeOrParams === 'cassette' || typeOrParams === 'heavy') {
      params = {
        thumpFreqStart: 90,
        thumpFreqEnd: 40,
        thumpDecay: .05,
        thumpGain: .35,
        snapFreqStart: 4000,
        snapFreqEnd: 1000,
        snapDecay: .02,
        snapGain: .15
      };
    } else if (typeof typeOrParams === 'object' && typeOrParams !== null) {
      params = { ...params, ...typeOrParams };
    }

    this._synthesizePulse('sine', params.thumpFreqStart, params.thumpFreqEnd, params.thumpGain, params.thumpDecay, t);
    this._synthesizePulse('triangle', params.snapFreqStart, params.snapFreqEnd, params.snapGain, params.snapDecay, t);
  }

  _synthesizePulse(type, startFreq, endFreq, peakGain, decay, t) {
    if (peakGain <= 0) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + decay);

    gain.gain.setValueAtTime(peakGain, t);
    gain.gain.exponentialRampToValueAtTime(.001, t + decay);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(t);
    osc.stop(t + decay);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}

export class TurntableState {
  constructor(audioDuration = 0) {
    this.audioDuration = audioDuration;
    
    this.isPlaying = false;
    this.basePlaybackRate = 1.0;
    this.pitchMultiplier = 1.0;
    
    this.currentAudioTime = 0;
    this.lastStartTime = 0;
    this.startOffset = 0;

    this.isScratching = false;
    this.wasPlayingBeforeScratch = false;
    this.scratchStartAngle = 0;
    this.lastScratchAngle = 0;
    this.lastScratchTime = 0;
    this.currentVelocity = 0;
    this.lastRealTime = 0;
  }

  get effectivePlaybackRate() {
    return this.basePlaybackRate * this.pitchMultiplier;
  }

  setSpeed(rpm) {
    if (rpm === 33) {
      this.basePlaybackRate = 1.0;
    } else if (rpm === 45) {
      this.basePlaybackRate = 1.35;
    }
  }

  syncAudioTime(audioCtxTime) {
    if (this.isPlaying && !this.isScratching) {
      this.currentAudioTime = this.startOffset + (audioCtxTime - this.lastStartTime) * this.effectivePlaybackRate;
      if (this.currentAudioTime > this.audioDuration) {
        this.currentAudioTime = this.audioDuration;
      }
    }
  }

  applyPitch(newPitchMultiplier, audioCtxTime) {
    if (this.isPlaying && !this.isScratching) {
      this.syncAudioTime(audioCtxTime);
      this.startOffset = this.currentAudioTime;
      this.lastStartTime = audioCtxTime;
    }
    this.pitchMultiplier = newPitchMultiplier;
  }

  startPlayback(audioCtxTime) {
    this.isPlaying = true;
    this.lastStartTime = audioCtxTime;
    this.startOffset = this.currentAudioTime;
  }

  stopPlayback(audioCtxTime) {
    if (this.isPlaying) {
      this.syncAudioTime(audioCtxTime);
      this.isPlaying = false;
    }
  }

  startScratch(angle, time) {
    this.isScratching = true;
    this.wasPlayingBeforeScratch = this.isPlaying;
    this.lastScratchAngle = angle;
    this.lastScratchTime = time;
    this.currentVelocity = 0;
  }

  updateScratch(angle, time, secondsPerDegree) {
    if (!this.isScratching) return;
    
    let deltaAngle = angle - this.lastScratchAngle;
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    const dt = (time - this.lastScratchTime) / 1000;
    if (dt > 0) {
      this.currentVelocity = (deltaAngle * secondsPerDegree) / dt;
    }
    
    this.lastScratchAngle = angle;
    this.lastScratchTime = time;
  }

  stopScratch() {
    this.isScratching = false;
  }
}

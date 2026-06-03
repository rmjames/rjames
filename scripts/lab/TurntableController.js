import { AudioEngine } from './AudioEngine.js';
import { TurntableState } from '../lab/TurntableState.js';

export class TurntableController {
  constructor(soundConfig = {}) {
    this.audioEngine = new AudioEngine();
    this.state = new TurntableState();

    this.SECONDS_PER_DEGREE = 1.8 / 360;

    this.btn = document.getElementById('start-stop-btn');
    this.svg = document.querySelector('svg');
    this.tonearm = document.getElementById('tonearm');
    this.btn33 = document.getElementById('btn-33');
    this.btn45 = document.getElementById('btn-45');
    this.btn33Cap = document.getElementById('btn-33-cap');
    this.btn45Cap = document.getElementById('btn-45-cap');
    this.btn33Led = document.getElementById('btn-33-led');
    this.btn45Led = document.getElementById('btn-45-led');
    this.lp = document.getElementById('lp');
    this.pitchKnob = document.getElementById('pitch-slider-knob');
    this.loadingDiv = document.getElementById('loading');

    this.powerSwitch = document.getElementById('power-switch');
    this.powerDial = document.getElementById('power-dial');
    this.strobeRedLight = document.getElementById('strobe-red-light');
    this.strobeWhiteLight = document.getElementById('strobe-white-light');
    this.pitchZeroLed = document.getElementById('pitch-zero-led');
    this.powerDialRedReflection = document.getElementById('power-dial-red-reflection');

    this.isPowerOn = false;
    this.isNeedleOnRecord = false;
    this.visualRotation = 0;
    this.currentRpm = 33;
    this.isDraggingPitch = false;
    this.pitchStartY = 0;
    this.currentPitchY = 125;
    this.smoothedVelocity = 0;

    this.activeLpPointerId = null;
    this.activePitchPointerId = null;

    // Config-driven click sounds definition using Map
    const aliasMap = new Map([
      ['startButton', '#start-stop-btn'],
      ['powerButton', '#power-switch, #power-dial'],
      ['rpm33Button', '#btn-33'],
      ['rpm45Button', '#btn-45'],
      ['sprayCapPink', '#spray-cap-pink'],
      ['sprayCapYellow', '#spray-cap-yellow'],
      ['libraryButton', '#btn-library'],
      ['closeLibraryButton', '#close-library'],
      ['prevAlbumButton', '#btn-prev-album'],
      ['nextAlbumButton', '#btn-next-album'],
      ['trackItem', '.details-track-item'],
      ['crateRecord', '.crate-record']
    ]);

    const defaultSoundConfig = new Map([
      ['#power-switch, #power-dial', 'switch'],
      ['#start-stop-btn', 'cassette'],
      ['#cassette-buttons .clickable, #cassette-buttons', 'cassette'],
      ['[id*="spray-cap"]', 'spray'],
      ['#btn-33', 'click'],
      ['#btn-45', 'click'],
      ['.crate-record', 'click'],
      ['.details-track-item', 'click'],
      ['#tonearm', 'click'],
      ['button', 'click']
    ]);

    this.soundConfig = new Map();

    const userEntries = soundConfig instanceof Map ? soundConfig.entries() : Object.entries(soundConfig);
    for (const [key, value] of userEntries) {
      const selector = aliasMap.get(key) || key;
      this.soundConfig.set(selector, value);
    }

    for (const [selector, value] of defaultSoundConfig.entries()) {
      if (!this.soundConfig.has(selector)) {
        this.soundConfig.set(selector, value);
      }
    }

    // Pre-load custom sound files if specified in config Map
    for (const [selector, sound] of this.soundConfig.entries()) {
      const isFileUrl = typeof sound === 'string' &&
        (sound.includes('/') || /\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(sound));
      if (isFileUrl) {
        this.audioEngine.loadCustomSound(sound).catch(err => {
          console.warn("Failed to pre-load sound:", sound, err);
        });
      }
    }

    this.bindEvents();

    // Global click sound listener using event delegation
    document.addEventListener('click', (e) => {
      const target = e.target;
      for (const [selector, soundType] of this.soundConfig.entries()) {
        const matched = target.closest(selector);
        if (matched) {
          if (soundType && soundType !== 'none') {
            this.audioEngine.playClick(soundType);

            // Provide haptic feedback when a control element is selected/clicked
            if (navigator.vibrate) {
              if (selector.includes('power') || selector.includes('start-stop')) {
                navigator.vibrate(30); // stronger vibration for main mechanical switches
              } else if (selector === '.details-track-item') {
                navigator.vibrate(30); // solid vibration for track selection
              } else {
                navigator.vibrate(15); // light tap for standard buttons / RPM selectors / record flipping
              }
            }
          }
          break;
        }
      }
    }, { capture: true, passive: true });

    requestAnimationFrame((t) => this.renderLoop(t));
  }

  async initAudio(url) {
    this.loadingDiv.style.display = 'flex';

    if (this.state.isPlaying) {
      this.state.stopPlayback(this.audioEngine.getCurrentTime());
      this.audioEngine.stop();
      this.svg.pauseAnimations();
    }

    this.liftNeedle();

    this.state.currentAudioTime = 0;
    this.visualRotation = 0;
    this.lp.setAttribute('transform', `rotate(0)`);

    const success = await this.audioEngine.load(url);
    if (success) {
      this.state.audioDuration = this.audioEngine.audioDuration;
      this.loadingDiv.style.display = 'none';
      this.setSpeed(this.currentRpm || 33); // init defaults or keep current
      this.svg.pauseAnimations();
    } else {
      this.loadingDiv.innerText = "Error decoding audio.";
    }
  }

  bindEvents() {
    this.btn33.addEventListener('click', () => this.setSpeed(33));
    this.btn45.addEventListener('click', () => this.setSpeed(45));

    this.btn.addEventListener('click', () => this.togglePlayback());
    this.powerSwitch.addEventListener('click', () => this.togglePower());

    // Needle events
    this.tonearm.addEventListener('click', () => this.toggleNeedle());

    // Scratching events
    this.lp.addEventListener('pointerdown', (e) => this.onLpPointerDown(e));
    this.lp.addEventListener('pointermove', (e) => this.onLpPointerMove(e));
    this.lp.addEventListener('pointerup', (e) => this.onLpPointerUp(e));
    this.lp.addEventListener('pointercancel', (e) => this.onLpPointerUp(e));

    // Pitch events
    this.pitchKnob.addEventListener('pointerdown', (e) => this.onPitchPointerDown(e));
    this.pitchKnob.addEventListener('pointermove', (e) => this.onPitchPointerMove(e));
    this.pitchKnob.addEventListener('pointerup', (e) => this.onPitchPointerUp(e));
    this.pitchKnob.addEventListener('pointercancel', (e) => this.onPitchPointerUp(e));
  }

  togglePower() {
    this.isPowerOn = !this.isPowerOn;
    if (this.isPowerOn) {
      this.powerDial.style.transform = 'rotate(45deg)';
    } else {
      this.powerDial.style.transform = 'rotate(0deg)';
      if (this.state.isPlaying) {
        this.togglePlayback();
      } else if (this.state.isScratching && this.state.wasPlayingBeforeScratch) {
        this.state.wasPlayingBeforeScratch = false;
        this.liftNeedle();
      }
      this.audioEngine.stopScratch();
    }
    this.updateLights();
  }

  updateLights(pitchY = this.currentPitchY) {
    if (this.isPowerOn) {
      // 33/45 Buttons
      if (this.currentRpm === 33) {
        this.btn33Led.setAttribute('fill', 'lch(60% 100 45)');
        this.btn45Led.setAttribute('fill', 'var(--black-0)');
      } else {
        this.btn33Led.setAttribute('fill', 'var(--black-0)');
        this.btn45Led.setAttribute('fill', 'lch(60% 100 45)');
      }

      // Pitch LED
      if (Math.abs(pitchY - 125) < 5) {
        this.pitchZeroLed.setAttribute('fill', 'lch(80% 100 135)');
      } else {
        this.pitchZeroLed.setAttribute('fill', 'var(--black-0)');
      }

      // Strobe
      this.strobeRedLight.setAttribute('fill', 'lch(60% 100 45)');
      this.strobeRedLight.setAttribute('filter', 'url(#red-glow)');
      this.strobeWhiteLight.setAttribute('opacity', '0.6');

      if (this.powerDialRedReflection) this.powerDialRedReflection.setAttribute('opacity', '1');
    } else {
      this.btn33Led.setAttribute('fill', 'var(--black-0)');
      this.btn45Led.setAttribute('fill', 'var(--black-0)');
      this.pitchZeroLed.setAttribute('fill', 'var(--black-0)');

      this.strobeRedLight.setAttribute('fill', 'lch(20% 50 45)');
      this.strobeRedLight.removeAttribute('filter');
      this.strobeWhiteLight.setAttribute('opacity', '0.1');

      if (this.powerDialRedReflection) this.powerDialRedReflection.setAttribute('opacity', '0');
    }
  }

  setSpeed(rpm) {
    this.currentRpm = rpm;
    this.state.setSpeed(rpm);
    if (rpm === 33) {
      this.btn33Cap.setAttribute('fill', 'var(--white-0)');
      this.btn45Cap.setAttribute('fill', 'var(--gray-0)');
    } else if (rpm === 45) {
      this.btn33Cap.setAttribute('fill', 'var(--gray-0)');
      this.btn45Cap.setAttribute('fill', 'var(--white-0)');
    }
    this.updateLights();

    this.audioEngine.updatePitch(this.state.effectivePlaybackRate);
    this.state.applyPitch(this.state.pitchMultiplier, this.audioEngine.getCurrentTime());
  }

  dropNeedle() {
    this.isNeedleOnRecord = true;
    this.tonearm.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.489, 0.64, 1)';
    this.tonearm.style.transform = 'rotate(22deg)';

    if (this.isPowerOn && this.state.isPlaying) {
      this.audioEngine.stop();
      setTimeout(() => {
        if (this.isNeedleOnRecord && this.isPowerOn && this.state.isPlaying) {
          this.state.startPlayback(this.audioEngine.getCurrentTime());
          this.audioEngine.play(this.state.currentAudioTime, this.state.effectivePlaybackRate, () => {
            if (this.state.isPlaying && this.state.currentAudioTime >= this.state.audioDuration - 0.1) {
              this.state.isPlaying = false;
              this.state.currentAudioTime = this.state.audioDuration;
              this.svg.pauseAnimations();
              this.liftNeedle();
            }
          });
          this.svg.unpauseAnimations();
        }
      }, 600);
    }
  }

  liftNeedle() {
    if (this.isNeedleOnRecord) {
      if (this.state.isPlaying && !this.state.isScratching) {
        this.state.syncAudioTime(this.audioEngine.getCurrentTime());
        this.state.startOffset = this.state.currentAudioTime;
      }
      this.isNeedleOnRecord = false;
    }
    this.tonearm.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
    this.tonearm.style.transform = 'rotate(-25deg)';

    this.audioEngine.stop();
    this.audioEngine.stopScratch();
  }

  toggleNeedle() {
    if (!this.audioEngine.forwardBuffer) return;
    this.audioEngine.resume();

    if (this.isNeedleOnRecord) {
      this.liftNeedle();
    } else {
      this.dropNeedle();
    }
  }

  togglePlayback() {
    if (!this.audioEngine.forwardBuffer) return; // not loaded
    this.audioEngine.resume();

    if (!this.state.isPlaying) {
      if (!this.isPowerOn) return; // Don't play if power is off

      if (this.state.currentAudioTime >= this.state.audioDuration - 0.1) {
        this.state.currentAudioTime = 0;
      }

      this.state.startPlayback(this.audioEngine.getCurrentTime());
      this.svg.unpauseAnimations();

      if (this.isNeedleOnRecord) {
        this.audioEngine.play(this.state.currentAudioTime, this.state.effectivePlaybackRate, () => {
          if (this.state.isPlaying && this.state.currentAudioTime >= this.state.audioDuration - 0.1) {
            this.state.isPlaying = false;
            this.state.currentAudioTime = this.state.audioDuration;
            this.svg.pauseAnimations();
            this.liftNeedle();
          }
        });
      }
    } else {
      this.state.stopPlayback(this.audioEngine.getCurrentTime());
      this.audioEngine.stop();
      this.svg.pauseAnimations();
    }
  }

  getAngle(e) {
    const pt = this.svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(this.svg.getScreenCTM().inverse());
    return Math.atan2(svgP.y - 310, svgP.x - 330) * (180 / Math.PI);
  }

  onLpPointerDown(e) {
    if (this.activeLpPointerId !== null) return;
    if (!this.audioEngine.forwardBuffer) return;
    this.audioEngine.resume();

    this.activeLpPointerId = e.pointerId;
    try {
      this.lp.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to set pointer capture on LP:", err);
    }
    this.lp.style.cursor = 'grabbing';

    const wasPlaying = this.state.isPlaying;
    if (wasPlaying) {
      this.state.stopPlayback(this.audioEngine.getCurrentTime());
      this.audioEngine.stop();
    }

    this.state.startScratch(this.getAngle(e), performance.now());
    this.state.wasPlayingBeforeScratch = wasPlaying;
    this.smoothedVelocity = 0;
  }

  onLpPointerMove(e) {
    if (e.pointerId !== this.activeLpPointerId) return;
    if (!this.state.isScratching) return;
    const currentAngle = this.getAngle(e);
    this.state.updateScratch(currentAngle, performance.now(), this.SECONDS_PER_DEGREE);
  }

  onLpPointerUp(e) {
    if (e.pointerId !== this.activeLpPointerId) return;
    this.activeLpPointerId = null;
    if (!this.state.isScratching) return;
    this.state.stopScratch();
    try {
      this.lp.releasePointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to release pointer capture on LP:", err);
    }
    this.lp.style.cursor = 'grab';

    this.audioEngine.stopScratch();

    if (this.state.wasPlayingBeforeScratch) {
      if (this.isPowerOn) {
        this.state.startPlayback(this.audioEngine.getCurrentTime());
        if (this.isNeedleOnRecord) {
          this.audioEngine.play(this.state.currentAudioTime, this.state.effectivePlaybackRate, () => {
            if (this.state.isPlaying && this.state.currentAudioTime >= this.state.audioDuration - 0.1) {
              this.state.isPlaying = false;
              this.state.currentAudioTime = this.state.audioDuration;
              this.svg.pauseAnimations();
              this.liftNeedle();
            }
          });
        }
      } else {
        this.state.wasPlayingBeforeScratch = false;
        this.liftNeedle();
      }
    }
  }

  onPitchPointerDown(e) {
    if (this.activePitchPointerId !== null) return;
    this.activePitchPointerId = e.pointerId;
    this.isDraggingPitch = true;
    this.pitchStartY = e.clientY;
    try {
      this.pitchKnob.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to set pointer capture on pitch knob:", err);
    }
    this.pitchKnob.style.cursor = 'grabbing';
  }

  onPitchPointerMove(e) {
    if (e.pointerId !== this.activePitchPointerId) return;
    if (!this.isDraggingPitch) return;

    const deltaY = e.clientY - this.pitchStartY;
    let newY = this.currentPitchY + deltaY;

    if (newY < 35) newY = 35;
    if (newY > 215) newY = 215;

    this.pitchKnob.setAttribute('transform', `translate(14, ${newY})`);

    // click notch
    if (Math.abs(newY - 125) < 5) {
      newY = 125;
      this.pitchKnob.setAttribute('transform', `translate(14, 125)`);
    }

    const newPitchMultiplier = 1.0 + ((newY - 125) / 90) * 0.08;
    this.state.applyPitch(newPitchMultiplier, this.audioEngine.getCurrentTime());
    this.audioEngine.updatePitch(this.state.effectivePlaybackRate);
    this.updateLights(newY);
  }

  onPitchPointerUp(e) {
    if (e.pointerId !== this.activePitchPointerId) return;
    this.activePitchPointerId = null;
    if (!this.isDraggingPitch) return;
    this.isDraggingPitch = false;

    const deltaY = e.clientY - this.pitchStartY;
    this.currentPitchY += deltaY;
    if (this.currentPitchY < 35) this.currentPitchY = 35;
    if (this.currentPitchY > 215) this.currentPitchY = 215;
    if (Math.abs(this.currentPitchY - 125) < 5) this.currentPitchY = 125;

    try {
      this.pitchKnob.releasePointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to release pointer capture on pitch knob:", err);
    }
    this.pitchKnob.style.cursor = 'grab';
    this.updateLights();
  }

  renderLoop(timestamp) {
    if (!this.state.lastRealTime) this.state.lastRealTime = timestamp;
    const dt = (timestamp - this.state.lastRealTime) / 1000;
    this.state.lastRealTime = timestamp;

    if (this.state.isScratching) {
      if (performance.now() - this.state.lastScratchTime > 50) {
        this.state.currentVelocity *= 0.8;
        if (Math.abs(this.state.currentVelocity) < 0.01) this.state.currentVelocity = 0;
      }

      // Smooth the velocity using low pass filter (Exponential Moving Average)
      const alpha = 0.35;
      this.smoothedVelocity = this.smoothedVelocity * (1 - alpha) + this.state.currentVelocity * alpha;

      this.state.currentAudioTime += this.smoothedVelocity * dt;
      if (this.state.currentAudioTime < 0) this.state.currentAudioTime = 0;
      if (this.state.currentAudioTime > this.state.audioDuration) this.state.currentAudioTime = this.state.audioDuration;

      if (this.isPowerOn && this.isNeedleOnRecord) {
        this.audioEngine.playScratch(this.smoothedVelocity, this.state.currentAudioTime);
      } else {
        this.audioEngine.stopScratch();
      }

      this.visualRotation = (this.state.currentAudioTime / this.SECONDS_PER_DEGREE) % 360;

    } else if (this.state.isPlaying) {
      if (this.isNeedleOnRecord) {
        this.state.syncAudioTime(this.audioEngine.getCurrentTime());
        this.visualRotation = (this.state.currentAudioTime / this.SECONDS_PER_DEGREE) % 360;
      } else {
        this.state.lastStartTime = this.audioEngine.getCurrentTime();
        const degreesPerSecond = this.state.effectivePlaybackRate / this.SECONDS_PER_DEGREE;
        this.visualRotation = (this.visualRotation + degreesPerSecond * dt) % 360;
      }
    }

    this.lp.setAttribute('transform', `rotate(${this.visualRotation})`);

    requestAnimationFrame((t) => this.renderLoop(t));
  }
}

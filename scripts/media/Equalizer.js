import { EQ_CONFIG } from './Constants.js';

// Cache MediaElementSourceNode per HTMLMediaElement to prevent InvalidStateError crashes (PERF-01)
const _sourceRegistry = new WeakMap();

export class Equalizer {
    constructor(audioElement) {
        this.audio = audioElement;
        this.audioCtx = null;
        this.source = null;
        this.filters = [];
        this.isEnabled = true;
        this._targetGains = EQ_CONFIG.map(() => 0);
    }

    init() {
        if (this.audioCtx) return;

        // Ensure CORS safety before attaching to Web Audio pipeline (SEC-01)
        if (this.audio && !this.audio.crossOrigin) {
            this.audio.crossOrigin = 'anonymous';
        }

        const existing = _sourceRegistry.get(this.audio);
        if (existing && existing.audioCtx.state !== 'closed') {
            this.audioCtx = existing.audioCtx;
            this.source = existing.source;
        } else {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.source = this.audioCtx.createMediaElementSource(this.audio);
            _sourceRegistry.set(this.audio, { audioCtx: this.audioCtx, source: this.source });
        }

        let lastNode = this.source;

        this.filters = [];
        EQ_CONFIG.forEach((config, index) => {
            const filter = this.audioCtx.createBiquadFilter();
            filter.type = config.type;
            filter.frequency.value = config.freq;
            if (config.type === 'peaking') {
                filter.Q.value = 1;
            }
            const initialGain = this.isEnabled ? (this._targetGains[index] ?? 0) : 0;
            filter.gain.value = initialGain;
            this.filters.push(filter);
            lastNode.connect(filter);
            lastNode = filter;
        });

        lastNode.connect(this.audioCtx.destination);
    }

    resume() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setGain(index, value) {
        const filter = this.filters[index];
        if (!filter) return;

        const num = parseFloat(value);
        if (!Number.isFinite(num)) return;
        const clamped = Math.max(-20, Math.min(20, num));
        this._targetGains[index] = clamped;

        const effectiveGain = this.isEnabled ? clamped : 0;

        // Smooth gain transitions to eliminate zipper noise and audio clicks (PERF-05)
        if (this.audioCtx && typeof filter.gain.setTargetAtTime === 'function') {
            filter.gain.setTargetAtTime(effectiveGain, this.audioCtx.currentTime, 0.015);
        }
        filter.gain.value = effectiveGain;
    }

    setEnabled(enabled) {
        this.isEnabled = Boolean(enabled);
        // Genuine bypass by smoothly zeroing filter gains when disabled (PERF-06)
        this.filters.forEach((filter, index) => {
            const target = this.isEnabled ? (this._targetGains[index] ?? 0) : 0;
            if (this.audioCtx && typeof filter.gain.setTargetAtTime === 'function') {
                filter.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.015);
            }
            filter.gain.value = target;
        });
    }

    destroy() {
        if (this.source) {
            try {
                this.source.disconnect();
            } catch {
                // Ignore if already disconnected
            }
        }
        this.filters.forEach(filter => {
            try {
                filter.disconnect();
            } catch {
                // Ignore
            }
        });
        this.filters = [];

        if (this.audioCtx && typeof this.audioCtx.close === 'function') {
            try {
                this.audioCtx.close().catch(() => {});
            } catch {
                // Ignore context closure error
            }
        }

        if (this.audio) {
            _sourceRegistry.delete(this.audio);
        }

        this.audioCtx = null;
        this.source = null;
    }
}


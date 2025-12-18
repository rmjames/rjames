import { EQ_CONFIG } from './Constants.js';

export class Equalizer {
    constructor(audioElement) {
        this.audio = audioElement;
        this.audioCtx = null;
        this.source = null;
        this.filters = [];
        this.isEnabled = true;
    }

    init() {
        if (this.audioCtx) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.source = this.audioCtx.createMediaElementSource(this.audio);

        let lastNode = this.source;

        EQ_CONFIG.forEach(config => {
            const filter = this.audioCtx.createBiquadFilter();
            filter.type = config.type;
            filter.frequency.value = config.freq;
            if (config.type === 'peaking') {
                filter.Q.value = 1;
            }
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
        if (this.filters[index]) {
            this.filters[index].gain.value = value;
        }
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        // Logic for bypass can be more complex, but for now we just handle it in UI
        // or by resetting gains to 0 if we wanted a true bypass.
    }
}

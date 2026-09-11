import { audioLibrary } from '../AudioLibrary.js';

const PREVIEW_DURATION_SEC = 52;
const FADE_DURATION_SEC = 2;

const els = {
    btn: document.querySelector('.toggle-btn'),
    trackSelect: document.getElementById('track-select'),
    filterContainer: document.querySelector('.filter-container'),
    animated: document.querySelectorAll('.headphone, .note, .notes'),
    root: document.body
};

const Utils = {
    cleanTitle: (title) => title ? title.replace(/^\d+[\s.-]*/, '').trim() : '',

    normalizeFrequency: (data, binStart, binCount, exponent = 1.0) => {
        let sum = 0;
        for (let i = binStart; i < binStart + binCount; i++) sum += data[i];
        return Math.pow((sum / binCount) / 255, exponent);
    },

    getRandomTrack: (tracks, filterTerm = '') => {
        const term = filterTerm.toLowerCase();
        let filtered = tracks;

        if (term) {
            filtered = tracks.filter(t =>
                (t.title && Utils.cleanTitle(t.title).toLowerCase().startsWith(term)) ||
                (t.artist && t.artist.toLowerCase().startsWith(term)) ||
                (t.album && t.album.toLowerCase().startsWith(term))
            );
        } else {
            const dillaTracks = tracks.filter(t => t.artist?.toLowerCase().includes('dilla'));
            if (dillaTracks.length > 0) filtered = dillaTracks;
        }

        if (filtered.length === 0) filtered = tracks;
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
};

const audioElement = new Audio();
audioElement.crossOrigin = 'anonymous';

let state = {
    isPlaying: false,
    isFirstInteraction: true,
    audioCtx: null,
    analyser: null,
    dataArray: null,
    audio: audioElement,
    source: null
};

function setState(updates) {
    state = { ...state, ...updates };
    renderUI(state);
}

function renderUI(s) {
    els.btn.classList.toggle('playing', s.isPlaying);
    els.btn.classList.toggle('pulse', s.isFirstInteraction);
    els.filterContainer.classList.toggle('playing', s.isPlaying);
    els.btn.setAttribute('aria-label', s.isPlaying ? 'Pause animation' : 'Play animation');
    els.animated.forEach(el => el.style.animationPlayState = s.isPlaying ? 'running' : 'paused');

    if (!s.isPlaying) {
        s.audio.pause();
        els.root.style.setProperty('--low', 0);
        els.root.style.setProperty('--mid', 0);
        els.root.style.setProperty('--high', 0);
    }
}

const AudioEngine = {
    init: () => {
        if (state.audioCtx) return;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.36;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const source = audioCtx.createMediaElementSource(state.audio);

        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        setState({ audioCtx, analyser, dataArray, source });
        requestAnimationFrame(updateVisuals);
    },

    handleTimeUpdate: (e) => {
        const { currentTime } = e.target;
        if (currentTime >= PREVIEW_DURATION_SEC) {
            AudioEngine.stop(true);
            return;
        }

        const fadeStart = PREVIEW_DURATION_SEC - FADE_DURATION_SEC;
        if (currentTime > fadeStart) {
            const newVolume = Math.max(0, Math.min(1, (PREVIEW_DURATION_SEC - currentTime) / FADE_DURATION_SEC));
            state.audio.volume = newVolume;
        } else if (state.audio.volume !== 1) {
            state.audio.volume = 1;
        }
    },

    stop: (fullReset = false) => {
        state.audio.pause();
        state.audio.currentTime = 0;
        if (fullReset) els.trackSelect.value = '';
        setState({ isPlaying: false, isFirstInteraction: fullReset });
    },

    play: async (track) => {
        AudioEngine.init();

        if (state.audioCtx.state === 'suspended') {
            await state.audioCtx.resume();
        }

        const targetSrc = new URL(track.src, window.location.href).href;
        if (state.audio.src !== targetSrc) {
            state.audio.src = track.src;
            state.audio.load();
        } else {
            state.audio.currentTime = 0;
        }

        state.audio.volume = 1;
        state.audio.muted = false;
        try {
            await state.audio.play();
            setState({ isPlaying: true });
        } catch {
            AudioEngine.stop();
        }
    }
};

function updateVisuals() {
    if (!state.isPlaying) {
        els.root.style.setProperty('--low', 0);
        els.root.style.setProperty('--mid', 0);
        els.root.style.setProperty('--high', 0);
    } else {
        state.analyser.getByteFrequencyData(state.dataArray);

        const low = Utils.normalizeFrequency(state.dataArray, 0, 2, 1.8);
        const mid = Utils.normalizeFrequency(state.dataArray, 4, 11, 2.0);
        const high = Utils.normalizeFrequency(state.dataArray, 40, 88, 1.2);

        els.root.style.setProperty('--low', low.toFixed(3));
        els.root.style.setProperty('--mid', mid.toFixed(3));
        els.root.style.setProperty('--high', high.toFixed(3));
    }
    requestAnimationFrame(updateVisuals);
}

// --- Initialization ---
state.audio.ontimeupdate = AudioEngine.handleTimeUpdate;
state.audio.onended = () => AudioEngine.stop(true);
state.audio.volume = 1;

const populateDropdown = () => {
    const grouped = audioLibrary.tracks.reduce((acc, track) => {
        const artist = track.artist && track.artist.toLowerCase() !== 'unknown artist' ? track.artist : 'Other';
        const title = Utils.cleanTitle(track.title) || 'Unknown Title';
        acc[artist] = acc[artist] || [];
        if (!acc[artist].includes(title)) acc[artist].push(title);
        return acc;
    }, {});

    Object.keys(grouped).sort().forEach(artist => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = artist;
        grouped[artist].sort().forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            optgroup.appendChild(option);
        });
        els.trackSelect.appendChild(optgroup);
    });
};

populateDropdown();

els.trackSelect.addEventListener('change', () => {
    const selection = els.trackSelect.value;
    AudioEngine.stop(true);
    els.trackSelect.value = selection;
    AudioEngine.play(Utils.getRandomTrack(audioLibrary.tracks, selection));
});

els.btn.addEventListener('click', () => {
    if (state.isFirstInteraction) setState({ isFirstInteraction: false });
    state.isPlaying ? AudioEngine.stop() : AudioEngine.play(Utils.getRandomTrack(audioLibrary.tracks, els.trackSelect.value));
});

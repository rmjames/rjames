import { SVG_PATHS } from './Constants.js';
import { ColorExtractor } from './ColorExtractor.js';

export const UI = {
    updatePlayIcon(button, isPaused) {
        const path = button.querySelector('svg path');
        if (path) {
            path.setAttribute('d', isPaused ? SVG_PATHS.PLAY : SVG_PATHS.PAUSE);
        }
    },

    updateTrackInfo(elements, track) {
        const { title, artist, artBtn } = elements;
        if (title) title.textContent = track.title;
        if (artist) artist.textContent = track.artist;

        if (artBtn) {
            if (track.albumArt) {
                artBtn.classList.add('has-art');
                artBtn.innerHTML = `<img src="${track.albumArt}" alt="${track.title}">`;
            } else {
                artBtn.classList.remove('has-art');
                artBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M360-400h400L622-580l-92 120-62-80-108 140Zm-40 160q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
                    </svg>
                `;
            }
        }
    },

    updateSliderVisuals(input) {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const val = parseFloat(input.value);
        const pct = ((val - min) / (max - min)) * 100;

        const wrapper = input.parentElement;
        const fill = wrapper.querySelector('.eq-slider__fill');
        const thumb = wrapper.querySelector('.eq-slider__thumb');

        if (!fill || !thumb) return;

        const topPos = 100 - pct;
        thumb.style.top = `${topPos}%`;

        const center = 50;
        if (pct >= center) {
            const height = pct - center;
            fill.style.top = `${topPos}%`;
            fill.style.height = `${height}%`;
        } else {
            const height = center - pct;
            fill.style.top = `50%`;
            fill.style.height = `${height}%`;
        }
    },

    // Popover-helper
    showPopover(popoverEl, anchorBtn, track) {
        if (!popoverEl || !track) return;

        const artist = track.artist || 'Unknown Artist';
        const album = track.album || track.title || 'Unknown Album';

        popoverEl.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 0.125rem;">${artist}</div>
            <div style="font-size: 0.65rem; color: oklch(from #ccc l c h);">${album}</div>
            <div style="font-size: 0.65rem; color: oklch(from #ccc l c h);">${track.title}</div>
        `;

        // We assume CSS Anchor Positioning or a fallback is handled via anchor-name
        anchorBtn.style.anchorName = '--active-preset';

        try {
            popoverEl.showPopover();
        } catch (e) {
            console.warn('Popover API not supported fully', e);
        }
    },

    hidePopover(popoverEl, anchorBtn) {
        if (popoverEl) {
            try {
                popoverEl.hidePopover();
            } catch (e) { }
        }
        if (anchorBtn) {
            anchorBtn.style.removeProperty('anchor-name');
        }
    },

    updateBackgroundArt(element, track) {
        if (!element || !track) return;
        const bgValue = track.albumArt ? `url("${track.albumArt}")` : 'none';
        element.style.setProperty('--bg-image', bgValue);
    },

    async applyAccentColor(element, track, cssVarName) {
        if (!element || !track || !cssVarName) return;
        const color = await ColorExtractor.getAccentColor(track.albumArt);
        element.style.setProperty(cssVarName, color);
    }
};

import { SVG_PATHS } from './Constants.js';
import { ColorExtractor } from './ColorExtractor.js';

export const UI = {
    updatePlayIcon(button, isPaused) {
        const path = button.querySelector('svg path');
        if (path) {
            path.setAttribute('d', isPaused ? SVG_PATHS.PLAY : SVG_PATHS.PAUSE);
        }
    },

    // Caching for ResizeObserver (PERF-30)
    _parentWidths: new WeakMap(),
    _resizeObserver: null,

    _initResizeObserver() {
        if (this._resizeObserver) return;
        this._resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                this._parentWidths.set(entry.target, entry.contentRect.width);
                // If dimensions change, re-check marquee status
                this.updateMarquee(entry.target);
            }
        });
    },

    updateMarquee(el) {
        if (!el) return;
        this._initResizeObserver();
        this._resizeObserver.observe(el);

        // Defer reads and writes to avoid layout thrashing during track changes
        requestAnimationFrame(() => {
            // DOM READ phase
            // Use cached width if available to avoid clientWidth read
            const parentWidth = this._parentWidths.get(el) || el.clientWidth;
            const textWidth = el.scrollWidth;

            // DOM WRITE phase (deferred to next frame to prevent forced synchronous layout)
            requestAnimationFrame(() => {
                if (textWidth > parentWidth) {
                    el.classList.add('is-marquee');
                    el.style.setProperty('--marquee-width', `${parentWidth}px`);
                } else {
                    el.classList.remove('is-marquee');
                    el.style.setProperty('--marquee-width', '0px');
                }
            });
        });
    },

    updateTrackInfo(elements, track) {
        const { title, artist, artBtn } = elements;

        const updateText = (el, text) => {
            if (!el) return;
            let span = el.querySelector('span');
            if (!span) {
                // PERF: Create element directly to avoid innerHTML overhead
                span = document.createElement('span');
                el.replaceChildren(span);
            }
            span.textContent = text;
            this.updateMarquee(el);
        };

        updateText(title, track.title);
        updateText(artist, track.artist);

        if (artBtn) {
            if (track.albumArt) {
                artBtn.classList.add('has-art');
                // PERF: Reuse existing img element instead of creating/destroying on every track change
                let img = artBtn.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    artBtn.replaceChildren(img);
                }
                img.src = track.albumArt;
                img.alt = track.title;
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

    // Popover helper
    showPopover(popoverEl, anchorBtn, track) {
        if (!popoverEl || !track) return;

        const artist = track.artist || 'Unknown Artist';
        const album = track.album || track.title || 'Unknown Album';

        popoverEl.replaceChildren();

        const artistDiv = document.createElement('div');
        artistDiv.style.fontWeight = 'bold';
        artistDiv.style.marginBottom = '0.125rem';
        artistDiv.textContent = artist;

        const albumDiv = document.createElement('div');
        albumDiv.style.fontSize = '0.65rem';
        albumDiv.style.color = 'oklch(from #ccc l c h)';
        albumDiv.textContent = album;

        const titleDiv = document.createElement('div');
        titleDiv.style.fontSize = '0.65rem';
        titleDiv.style.color = 'oklch(from #ccc l c h)';
        titleDiv.textContent = track.title;

        popoverEl.append(artistDiv, albumDiv, titleDiv);

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
            } catch (e) {
                console.debug('Failed to hide popover', e);
            }
        }
        if (anchorBtn) {
            anchorBtn.style.removeProperty('anchor-name');
        }
    },

    updateBackgroundArt(element, track) {
        if (!element || !track) return;
        // SEC-7: Sanitize URL to prevent CSS injection
        const rawArtUrl = track.albumArt || '';
        if (rawArtUrl) {
            // Remove characters that could break out of url("") and then encode
            const sanitizedUrl = encodeURI(rawArtUrl.replace(/["'()]/g, ''));
            element.style.setProperty('--bg-image', `url("${sanitizedUrl}")`);
        } else {
            element.style.setProperty('--bg-image', 'none');
        }
    },

    async applyAccentColor(element, track, cssVarName) {
        if (!element || !track || !cssVarName) return;
        const color = await ColorExtractor.getAccentColor(track.albumArt);
        element.style.setProperty(cssVarName, color);
    },

    setupLongPress(button, { onShortPress, onLongPress, delay = 500 }) {
        if (!button) return;

        let longPressTimer;
        let longPressTriggered = false;

        const startPress = (e) => {
            if (e.type === 'touchstart') {
                // We might not want to prevent default globally, but for a long press button it might be needed.
                // However, doing so can break scrolling if the button is inside a scrollable container.
                // We will leave preventDefault up to the caller or allow passive listeners.
            }
            longPressTriggered = false;
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                if (onLongPress) onLongPress(e);
                longPressTimer = null;
            }, delay);
        };

        const cancelPress = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        const handleShortPress = (e) => {
            cancelPress();
            if (!longPressTriggered && onShortPress) {
                onShortPress(e);
            }
        };

        // Mouse events
        button.addEventListener('mousedown', startPress);
        button.addEventListener('mouseleave', cancelPress);
        button.addEventListener('mouseup', handleShortPress);

        // Touch events
        button.addEventListener('touchstart', startPress, { passive: true });
        button.addEventListener('touchmove', cancelPress, { passive: true }); // Cancel on scroll
        button.addEventListener('touchend', handleShortPress);

        // Disable context menu on long press for mobile
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Cleanup function
        return () => {
            button.removeEventListener('mousedown', startPress);
            button.removeEventListener('mouseleave', cancelPress);
            button.removeEventListener('mouseup', handleShortPress);
            button.removeEventListener('touchstart', startPress);
            button.removeEventListener('touchmove', cancelPress);
            button.removeEventListener('touchend', handleShortPress);
            button.removeEventListener('contextmenu', e => e.preventDefault());
        };
    }
};

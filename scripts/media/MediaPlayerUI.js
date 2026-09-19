import { SVG_PATHS } from './Constants.js';
import { ColorExtractor } from '../utils/ColorExtractor.js';
import { MEDIA_BASE_URL } from '../AudioLibrary.js';

export const UI = {
    updatePlayIcon(button, isPaused) {
        const path = button.querySelector('svg path');
        if (path) {
            path.setAttribute('d', isPaused ? SVG_PATHS.PLAY : SVG_PATHS.PAUSE);
        }
    },

    // Caching and batching for Marquee and ResizeObserver (PERF-30, PERF-42)
    _parentWidths: new WeakMap(),
    _resizeObserver: null,
    _observedElements: new WeakSet(),
    _marqueeElements: new Set(),
    _isMarqueeBatchScheduled: false,

    _initResizeObserver() {
        if (this._resizeObserver) return;
        if (typeof ResizeObserver === 'undefined') return;
        this._resizeObserver = new ResizeObserver(entries => {
            // PERF-42: Buffer entries directly into the batched queue using the precomputed
            // contentRect dimensions without re-observing targets or triggering nested rAF loops.
            for (const entry of entries) {
                this._parentWidths.set(entry.target, entry.contentRect.width);
                this._marqueeElements.add(entry.target);
            }
            this._scheduleMarqueeBatch();
        });
    },

    _scheduleMarqueeBatch() {
        if (this._isMarqueeBatchScheduled) return;
        this._isMarqueeBatchScheduled = true;
        requestAnimationFrame(() => {
            this._isMarqueeBatchScheduled = false;
            this._processMarqueeBatch();
        });
    },

    _processMarqueeBatch() {
        if (this._marqueeElements.size === 0) return;
        const elements = Array.from(this._marqueeElements);
        this._marqueeElements.clear();

        // Phase 1 (DOM Reads): Batch all layout reads together to eliminate forced synchronous reflows
        const updates = elements.map(el => {
            const parentWidth = this._parentWidths.get(el) || el.clientWidth;
            const textWidth = el.scrollWidth;
            return {
                el,
                isMarquee: textWidth > parentWidth,
                parentWidth
            };
        });

        // Phase 2 (DOM Writes): Apply class and CSS variable mutations in the same frame without double-rAF delay
        for (const { el, isMarquee, parentWidth } of updates) {
            el.classList.toggle('is-marquee', isMarquee);
            el.style.setProperty('--marquee-width', isMarquee ? `${parentWidth}px` : '0px');
        }
    },

    updateMarquee(el) {
        if (!el) return;
        this._initResizeObserver();
        if (this._resizeObserver && !this._observedElements.has(el)) {
            this._observedElements.add(el);
            this._resizeObserver.observe(el);
        }

        this._marqueeElements.add(el);
        this._scheduleMarqueeBatch();
    },

    unobserveMarquee(el) {
        if (!el) return;
        if (this._resizeObserver) {
            try {
                this._resizeObserver.unobserve(el);
            } catch {
                // Ignore if not observed
            }
        }
        this._marqueeElements.delete(el);
        this._parentWidths.delete(el);
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
                    img.crossOrigin = 'anonymous';
                    img.decoding = 'async';
                    img.width = 48;
                    img.height = 48;
                    artBtn.replaceChildren(img);
                }
                img.crossOrigin = 'anonymous';
                img.decoding = 'async';
                img.src = track.albumArt;
                img.alt = track.title || 'Track Art';
            } else {
                artBtn.classList.remove('has-art');
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('height', '24px');
                svg.setAttribute('viewBox', '0 -960 960 960');
                svg.setAttribute('width', '24px');
                svg.setAttribute('fill', '#e3e3e3');
                svg.setAttribute('aria-hidden', 'true');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M360-400h400L622-580l-92 120-62-80-108 140Zm-40 160q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z');
                svg.appendChild(path);
                artBtn.replaceChildren(svg);
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
        artistDiv.style.marginBottom = '.125rem';
        artistDiv.textContent = artist;

        const albumDiv = document.createElement('div');
        albumDiv.style.fontSize = '.65rem';
        albumDiv.style.color = 'oklch(from #ccc l c h)';
        albumDiv.textContent = album;

        const titleDiv = document.createElement('div');
        titleDiv.style.fontSize = '.65rem';
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
        // SEC-01: Sanitize URL to prevent CSS injection & data exfiltration
        const rawArtUrl = track.albumArt || '';
        if (rawArtUrl && typeof rawArtUrl === 'string') {
            const cleanUrl = rawArtUrl.replace(/["'()]/g, '').trim();
            if (!cleanUrl) {
                element.style.setProperty('--bg-image', 'none');
                return;
            }

            // Reject control characters, newlines, tabs, null bytes, backslashes, and unescaped delimiters
            if (/[\r\n\t\0\\<>;]/.test(cleanUrl)) {
                element.style.setProperty('--bg-image', 'none');
                return;
            }

            // Security check: only allow relative paths, trusted media CDN, or safe HTTP/HTTPS URLs
            const isAllowedCdn = typeof MEDIA_BASE_URL === 'string' && MEDIA_BASE_URL && cleanUrl.startsWith(MEDIA_BASE_URL);
            const isRelativePath = !/^(?:[a-z]+:|\/\/)/i.test(cleanUrl);
            const isHttpUrl = /^https?:\/\//i.test(cleanUrl);

            // Explicitly reject dangerous schemes
            if (/^(?:javascript|data|blob|vbscript):/i.test(cleanUrl)) {
                element.style.setProperty('--bg-image', 'none');
                return;
            }

            if (!isAllowedCdn && !isRelativePath && !isHttpUrl) {
                element.style.setProperty('--bg-image', 'none');
                return;
            }

            // Prevent double-encoding of already-encoded URL sequences (e.g. %20 -> %2520)
            let decoded = cleanUrl;
            try {
                decoded = decodeURI(cleanUrl);
            } catch {
                // Fallback to cleanUrl if decodeURI fails
            }
            const sanitizedUrl = encodeURI(decoded);
            element.style.setProperty('--bg-image', `url("${sanitizedUrl}")`);
        } else {
            element.style.setProperty('--bg-image', 'none');
        }
    },

    async applyAccentColor(element, track, cssVarName) {
        if (!element || !track || !cssVarName) return;
        // SEC-02: Enforce valid CSS custom property identifier format
        if (typeof cssVarName !== 'string' || !/^--[a-zA-Z0-9_-]+$/.test(cssVarName)) return;
        const color = await ColorExtractor.getAccentColor(track.albumArt);
        element.style.setProperty(cssVarName, color);
    },

    setupLongPress(target, { onShortPress, onLongPress, delay = 500, moveThreshold = 10 } = {}) {
        if (!target) return () => {};

        let elements = [];
        if (typeof target === 'string') {
            try {
                elements = Array.from(document.querySelectorAll(target));
            } catch {
                return () => {};
            }
        } else if (target instanceof Element) {
            elements = [target];
        } else if (target instanceof NodeList || Array.isArray(target) || (typeof target === 'object' && target !== null && Symbol.iterator in target)) {
            elements = Array.from(target).filter(el => el instanceof Element);
        }

        if (elements.length === 0) return () => {};

        const cleanups = elements.map(button => {
            let longPressTimer = null;
            let longPressTriggered = false;
            let suppressClick = false;
            let startX = 0;
            let startY = 0;
            let isPressed = false;
            let lastPointerDownTime = 0;
            let activePointerId = null;

            const removeActivePointerListeners = () => {
                button.removeEventListener('pointermove', handlePointerMove);
                button.removeEventListener('pointerup', handlePointerUp);
                button.removeEventListener('pointercancel', handlePointerUp);
                button.removeEventListener('mouseup', handlePointerUp);
            };

            const cancelPress = () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                if (isPressed) {
                    isPressed = false;
                    removeActivePointerListeners();
                    if (activePointerId !== null && button.releasePointerCapture) {
                        try {
                            if (button.hasPointerCapture && button.hasPointerCapture(activePointerId)) {
                                button.releasePointerCapture(activePointerId);
                            }
                        } catch (err) {
                            void err;
                        }
                    }
                    activePointerId = null;
                }
            };

            const startPress = (clientX, clientY, e) => {
                longPressTriggered = false;
                suppressClick = false;
                isPressed = true;
                startX = clientX || 0;
                startY = clientY || 0;

                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }

                longPressTimer = setTimeout(() => {
                    longPressTriggered = true;
                    suppressClick = true;
                    if (onLongPress) onLongPress(e, button);
                    longPressTimer = null;
                }, delay);
            };

            const handlePointerMove = (e) => {
                if (!isPressed) return;
                const dx = Math.abs(e.clientX - startX);
                const dy = Math.abs(e.clientY - startY);
                // PERF-04: Fast Manhattan check before computing hypotenuse
                if (dx > moveThreshold || dy > moveThreshold || Math.hypot(dx, dy) > moveThreshold) {
                    cancelPress();
                }
            };

            const handlePointerUp = () => {
                cancelPress();
            };

            const addActivePointerListeners = () => {
                button.addEventListener('pointermove', handlePointerMove, { passive: true });
                button.addEventListener('pointerup', handlePointerUp, { passive: true });
                button.addEventListener('pointercancel', handlePointerUp, { passive: true });
                button.addEventListener('mouseup', handlePointerUp, { passive: true });
            };

            const handlePointerDown = (e) => {
                // Only accept primary button
                if (e.button !== undefined && e.button !== 0) return;
                lastPointerDownTime = Date.now();
                if (e.pointerId !== undefined) {
                    activePointerId = e.pointerId;
                    if (button.setPointerCapture) {
                        try {
                            button.setPointerCapture(e.pointerId);
                        } catch (err) {
                            void err;
                        }
                    }
                }
                addActivePointerListeners();
                startPress(e.clientX, e.clientY, e);
            };

            const handleMouseDown = (e) => {
                if (e.button !== undefined && e.button !== 0) return;
                // Suppress synthetic/duplicate mouse events triggered following pointerdown
                if (isPressed || suppressClick || longPressTriggered || (lastPointerDownTime && Date.now() - lastPointerDownTime < 1500)) {
                    return;
                }
                addActivePointerListeners();
                startPress(e.clientX, e.clientY, e);
            };

            const handleClick = (e) => {
                if (suppressClick || longPressTriggered) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    suppressClick = false;
                    longPressTriggered = false;
                    lastPointerDownTime = 0;
                    return;
                }

                if (onShortPress) {
                    onShortPress(e, button);
                }
            };

            // Keyboard accessibility (WCAG 2.0 Compliance)
            let isKeyDown = false;
            const handleKeyDown = (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                if (e.repeat) return; // Prevent key repeat oscillation
                isKeyDown = true;
                startPress(0, 0, e);
            };

            const handleKeyUp = (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                if (!isKeyDown) return;
                isKeyDown = false;
                cancelPress();
            };

            const handleContextMenu = (e) => {
                e.preventDefault();
            };

            // Optimize touch behavior and prevent callout menus
            button.style.touchAction = 'manipulation';
            button.style.webkitUserSelect = 'none';
            button.style.userSelect = 'none';

            button.addEventListener('pointerdown', handlePointerDown, { passive: true });
            button.addEventListener('mousedown', handleMouseDown);
            button.addEventListener('click', handleClick);
            button.addEventListener('keydown', handleKeyDown);
            button.addEventListener('keyup', handleKeyUp);
            button.addEventListener('contextmenu', handleContextMenu);

            // Cleanup function
            return () => {
                cancelPress();
                removeActivePointerListeners();
                button.removeEventListener('pointerdown', handlePointerDown);
                button.removeEventListener('mousedown', handleMouseDown);
                button.removeEventListener('click', handleClick);
                button.removeEventListener('keydown', handleKeyDown);
                button.removeEventListener('keyup', handleKeyUp);
                button.removeEventListener('contextmenu', handleContextMenu);
            };
        });

        return () => {
            cleanups.forEach(cleanup => cleanup());
        };
    }
};

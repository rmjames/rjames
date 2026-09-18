/**
 * LongPress.js - Universal, drop-in long-press interaction library.
 *
 * Works on any element or component across desktop (mouse), mobile (touch),
 * and keyboard (Space/Enter).
 *
 * Usage 1: Programmatic
 *   import { attachLongPress } from './utils/LongPress.js';
 *   const unbind = attachLongPress(myButton, {
 *     delay: 500,
 *     onLongPress: (e) => console.log('Long press!'),
 *     onShortPress: (e) => console.log('Short press!')
 *   });
 *
 * Usage 2: Custom DOM Events
 *   attachLongPress(myButton);
 *   myButton.addEventListener('longpress', (e) => console.log('Long press!'));
 *   myButton.addEventListener('shortpress', (e) => console.log('Short press!'));
 *
 * Usage 3: Declarative HTML attribute
 *   <button data-long-press data-delay="500">Press and hold</button>
 *   myButton.addEventListener('longpress', (e) => ...);
 */

export const DEFAULT_LONG_PRESS_DELAY = 500;
export const DEFAULT_MOVE_THRESHOLD = 10; // px tolerance for touchscreen jitter

/**
 * Attaches long-press and short-press handling to a single DOM element.
 *
 * @param {HTMLElement} element - Target DOM element
 * @param {Object} [options]
 * @param {Function} [options.onLongPress] - Callback executed on long press
 * @param {Function} [options.onShortPress] - Callback executed on tap/short click
 * @param {number} [options.delay=500] - Duration in ms before triggering long press
 * @param {number} [options.moveThreshold=10] - Movement tolerance before canceling
 * @param {boolean} [options.dispatchEvents=true] - Whether to dispatch 'longpress' and 'shortpress' CustomEvents
 * @returns {Function} Cleanup function to detach all listeners
 */
export function attachLongPress(element, options = {}) {
    if (!element || !(element instanceof Element)) {
        return () => {};
    }

    const {
        onLongPress = null,
        onShortPress = null,
        delay = DEFAULT_LONG_PRESS_DELAY,
        moveThreshold = DEFAULT_MOVE_THRESHOLD,
        dispatchEvents = true
    } = options;

    let longPressTimer = null;
    let longPressTriggered = false;
    let suppressClick = false;
    let startX = 0;
    let startY = 0;
    let isPressed = false;
    let lastPointerDownTime = 0;

    const startPress = (clientX, clientY, originalEvent) => {
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

            if (onLongPress) {
                onLongPress(originalEvent, element);
            }

            if (dispatchEvents) {
                element.dispatchEvent(new CustomEvent('longpress', {
                    bubbles: true,
                    cancelable: true,
                    detail: { originalEvent, element, delay }
                }));
            }

            longPressTimer = null;
        }, delay);
    };

    const cancelPress = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        isPressed = false;
    };

    const handlePointerDown = (e) => {
        // Accept only primary button (left mouse, touch point, or pen contact)
        if (e.button !== undefined && e.button !== 0) return;
        lastPointerDownTime = Date.now();
        startPress(e.clientX, e.clientY, e);
    };

    const handleMouseDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        // Suppress duplicate or synthetic mousedown emitted immediately following pointerdown
        if (Date.now() - lastPointerDownTime < 100) return;
        startPress(e.clientX, e.clientY, e);
    };

    const handlePointerMove = (e) => {
        if (!isPressed) return;
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > moveThreshold) {
            cancelPress();
        }
    };

    const handlePointerUp = () => {
        cancelPress();
    };

    const handleClick = (e) => {
        if (suppressClick || longPressTriggered) {
            e.preventDefault();
            e.stopImmediatePropagation();
            suppressClick = false;
            longPressTriggered = false;
            return;
        }

        if (onShortPress) {
            onShortPress(e, element);
        }

        if (dispatchEvents) {
            element.dispatchEvent(new CustomEvent('shortpress', {
                bubbles: true,
                cancelable: true,
                detail: { originalEvent: e, element }
            }));
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
    element.style.touchAction = 'manipulation';
    element.style.webkitUserSelect = 'none';
    element.style.userSelect = 'none';

    // Register Pointer & Fallback Events
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handlePointerUp);
    element.addEventListener('mouseleave', handlePointerUp);
    element.addEventListener('click', handleClick);
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);
    element.addEventListener('contextmenu', handleContextMenu);

    return () => {
        cancelPress();
        element.removeEventListener('pointerdown', handlePointerDown);
        element.removeEventListener('pointermove', handlePointerMove);
        element.removeEventListener('pointerup', handlePointerUp);
        element.removeEventListener('pointercancel', handlePointerUp);
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handlePointerUp);
        element.removeEventListener('mouseleave', handlePointerUp);
        element.removeEventListener('click', handleClick);
        element.removeEventListener('keydown', handleKeyDown);
        element.removeEventListener('keyup', handleKeyUp);
        element.removeEventListener('contextmenu', handleContextMenu);
    };
}

/**
 * Drop-in helper that accepts an Element, selector string, NodeList, or Array of elements.
 *
 * @param {string|Element|NodeList|Element[]} target
 * @param {Object} [options]
 * @returns {Function} Cleanup function to unbind all attached elements
 */
export function setupLongPress(target, options = {}) {
    if (!target) return () => {};

    if (typeof target === 'string') {
        const elements = document.querySelectorAll(target);
        const cleanups = Array.from(elements).map(el => attachLongPress(el, options));
        return () => cleanups.forEach(fn => fn());
    }

    if (target instanceof NodeList || Array.isArray(target)) {
        const cleanups = Array.from(target).map(el => attachLongPress(el, options));
        return () => cleanups.forEach(fn => fn());
    }

    return attachLongPress(target, options);
}

/**
 * Scans root and binds elements with `data-long-press` attribute.
 *
 * @param {ParentNode} [root=document]
 * @returns {Function} Cleanup function
 */
export function initLongPressAttributes(root = typeof document !== 'undefined' ? document : null) {
    if (!root) return () => {};

    const elements = root.querySelectorAll('[data-long-press]');
    const cleanups = Array.from(elements).map(el => {
        const delayAttr = el.getAttribute('data-delay');
        const parsedDelay = delayAttr ? parseInt(delayAttr, 10) : DEFAULT_LONG_PRESS_DELAY;
        return attachLongPress(el, { delay: isNaN(parsedDelay) ? DEFAULT_LONG_PRESS_DELAY : parsedDelay });
    });

    return () => cleanups.forEach(fn => fn());
}

// Auto-initialize declarative attributes on DOM ready when in a browser
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initLongPressAttributes());
    } else {
        initLongPressAttributes();
    }
}

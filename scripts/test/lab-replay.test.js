import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetAnimation } from '../utils/resetAnimation.js';

describe('resetAnimation utility & Lab Replay Buttons', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Stub requestAnimationFrame
        vi.stubGlobal('requestAnimationFrame', (cb) => {
            return setTimeout(cb, 16);
        });
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('should reset animation by clearing and restoring animation property via rAF', () => {
        document.body.innerHTML = `
            <div class="box" style="animation: rotateIn 1s ease;"></div>
            <div class="box" style="animation: rotateIn 1s ease;"></div>
        `;

        const elements = document.querySelectorAll('.box');
        expect(elements[0].style.animation).toBe('rotateIn 1s ease');

        resetAnimation('.box');

        expect(elements[0].style.animation).toBe('none');
        expect(elements[1].style.animation).toBe('none');

        // Advance timers for double rAF
        vi.advanceTimersByTime(32);

        expect(elements[0].style.animation).toBe('');
        expect(elements[1].style.animation).toBe('');
    });

    it('should handle Element instance directly', () => {
        document.body.innerHTML = `<div id="target" style="animation: bounce 1s;"></div>`;
        const el = document.getElementById('target');

        resetAnimation(el);
        expect(el.style.animation).toBe('none');

        vi.advanceTimersByTime(32);
        expect(el.style.animation).toBe('');
    });

    it('should safely return if element is not found', () => {
        expect(() => resetAnimation('.non-existent')).not.toThrow();
    });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    attachLongPress,
    setupLongPress,
    initLongPressAttributes
} from '../../../scripts/utils/LongPress.js';

describe('LongPress shared library', () => {
    let button;
    let onShortPress;
    let onLongPress;

    beforeEach(() => {
        vi.useFakeTimers();
        button = document.createElement('button');
        document.body.appendChild(button);
        onShortPress = vi.fn();
        onLongPress = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        button.remove();
        document.body.innerHTML = '';
    });

    describe('attachLongPress programmatic usage', () => {
        it('should trigger onShortPress on normal pointer click', () => {
            attachLongPress(button, { onShortPress, onLongPress, delay: 500 });

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(100);
            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click'));

            expect(onShortPress).toHaveBeenCalledTimes(1);
            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('should trigger onLongPress when held and suppress subsequent short press', () => {
            attachLongPress(button, { onShortPress, onLongPress, delay: 500 });

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledTimes(1);

            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click', { cancelable: true }));

            expect(onShortPress).not.toHaveBeenCalled();
        });

        it('should dispatch longpress and shortpress CustomEvents by default', () => {
            const longPressEventSpy = vi.fn();
            const shortPressEventSpy = vi.fn();

            button.addEventListener('longpress', longPressEventSpy);
            button.addEventListener('shortpress', shortPressEventSpy);

            attachLongPress(button, { delay: 500 });

            // Trigger long press
            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(500);
            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click', { cancelable: true }));

            expect(longPressEventSpy).toHaveBeenCalledTimes(1);
            expect(shortPressEventSpy).not.toHaveBeenCalled();

            // Reset and trigger short press
            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(50);
            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click'));

            expect(shortPressEventSpy).toHaveBeenCalledTimes(1);
        });

        it('should cancel on movement beyond threshold and keep timer on micro-movements', () => {
            attachLongPress(button, { onShortPress, onLongPress, delay: 500, moveThreshold: 10 });

            // Micro-movement (within 10px threshold)
            const down = new Event('pointerdown');
            down.clientX = 10;
            down.clientY = 10;
            button.dispatchEvent(down);

            const microMove = new Event('pointermove');
            microMove.clientX = 13;
            microMove.clientY = 14;
            button.dispatchEvent(microMove);

            vi.advanceTimersByTime(500);
            expect(onLongPress).toHaveBeenCalledTimes(1);

            onLongPress.mockClear();

            // Large movement (> 10px threshold)
            button.dispatchEvent(down);

            const largeMove = new Event('pointermove');
            largeMove.clientX = 35;
            largeMove.clientY = 40;
            button.dispatchEvent(largeMove);

            vi.advanceTimersByTime(500);
            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('should support keyboard accessibility via Enter and Space', () => {
            attachLongPress(button, { onShortPress, onLongPress, delay: 500 });

            // Short press with Enter
            button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            vi.advanceTimersByTime(50);
            button.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
            button.dispatchEvent(new MouseEvent('click'));

            expect(onShortPress).toHaveBeenCalledTimes(1);
            expect(onLongPress).not.toHaveBeenCalled();

            // Long press with Space
            button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            vi.advanceTimersByTime(500);

            expect(onLongPress).toHaveBeenCalledTimes(1);

            button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
            button.dispatchEvent(new MouseEvent('click', { cancelable: true }));

            expect(onShortPress).toHaveBeenCalledTimes(1); // not called again
        });

        it('should properly clean up all event listeners when calling returned unbind function', () => {
            const cleanup = attachLongPress(button, { onShortPress, onLongPress, delay: 500 });
            cleanup();

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(600);
            button.dispatchEvent(new Event('pointerup'));
            button.dispatchEvent(new MouseEvent('click'));

            expect(onLongPress).not.toHaveBeenCalled();
            expect(onShortPress).not.toHaveBeenCalled();
        });
    });

    describe('setupLongPress selector & collection support', () => {
        it('should bind elements using a CSS selector string', () => {
            button.classList.add('pressable');
            const handler = vi.fn();

            const cleanup = setupLongPress('.pressable', { onLongPress: handler, delay: 300 });

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(300);

            expect(handler).toHaveBeenCalledTimes(1);
            cleanup();
        });

        it('should bind an array or NodeList of elements', () => {
            const btn2 = document.createElement('button');
            document.body.appendChild(btn2);

            const handler = vi.fn();
            const cleanup = setupLongPress([button, btn2], { onLongPress: handler, delay: 300 });

            btn2.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(300);

            expect(handler).toHaveBeenCalledTimes(1);
            cleanup();
        });
    });

    describe('declarative initLongPressAttributes', () => {
        it('should auto-bind elements with data-long-press and data-delay', () => {
            button.setAttribute('data-long-press', '');
            button.setAttribute('data-delay', '250');

            const longPressSpy = vi.fn();
            button.addEventListener('longpress', longPressSpy);

            const cleanup = initLongPressAttributes(document);

            button.dispatchEvent(new Event('pointerdown'));
            vi.advanceTimersByTime(250);

            expect(longPressSpy).toHaveBeenCalledTimes(1);
            cleanup();
        });
    });
});

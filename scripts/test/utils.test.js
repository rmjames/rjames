import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetAnimation, bindResetButton } from '../utils/resetAnimation.js';
import { splitText } from '../utils/splitText.js';
import { initLabNavigation } from '../utils/labNavigation.js';

describe('utils', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.documentElement.className = '';
        vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => cb()));
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    describe('initLabNavigation', () => {
        it('should add from-lab class when referrer is from /lab.html', () => {
            vi.stubGlobal('location', { pathname: '/lab/google-loader.html', origin: 'http://localhost:3000', href: 'http://localhost:3000/lab/google-loader.html' });
            Object.defineProperty(document, 'referrer', {
                value: 'http://localhost:3000/lab.html',
                configurable: true
            });
            initLabNavigation();
            expect(document.documentElement.classList.contains('from-lab')).toBe(true);
        });

        it('should not add from-lab class when referrer is external', () => {
            vi.stubGlobal('location', { pathname: '/lab/google-loader.html', origin: 'http://localhost:3000', href: 'http://localhost:3000/lab/google-loader.html' });
            Object.defineProperty(document, 'referrer', {
                value: 'https://google.com/',
                configurable: true
            });
            initLabNavigation();
            expect(document.documentElement.classList.contains('from-lab')).toBe(false);
        });

        it('should add in-iframe class when in an iframe', () => {
            const originalTop = window.top;
            Object.defineProperty(window, 'top', { value: {}, configurable: true });
            initLabNavigation();
            expect(document.documentElement.classList.contains('in-iframe')).toBe(true);
            Object.defineProperty(window, 'top', { value: originalTop, configurable: true });
        });
    });

    describe('resetAnimation', () => {
        it('should reset animation on a single element', () => {
            const el = document.createElement('div');
            el.className = 'test-anim';
            el.style.animation = 'fade 1s';
            document.body.appendChild(el);

            resetAnimation('.test-anim');
            expect(el.style.animation).toBe('');
        });

        it('should reset animation on multiple elements', () => {
            document.body.innerHTML = `
                <div class="anim"></div>
                <div class="anim"></div>
            `;
            const elements = document.querySelectorAll('.anim');
            elements.forEach(el => el.style.animation = 'fade 1s');

            resetAnimation('.anim');
            elements.forEach(el => {
                expect(el.style.animation).toBe('');
            });
        });
        
        it('should accept an Element directly', () => {
            const el = document.createElement('div');
            el.style.animation = 'fade 1s';
            resetAnimation(el);
            expect(el.style.animation).toBe('');
        });
        
        it('should accept a NodeList directly', () => {
            document.body.innerHTML = '<div class="anim"></div>';
            const elements = document.querySelectorAll('.anim');
            resetAnimation(elements);
            expect(elements[0].style.animation).toBe('');
        });

        it('should accept an array of Elements directly', () => {
            const el1 = document.createElement('div');
            const el2 = document.createElement('div');
            el1.style.animation = 'fade 1s';
            el2.style.animation = 'fade 1s';
            resetAnimation([el1, el2]);
            expect(el1.style.animation).toBe('');
            expect(el2.style.animation).toBe('');
        });
    });

    describe('bindResetButton', () => {
        it('should bind click on .reset-btn and reset target animation', () => {
            document.body.innerHTML = `
                <div class="target" style="animation: bounce 1s"></div>
                <button class="reset-btn"></button>
            `;
            bindResetButton('.target');

            const btn = document.querySelector('.reset-btn');
            const target = document.querySelector('.target');
            btn.click();

            expect(target.style.animation).toBe('');
        });

        it('should handle custom button selector', () => {
            document.body.innerHTML = `
                <div class="target" style="animation: spin 1s"></div>
                <button class="custom-reset"></button>
            `;
            bindResetButton('.target', '.custom-reset');

            const btn = document.querySelector('.custom-reset');
            const target = document.querySelector('.target');
            btn.click();

            expect(target.style.animation).toBe('');
        });

        it('should handle missing reset button gracefully', () => {
            document.body.innerHTML = `<div class="target"></div>`;
            expect(() => bindResetButton('.target')).not.toThrow();
        });
    });

    describe('splitText', () => {
        it('should split text into spans with --letter-index and default classes', () => {
            document.body.innerHTML = '<h1 id="test">Hello</h1>';
            splitText('#test');
            
            const el = document.getElementById('test');
            expect(el.textContent).toBe('Hello');
            expect(el.getAttribute('aria-label')).toBe('Hello');
            
            const spans = el.querySelectorAll('span');
            expect(spans.length).toBe(5);
            expect(spans[0].textContent).toBe('H');
            expect(spans[0].style.getPropertyValue('--letter-index')).toBe('4');
            expect(spans[0].style.display).toBe('inline-block');
            
            expect(spans[4].textContent).toBe('o');
            expect(spans[4].style.getPropertyValue('--letter-index')).toBe('0');
        });

        it('should use a DocumentFragment to perform batch DOM insertion', () => {
            const spyCreateFragment = vi.spyOn(document, 'createDocumentFragment');
            document.body.innerHTML = '<h1 id="test">Hello</h1>';
            const el = document.getElementById('test');
            const spyAppendChild = vi.spyOn(el, 'appendChild');

            splitText('#test');

            expect(spyCreateFragment).toHaveBeenCalled();
            expect(spyAppendChild).toHaveBeenCalledTimes(1);
            expect(spyAppendChild.mock.calls[0][0]).toBeInstanceOf(DocumentFragment);

            spyCreateFragment.mockRestore();
            spyAppendChild.mockRestore();
        });

        it('should apply the animationClass if provided', () => {
            document.body.innerHTML = '<h1 id="test">Hi</h1>';
            splitText('#test', 'custom-class');
            
            const spans = document.querySelectorAll('#test span');
            expect(spans[0].classList.contains('custom-class')).toBe(true);
        });
        
        it('should handle non-existent selector', () => {
            // Should not throw
            expect(() => splitText('.non-existent')).not.toThrow();
        });

        it('should convert spaces to non-breaking spaces', () => {
            document.body.innerHTML = '<h1 id="test">A B</h1>';
            splitText('#test');
            
            const spans = document.querySelectorAll('#test span');
            expect(spans[1].textContent).toBe('\u00A0');
        });
    });
});

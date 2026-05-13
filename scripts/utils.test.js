import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetAnimation, splitText } from './utils.js';

describe('utils.js', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => cb()));
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
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

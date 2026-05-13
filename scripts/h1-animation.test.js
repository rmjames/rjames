import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('h1-animation.js', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <header>
                <h1><a href="/">Test</a></h1>
            </header>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should split header text on DOMContentLoaded', async () => {
        await import('./h1-animation.js?t=' + new Date().getTime());
        
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const h1Link = document.querySelector('header h1 a');
        expect(h1Link.getAttribute('aria-label')).toBe('Test');
        
        const spans = h1Link.querySelectorAll('span.animate-letter');
        expect(spans.length).toBe(4);
    });
});

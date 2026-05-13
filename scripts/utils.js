/**
 * Resets CSS animations on elements matching the selector without triggering a synchronous reflow.
 * This is an anti-pattern fix for accessing offsetHeight to trigger reflows.
 * 
 * @param {string|NodeList|Element[]} selector - A CSS selector, NodeList, or array of elements to reset.
 */
export function resetAnimation(selector) {
    const elements = typeof selector === 'string' 
        ? document.querySelectorAll(selector) 
        : selector;

    if (!elements || (elements.length === 0 && !(elements instanceof Element))) return;

    const items = (elements instanceof Element) ? [elements] : elements;

    items.forEach(el => {
        el.style.animation = 'none';
    });

    // Use double rAF to ensure the 'none' style is applied before re-enabling
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            items.forEach(el => {
                el.style.animation = '';
            });
        });
    });
}

/**
 * Splits the text content of a selected element into individual spans, enabling per-letter styling or animation.
 * Each created span receives a `--letter-index` custom CSS property indicating its reverse position.
 *
 * @param {string} selector - A CSS selector for the target element.
 * @param {string} [animationClass] - An optional CSS class to add to each generated letter span.
 */
export function splitText(selector, animationClass) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const originalText = element.textContent;
    element.textContent = '';
    element.setAttribute('aria-label', originalText);
    
    const chars = [...originalText];
    chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.setProperty('--letter-index', chars.length - 1 - index);
        if (animationClass) {
            span.classList.add(animationClass);
        }
        element.appendChild(span);
    });
}

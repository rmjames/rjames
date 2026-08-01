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

    const fragment = document.createDocumentFragment();
    const chars = [...originalText];
    chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.setProperty('--letter-index', chars.length - 1 - index);
        if (animationClass) {
            span.classList.add(animationClass);
        }
        fragment.appendChild(span);
    });
    element.appendChild(fragment);
}

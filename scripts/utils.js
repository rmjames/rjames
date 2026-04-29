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

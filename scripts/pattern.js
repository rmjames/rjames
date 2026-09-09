const playState = document.querySelector('.button-state');
const motionItem = document.querySelector('.motion-item');

if (playState && motionItem) {
  playState.addEventListener('click', () => {
      motionItem.classList.toggle('pause');
      playState.classList.toggle('button-state-active');
    }
  );
}

/**
 * Helper to add interaction to a UI component on the pattern library page.
 * Accepts a trigger element, a target element (optional), and a click handler callback.
 *
 * @param {HTMLElement} trigger - The element to attach the click event to.
 * @param {HTMLElement} [target] - An optional target element to manipulate within the handler.
 * @param {Function} handler - The callback function executed on click, receives (trigger, target) as arguments.
 */
export function setupComponentInteraction(trigger, target, handler) {
  if (!trigger) return;
  trigger.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior if applicable
    handler(trigger, target);
  });
}

// Example usage for demonstrating interaction on pattern-library.html:
// Attach simple visual feedback for buttons and links without default browser behavior navigating away
const linkContacts = document.querySelectorAll('.link-contact');
linkContacts.forEach(link => {
  setupComponentInteraction(link, null, (trigger) => {
    console.log(`Interacted with link: ${trigger.textContent}`);
    // Temporarily dim to show interaction
    trigger.style.opacity = '.5';
    setTimeout(() => {
        trigger.style.opacity = '';
    }, 200);
  });
});

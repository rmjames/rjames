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

const replayBtn = document.querySelector('.replay-btn');
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.form-checkout input[type="checkbox"]');
    const checkmarks = document.querySelectorAll('.form-checkout .step-checkmark');
    const lines = document.querySelectorAll('.form-checkout .line');

    // Reset all
    checkboxes.forEach((cb, idx) => {
      cb.checked = idx === 0;
    });
    checkmarks.forEach((cm, idx) => {
      cm.classList.toggle('is-active', idx === 0);
    });
    lines.forEach((l) => {
      l.classList.remove('active');
    });

    // Animate sequence
    setTimeout(() => {
      if (checkboxes[1]) checkboxes[1].checked = true;
      if (checkmarks[1]) checkmarks[1].classList.add('is-active');
      if (lines[0]) lines[0].classList.add('active');
    }, 400);

    setTimeout(() => {
      if (checkboxes[2]) checkboxes[2].checked = true;
      if (checkmarks[2]) checkmarks[2].classList.add('is-active');
      if (lines[1]) lines[1].classList.add('active');
    }, 800);

    setTimeout(() => {
      if (checkboxes[3]) checkboxes[3].checked = true;
      if (checkmarks[3]) checkmarks[3].classList.add('is-active');
      if (lines[2]) lines[2].classList.add('active');
    }, 1200);
  });
}

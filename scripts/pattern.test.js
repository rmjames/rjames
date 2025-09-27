import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('pattern.js', () => {
  beforeEach(() => {
    // Set up mock DOM
    document.body.innerHTML = `
      <div class="motion-item"></div>
      <button class="button-state"></button>
    `;
    // Dynamically import the script to execute it in the test environment
    // A unique timestamp is added to avoid caching issues between tests
    return import('./pattern.js?t=' + new Date().getTime());
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should toggle "pause" and "button-state-active" classes on click', () => {
    const motionItem = document.querySelector('.motion-item');
    const playStateButton = document.querySelector('.button-state');

    // Initial state
    expect(motionItem.classList.contains('pause')).toBe(false);
    expect(playStateButton.classList.contains('button-state-active')).toBe(false);

    // First click
    playStateButton.click();
    expect(motionItem.classList.contains('pause')).toBe(true);
    expect(playStateButton.classList.contains('button-state-active')).toBe(true);

    // Second click
    playStateButton.click();
    expect(motionItem.classList.contains('pause')).toBe(false);
    expect(playStateButton.classList.contains('button-state-active')).toBe(false);
  });
});
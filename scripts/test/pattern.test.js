import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('pattern.js', () => {
  let setupComponentInteraction;

  beforeEach(async () => {
    // Set up mock DOM
    document.body.innerHTML = `
      <div class="motion-item"></div>
      <button class="button-state"></button>
      <a href="#" class="link-contact">Test Link</a>
    `;

    // Dynamically import the script to execute it in the test environment
    const module = await import('../pattern.js?t=' + new Date().getTime());
    setupComponentInteraction = module.setupComponentInteraction;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
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

  it('setupComponentInteraction should invoke handler and prevent default on click', () => {
    const trigger = document.querySelector('.link-contact');
    const handler = vi.fn();
    const eventPreventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault');

    setupComponentInteraction(trigger, null, handler);

    trigger.click();

    expect(eventPreventDefaultSpy).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(trigger, null);
  });

  it('setupComponentInteraction should handle null trigger gracefully', () => {
    expect(() => {
      setupComponentInteraction(null, null, vi.fn());
    }).not.toThrow();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('index.js', () => {
  const originalLocation = window.location;
  const originalNavigator = window.navigator;

  beforeEach(async () => {
    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    // Mock navigator.serviceWorker
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register: vi.fn(() => Promise.resolve({ scope: '/' })),
      },
    });

    // Mock document.startViewTransition
    document.startViewTransition = vi.fn((callback) => {
      callback();
      return { finished: Promise.resolve() };
    });

    // Set up mock DOM
    document.body.innerHTML = `
      <div class="cover"></div>
      <a href="/about" data-view-transition>About</a>
    `;

    // Dynamically import the script to execute it
    await import('./index.js?t=' + new Date().getTime());
  });

  afterEach(() => {
    // Restore original objects and clean up mocks
    window.location = originalLocation;
    window.navigator = originalNavigator;
    delete document.startViewTransition;
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should attempt to register a service worker on load', () => {
    // Manually trigger the load event
    const loadEvent = new Event('load');
    self.dispatchEvent(loadEvent);

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
  });

  it('should handle view transitions on data-link clicks', () => {
    // Manually trigger DOMContentLoaded
    const domEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(domEvent);

    const link = document.querySelector('a[data-view-transition]');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(link.classList.contains('link-clicked')).toBe(true);
    expect(document.startViewTransition).toHaveBeenCalled();
    expect(window.location).toBe(link.href);
  });

  it('should set viewTransitionName on the cover element', () => {
    // Manually trigger DOMContentLoaded
    const domEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(domEvent);

    const coverElement = document.querySelector('.cover');
    expect(coverElement.style.viewTransitionName).toBe('cover');
  });
});
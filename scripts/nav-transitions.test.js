import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPageKey } from './nav-transitions.js';

// Test for the pure function getPageKey
describe('getPageKey', () => {
  it('should return "work" for work.html', () => {
    expect(getPageKey('/work.html')).toBe('work');
  });

  it('should return "resume" for resume.html', () => {
    expect(getPageKey('/resume.html')).toBe('resume');
  });

  it('should return null for an unknown path', () => {
    expect(getPageKey('/unknown.html')).toBe(null);
  });

  it('should handle paths with trailing slashes correctly', () => {
    expect(getPageKey('/resume.html/')).toBe(null);
  });

  it('should return null for root path', () => {
    expect(getPageKey('/')).toBe(null);
  });
});

// Tests for DOM interactions
describe('DOM manipulation in nav-transitions', () => {
  const originalLocation = window.location;

  beforeEach(async () => {
    // Restore and mock location
    delete window.location;
    window.location = { pathname: '/', href: '' };

    // Mock document.startViewTransition
    document.startViewTransition = vi.fn((callback) => {
      // The callback is where the navigation happens
      callback();
      return {
        finished: Promise.resolve(),
      };
    });

    // Set up mock DOM
    document.body.innerHTML = `
      <header>
        <nav>
          <ul>
            <li><a href="/work.html">Work</a></li>
            <li><a href="/resume.html">Resume</a></li>
          </ul>
        </nav>
      </header>
    `;

    // Dynamically import the script to attach its event listeners
    await import('./nav-transitions.js?t=' + new Date().getTime());
  });

  afterEach(() => {
    // Restore original window.location and clean up mocks
    window.location = originalLocation;
    delete document.startViewTransition;
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should set the active class on the correct link on page load', () => {
    window.location.pathname = '/resume.html';

    // Manually trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    const resumeLink = document.querySelector('a[href="/resume.html"]');
    expect(resumeLink.classList.contains('active')).toBe(true);
    expect(resumeLink.style.viewTransitionName).toBe('active-nav-link');
  });

  it('should handle navigation correctly on link click', () => {
    window.location.pathname = '/work.html';

    // Manually trigger DOMContentLoaded to set the initial state
    const domContentLoadedEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(domContentLoadedEvent);

    const resumeLink = document.querySelector('a[href="/resume.html"]');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

    resumeLink.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(document.startViewTransition).toHaveBeenCalled();
    expect(window.location.href).toBe('/resume.html');
  });
});
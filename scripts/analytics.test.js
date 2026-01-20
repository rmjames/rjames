import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the global gtag function
global.gtag = vi.fn();

// Mock IntersectionObserver
let intersectionCallback;
const observerInstance = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
};
const mockIntersectionObserver = vi.fn((cb) => {
    intersectionCallback = cb;
    return observerInstance;
});
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);

// Mock requestIdleCallback
vi.stubGlobal('requestIdleCallback', (cb) => {
  cb(); // Execute immediately
  return 1;
});

// Since the module contains side effects (event listeners) that run on load,
// and we can't easily re-import it with Vitest/Vite in this setup without complex config,
// we will just import it once. 
// However, the problem is that 'afterEach' clears the DOM, removing elements with listeners.
// So we need to re-attach listeners.
// Best approach: Export the init function from the module so we can call it manually in tests.
import { initAnalytics } from './analytics.js';

describe('analytics.js', () => {
  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up mock DOM
    document.body.innerHTML = `
      <header>
        <nav><a href="/resume.html">Resume</a></nav>
      </header>
      <main>
        <section data-analytics-section="About"></section>
        <a href="#" data-analytics-link="Contact">Contact Us</a>
        <button class="brand" popovertarget="sbe-popover">SBE</button>
        <div id="sbe-popover" popover></div>
      </main>
      <footer class="footer-menu">
        <li class="footer-menu--item">
          <a href="https://github.com/rmjames">
             <p class="icon-text">Github</p>
          </a>
        </li>
      </footer>
    `;

    // Manually call init to attach listeners to the fresh DOM
    initAnalytics();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should track header navigation clicks', () => {
    document.querySelector('header nav a').click();
    expect(global.gtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'Header Navigation',
      event_label: 'Resume',
      transport_type: 'beacon',
      event_callback: expect.any(Function),
    });
  });

  it('should track footer navigation clicks', () => {
    const link = document.querySelector('.footer-menu a');
    link.click();
    expect(global.gtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'Footer Navigation',
      event_label: 'Github',
      transport_type: 'beacon',
    });
  });

  it('should track section visibility', () => {
    const section = document.querySelector('[data-analytics-section]');
    // Simulate the section intersecting with the viewport
    intersectionCallback([{ isIntersecting: true, target: section }], observerInstance);

    expect(global.gtag).toHaveBeenCalledWith('event', 'view_item', {
        event_category: 'Section Visibility',
        event_label: 'About',
        non_interaction: true,
    });
    // Check that unobserve was called
    expect(observerInstance.unobserve).toHaveBeenCalledWith(section);
  });

  it('should track custom data-analytics-link clicks', () => {
    document.querySelector('[data-analytics-link]').click();
    expect(global.gtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'Link Click',
      event_label: 'Contact',
      transport_type: 'beacon',
    });
  });

  it('should track custom data-analytics-link hover', () => {
    const link = document.querySelector('[data-analytics-link]');
    const event = new Event('mouseenter');
    link.dispatchEvent(event);

    expect(global.gtag).toHaveBeenCalledWith('event', 'mouseover', {
      event_category: 'Link Hover',
      event_label: 'Contact',
      non_interaction: true,
    });
  });

  it('should track brand interaction clicks', () => {
    document.querySelector('.brand').click();
    expect(global.gtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'Brand Interaction',
      event_label: 'Click - SBE',
      transport_type: 'beacon',
    });
  });

  it('should track popover engagement', () => {
    const popover = document.querySelector('[popover]');
    // Mock the :popover-open selector
    vi.spyOn(popover, 'matches').mockReturnValue(true);

    const toggleEvent = new Event('toggle');
    popover.dispatchEvent(toggleEvent);

    expect(global.gtag).toHaveBeenCalledWith('event', 'view_item', {
        event_category: 'Popover Engagement',
        event_label: 'View - sbe-popover',
        non_interaction: true,
    });
  });
});

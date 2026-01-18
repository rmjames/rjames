import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initLabAnalytics } from './lab-analytics.js';

// Mock the global gtag function
global.gtag = vi.fn();

// Mock requestIdleCallback
vi.stubGlobal('requestIdleCallback', (cb) => {
  cb(); // Execute immediately
  return 1;
});

describe('lab-analytics.js', () => {
  beforeEach(() => {
    // Set up mock DOM
    document.body.innerHTML = `
      <section class="demo-examples">
        <article tabindex="0" aria-label="Demo 1">
          <iframe src="/lab/demo1.html" title="Demo 1" id="iframe1"></iframe>
        </article>
        <article tabindex="0" aria-label="Demo 2">
          <iframe src="/lab/demo2.html" title="Demo 2" id="iframe2"></iframe>
        </article>
      </section>
    `;

    // Mock iframe contentWindow/contentDocument
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        // Create a mock document for the iframe
        const mockDoc = document.implementation.createHTMLDocument();
        mockDoc.body.innerHTML = `
            <button id="generic-btn">Click Me</button>
            <button id="tracked-btn" data-analytics-element="Tracked Button">Tracked</button>
        `;
        
        // Mock contentWindow and contentDocument
        Object.defineProperty(iframe, 'contentDocument', {
            get: () => mockDoc,
            configurable: true
        });
        Object.defineProperty(iframe, 'contentWindow', {
            get: () => ({ document: mockDoc }),
            configurable: true
        });
    });

    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should track hover on iframe wrapper', () => {
    initLabAnalytics();
    
    const wrapper = document.querySelector('article');
    const iframe = wrapper.querySelector('iframe');
    
    const event = new Event('mouseenter');
    wrapper.dispatchEvent(event);

    expect(global.gtag).toHaveBeenCalledWith('event', 'mouseover', {
      event_category: 'Demo 1', // Project Name
      event_label: 'Card Hover',
      non_interaction: true,
    });
  });

  it('should track focus on iframe wrapper', () => {
    initLabAnalytics();
    
    const wrapper = document.querySelector('article');
    const iframe = wrapper.querySelector('iframe');
    
    const event = new Event('focus');
    wrapper.dispatchEvent(event);

    expect(global.gtag).toHaveBeenCalledWith('event', 'focus', {
      event_category: 'Demo 1', // Project Name
      event_label: 'Card Focus',
      non_interaction: true,
    });
  });

  it('should track generic clicks inside iframe', () => {
    initLabAnalytics();

    const iframe = document.querySelector('#iframe1');
    const genericBtn = iframe.contentDocument.getElementById('generic-btn');
    
    // Simulate click inside iframe on generic element
    const event = new Event('click', { bubbles: true });
    genericBtn.dispatchEvent(event);

    expect(global.gtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'Demo 1', // Project Name
        event_label: 'Body Click',
        transport_type: 'beacon',
    });
    
    expect(iframe.dataset.analyticsAttached).toBe("true");
  });

  it('should track specific element clicks inside iframe', () => {
    initLabAnalytics();

    const iframe = document.querySelector('#iframe1');
    const trackedBtn = iframe.contentDocument.getElementById('tracked-btn');
    
    // Simulate click inside iframe on tracked element
    const event = new Event('click', { bubbles: true });
    trackedBtn.dispatchEvent(event);

    expect(global.gtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'Demo 1', // Project Name
        event_label: 'Tracked Button',
        transport_type: 'beacon',
    });
  });

  it('should track hover on specific elements inside iframe', () => {
     initLabAnalytics();

    const iframe = document.querySelector('#iframe1');
    const trackedBtn = iframe.contentDocument.getElementById('tracked-btn');

    const event = new Event('mouseenter');
    trackedBtn.dispatchEvent(event);

    expect(global.gtag).toHaveBeenCalledWith('event', 'mouseover', {
      event_category: 'Demo 1', // Project Name
      event_label: 'Tracked Button Hover',
      non_interaction: true,
    });
  });
  
  it('should attach click listener to iframe body on load', () => {
    // Setup an iframe without body initially (simulating loading)
    const iframe3 = document.createElement('iframe');
    iframe3.title = 'Demo 3';
    iframe3.id = 'iframe3';
    
    // Mock empty initially
    Object.defineProperty(iframe3, 'contentDocument', {
        get: () => null,
        configurable: true
    });
    Object.defineProperty(iframe3, 'contentWindow', {
        get: () => ({ document: null }),
        configurable: true
    });
    
    const article = document.createElement('article');
    article.appendChild(iframe3);
    document.querySelector('.demo-examples').appendChild(article);
    
    initLabAnalytics();
    
    expect(iframe3.dataset.analyticsAttached).toBeUndefined();
    
    // Now simulate load and body availability
    const mockDoc = document.implementation.createHTMLDocument();
    mockDoc.body.innerHTML = '<button id="btn">Click</button>';
    
    Object.defineProperty(iframe3, 'contentDocument', {
        get: () => mockDoc,
        configurable: true
    });
    Object.defineProperty(iframe3, 'contentWindow', {
        get: () => ({ document: mockDoc }),
        configurable: true
    });
    
    iframe3.dispatchEvent(new Event('load'));
    
    // Simulate generic click
    mockDoc.body.dispatchEvent(new Event('click'));
    
    expect(global.gtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'Demo 3', // Project Name
        event_label: 'Body Click',
        transport_type: 'beacon',
    });
    expect(iframe3.dataset.analyticsAttached).toBe("true");
  });
});

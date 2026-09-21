import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert/strict';
import {
    checkoutVariants,
    initStoreCheckoutSelector,
    buildV1Checkout,
    buildV2Checkout,
    buildTrackingCard,
    buildEmailClient
} from '../../../scripts/lab/StoreCheckoutSelector.js';

class MockClassList {
    constructor() {
        this.classes = new Set();
    }
    add(...names) {
        names.forEach(n => n && n.split(' ').forEach(c => c && this.classes.add(c)));
    }
    remove(...names) {
        names.forEach(n => n && n.split(' ').forEach(c => c && this.classes.delete(c)));
    }
    toggle(name, force) {
        if (force === undefined) {
            if (this.classes.has(name)) {
                this.classes.delete(name);
                return false;
            } else {
                this.classes.add(name);
                return true;
            }
        } else if (force) {
            this.classes.add(name);
            return true;
        } else {
            this.classes.delete(name);
            return false;
        }
    }
    contains(name) {
        return this.classes.has(name);
    }
    toString() {
        return Array.from(this.classes).join(' ');
    }
}

class MockElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.classList = new MockClassList();
        this.children = [];
        this.attributes = {};
        this.dataset = {};
        this.eventListeners = {};
        this.style = {
            setProperty: (k, v) => { this.style[k] = v; }
        };
        this.innerHTML = '';
        this.textContent = '';
        this.checked = false;
        this.type = '';
    }

    get className() {
        return this.classList.toString();
    }

    set className(val) {
        this.classList.classes.clear();
        this.classList.add(val);
    }

    setAttribute(key, val) {
        this.attributes[key] = String(val);
    }

    getAttribute(key) {
        return this.attributes[key] || null;
    }

    removeAttribute(key) {
        delete this.attributes[key];
    }

    appendChild(child) {
        try {
            child.parentElement = this;
        } catch {
            // parentElement read-only handling
        }
        this.children.push(child);
        return child;
    }

    replaceChildren(...newChildren) {
        this.children = [];
        newChildren.forEach(child => this.appendChild(child));
    }

    addEventListener(event, fn, options) {
        if (options && options.signal && options.signal.aborted) return;
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        const listenerObj = { fn, options };
        this.eventListeners[event].push(listenerObj);

        if (options && options.signal) {
            options.signal.addEventListener('abort', () => {
                const idx = this.eventListeners[event].indexOf(listenerObj);
                if (idx !== -1) this.eventListeners[event].splice(idx, 1);
            });
        }
    }

    dispatchEvent(event) {
        const listeners = (this.eventListeners[event.type] || []).slice();
        listeners.forEach(obj => obj.fn(event));
    }

    querySelector(selector) {
        if (selector.startsWith('.checkout-slide[data-index="')) {
            const index = selector.match(/data-index="(\d+)"/)[1];
            return this.children.find(c => c.classList.contains('checkout-slide') && String(c.dataset.index) === String(index)) || null;
        }
        const search = (el) => {
            if (selector === 'iframe' && el.tagName === 'IFRAME') return el;
            if (selector.startsWith('.') && el.classList.contains(selector.slice(1))) return el;
            if (selector === 'form' && el.tagName === 'FORM') return el;
            for (const child of el.children) {
                const found = search(child);
                if (found) return found;
            }
            return null;
        };
        return search(this);
    }

    querySelectorAll(selector) {
        const results = [];
        const search = (el) => {
            if (selector === 'iframe' && el.tagName === 'IFRAME') results.push(el);
            if (selector === 'input[type="checkbox"]' && el.tagName === 'INPUT' && el.type === 'checkbox') results.push(el);
            Array.from(el.children || []).forEach(search);
        };
        search(this);
        return results;
    }
}

describe('StoreCheckoutSelector Component', () => {
    let mockDocument;
    let mockWindow;
    let carousel;
    let pagination;
    let prevBtn;
    let nextBtn;
    let viewTransitionsCalled;
    let controller;

    beforeEach(() => {
        carousel = new MockElement('main');
        carousel.id = 'carousel';

        pagination = new MockElement('div');
        pagination.id = 'pagination';

        prevBtn = new MockElement('button');
        prevBtn.id = 'prev-btn';

        nextBtn = new MockElement('button');
        nextBtn.id = 'next-btn';

        const elements = {
            'carousel': carousel,
            'pagination': pagination,
            'prev-btn': prevBtn,
            'next-btn': nextBtn
        };

        viewTransitionsCalled = [];

        mockDocument = {
            getElementById: (id) => elements[id] || null,
            createElement: (tag) => new MockElement(tag),
            createElementNS: (ns, tag) => new MockElement(tag),
            createTextNode: (text) => {
                const node = new MockElement('text');
                node.textContent = text;
                return node;
            },
            startViewTransition: (options) => {
                viewTransitionsCalled.push(options);
                if (typeof options === 'function') {
                    options();
                } else if (options && typeof options.update === 'function') {
                    options.update();
                }
                return {
                    finished: Promise.resolve()
                };
            }
        };

        const windowListeners = {};
        mockWindow = {
            eventListeners: windowListeners,
            addEventListener: (event, fn, options) => {
                if (options && options.signal && options.signal.aborted) return;
                if (!windowListeners[event]) windowListeners[event] = [];
                const listenerObj = { fn, options };
                windowListeners[event].push(listenerObj);

                if (options && options.signal) {
                    options.signal.addEventListener('abort', () => {
                        const idx = windowListeners[event].indexOf(listenerObj);
                        if (idx !== -1) windowListeners[event].splice(idx, 1);
                    });
                }
            },
            dispatchEvent: (event) => {
                (windowListeners[event.type] || []).slice().forEach(obj => obj.fn(event));
            }
        };

        controller = initStoreCheckoutSelector(mockDocument, mockWindow);
    });

    it('should initialize single container with 4 native slides and zero iframes', () => {
        assert.equal(carousel.children.length, 4, 'Carousel should have 4 slides');
        assert.equal(pagination.children.length, 4, 'Pagination should have 4 dots');

        // Verify zero iframes
        const iframes = carousel.querySelectorAll('iframe');
        assert.equal(iframes.length, 0, 'Zero iframes must be used (Approach B Native DOM)');

        // Slide 0 should be active
        const slide0 = carousel.children[0];
        assert.ok(slide0.classList.contains('active'), 'Slide 0 should be active initially');
        assert.equal(slide0.dataset.variant, 'v1');

        // Pagination dot 0 should be selected
        const dot0 = pagination.children[0];
        assert.ok(dot0.classList.contains('active'));
        assert.equal(dot0.getAttribute('aria-selected'), 'true');
        assert.equal(dot0.getAttribute('tabindex'), '0');

        // Other dots should not be selected
        assert.equal(pagination.children[1].getAttribute('aria-selected'), 'false');
        assert.equal(pagination.children[1].getAttribute('tabindex'), '-1');
    });

    it('should transition forward on next button click with view transitions', () => {
        nextBtn.dispatchEvent({ type: 'click' });

        assert.equal(viewTransitionsCalled.length, 1, 'View transition should trigger');
        assert.deepEqual(viewTransitionsCalled[0].types, ['cross-fade']);
        assert.equal(carousel.children[0].classList.contains('active'), false);
        assert.equal(carousel.children[1].classList.contains('active'), true);
        assert.equal(pagination.children[1].getAttribute('aria-selected'), 'true');
        assert.equal(controller.getCurrentIndex(), 1);
    });

    it('should transition backward on prev button click and wrap to last variant', () => {
        prevBtn.dispatchEvent({ type: 'click' });

        assert.equal(viewTransitionsCalled.length, 1);
        assert.equal(carousel.children[3].classList.contains('active'), true, 'Should wrap to last slide');
        assert.equal(pagination.children[3].getAttribute('aria-selected'), 'true');
        assert.equal(controller.getCurrentIndex(), 3);
    });

    it('should transition directly when a pagination dot is clicked and ignore active dot', async () => {
        const dot2 = pagination.children[2];
        dot2.dispatchEvent({ type: 'click' });

        assert.equal(controller.getCurrentIndex(), 2, 'Should transition directly to slide 2');
        assert.equal(carousel.children[2].classList.contains('active'), true);
        assert.equal(dot2.getAttribute('aria-selected'), 'true');

        await Promise.resolve();
        const initialViewTransitionsCount = viewTransitionsCalled.length;
        // Click same dot again
        dot2.dispatchEvent({ type: 'click' });
        assert.equal(viewTransitionsCalled.length, initialViewTransitionsCount, 'Clicking active dot must be a no-op');
    });

    it('should navigate with keyboard ArrowLeft, ArrowRight, Home, and End', async () => {
        mockWindow.dispatchEvent({ type: 'keydown', key: 'ArrowRight' });
        assert.equal(controller.getCurrentIndex(), 1);

        await Promise.resolve();
        mockWindow.dispatchEvent({ type: 'keydown', key: 'ArrowRight' });
        assert.equal(controller.getCurrentIndex(), 2);

        await Promise.resolve();
        mockWindow.dispatchEvent({ type: 'keydown', key: 'ArrowLeft' });
        assert.equal(controller.getCurrentIndex(), 1);

        await Promise.resolve();
        mockWindow.dispatchEvent({ type: 'keydown', key: 'End' });
        assert.equal(controller.getCurrentIndex(), 3);

        await Promise.resolve();
        mockWindow.dispatchEvent({ type: 'keydown', key: 'Home' });
        assert.equal(controller.getCurrentIndex(), 0);
    });

    it('should navigate via touch swipe gestures', async () => {
        carousel.dispatchEvent({
            type: 'touchstart',
            changedTouches: [{ screenX: 250, screenY: 50 }]
        });
        carousel.dispatchEvent({
            type: 'touchend',
            changedTouches: [{ screenX: 150, screenY: 50 }]
        });
        assert.equal(controller.getCurrentIndex(), 1);

        await Promise.resolve();
        carousel.dispatchEvent({
            type: 'touchstart',
            changedTouches: [{ screenX: 100, screenY: 50 }]
        });
        carousel.dispatchEvent({
            type: 'touchend',
            changedTouches: [{ screenX: 200, screenY: 50 }]
        });
        assert.equal(controller.getCurrentIndex(), 0);
    });

    it('should cascade checkbox state forward and backward', () => {
        const mount = new MockElement('div');
        const { inputs } = buildTrackingCard(mount, mockDocument);

        assert.equal(inputs.length, 4);

        inputs[2].checked = true;
        inputs[2].dispatchEvent({ type: 'change' });

        assert.equal(inputs[0].checked, true);
        assert.equal(inputs[1].checked, true);
        assert.equal(inputs[2].checked, true);

        inputs[1].checked = false;
        inputs[1].dispatchEvent({ type: 'change' });

        assert.equal(inputs[2].checked, false);
        assert.equal(inputs[3].checked, false);
    });

    it('should cleanly abort all event listeners upon destroy()', () => {
        assert.ok((mockWindow.eventListeners['keydown'] || []).length > 0, 'Keydown listener should be registered');
        controller.destroy();
        assert.equal((mockWindow.eventListeners['keydown'] || []).length, 0, 'Keydown listener should be removed on destroy');
    });

    it('should define 4 checkoutVariants with expected identifiers', () => {
        assert.equal(checkoutVariants.length, 4);
        assert.deepEqual(checkoutVariants.map(v => v.id), ['v1', 'v2', 'tracking-card', 'email']);
    });

    it('should attach preventDefault submit handler on forms for v1 and v2', () => {
        const mountV1 = new MockElement('div');
        const { form: formV1 } = buildV1Checkout(mountV1, mockDocument);
        let defaultPreventedV1 = false;
        formV1.dispatchEvent({
            type: 'submit',
            preventDefault: () => { defaultPreventedV1 = true; }
        });
        assert.equal(defaultPreventedV1, true, 'V1 form submission must be intercepted with preventDefault');

        const mountV2 = new MockElement('div');
        const { form: formV2, inputs: inputsV2 } = buildV2Checkout(mountV2, mockDocument);
        assert.equal(inputsV2.length, 4);
        let defaultPreventedV2 = false;
        formV2.dispatchEvent({
            type: 'submit',
            preventDefault: () => { defaultPreventedV2 = true; }
        });
        assert.equal(defaultPreventedV2, true, 'V2 form submission must be intercepted with preventDefault');
    });

    it('should toggle dark mode on email client when theme toggle button is clicked', () => {
        const mount = new MockElement('div');
        const { emailWrapper, toggleBtn } = buildEmailClient(mount, mockDocument);

        assert.equal(emailWrapper.classList.contains('dark-mode'), false);
        toggleBtn.dispatchEvent({ type: 'click' });
        assert.equal(emailWrapper.classList.contains('dark-mode'), true);
        toggleBtn.dispatchEvent({ type: 'click' });
        assert.equal(emailWrapper.classList.contains('dark-mode'), false);
    });

    it('should configure email order confirmation as an accessible, keyboard-scrollable region', () => {
        const mount = new MockElement('div');
        const { emailWrapper } = buildEmailClient(mount, mockDocument);

        const body = emailWrapper.querySelector('.ec-body');
        assert.ok(body, 'ec-body must exist in email client');
        assert.equal(body.getAttribute('tabindex'), '0', 'ec-body must be keyboard focusable');
        assert.equal(body.getAttribute('role'), 'region', 'ec-body must have role="region"');
        assert.equal(body.getAttribute('aria-label'), 'Order confirmation email content', 'ec-body must have accessible aria-label');
    });

    it('should reset checkboxes on tracking card when reset button is clicked', () => {
        const mount = new MockElement('div');
        const { inputs, resetBtn } = buildTrackingCard(mount, mockDocument);

        // Turn all checkboxes on
        inputs.forEach(input => { input.checked = true; });

        // Click reset
        resetBtn.dispatchEvent({ type: 'click' });

        // First checkbox should remain checked, subsequent should be reset to false
        assert.equal(inputs[0].checked, true);
        assert.equal(inputs[1].checked, false);
        assert.equal(inputs[2].checked, false);
        assert.equal(inputs[3].checked, false);
    });
});

describe('Store Checkout Lab Pages & Security Specs', () => {
    const pages = [
        'lab/store-checkout-selector.html',
        'lab/google-store-checkout-timeline.html',
        'lab/google-store-checkout-truck.html',
        'lab/checkout-tracking-card.html',
        'lab/google-store-checkout.html'
    ];

    it('should adhere to zero-iframe architecture and WCAG specifications', async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const html = await fs.readFile(path.resolve('lab/store-checkout-selector.html'), 'utf-8');

        assert.equal(html.includes('<iframe'), false, 'Carousel HTML should not contain any iframes');
        assert.ok(html.includes('id="carousel"'), 'HTML must contain carousel stage');
        assert.ok(html.includes('id="pagination"'), 'HTML must contain pagination tablist');
        assert.ok(html.includes('aria-roledescription="carousel"'), 'Carousel stage must have carousel roledescription');
        assert.ok(html.includes('role="tablist"'), 'Pagination must have tablist role');
    });

    it('should verify all 4 variant pages exist and enforce strict CSP without unsafe-inline', async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');

        for (const page of pages) {
            const content = await fs.readFile(path.resolve(page), 'utf-8');
            assert.ok(content.length > 0, `${page} should exist and have content`);
            assert.ok(content.includes('Content-Security-Policy'), `${page} must contain Content-Security-Policy`);
            
            // Extract CSP meta tag
            const cspMatch = content.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
            assert.ok(cspMatch, `${page} must have a valid CSP meta tag`);
            const csp = cspMatch[1];
            
            // Verify script-src does not allow unsafe-inline
            const scriptSrcMatch = csp.match(/script-src\s+([^;]+)/i);
            assert.ok(scriptSrcMatch, `${page} must declare script-src`);
            assert.equal(scriptSrcMatch[1].includes("'unsafe-inline'"), false, `${page} script-src MUST NOT contain 'unsafe-inline'`);
            
            // Verify no inline <script> tags exist without src
            const hasInlineScript = /<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/i.test(content);
            assert.equal(hasInlineScript, false, `${page} must not contain inline scripts`);
        }
    });

    it('should verify zero raw innerHTML calls in StoreCheckoutSelector.js', async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const js = await fs.readFile(path.resolve('scripts/lab/StoreCheckoutSelector.js'), 'utf-8');
        assert.equal(js.includes('.innerHTML'), false, 'StoreCheckoutSelector.js must have zero .innerHTML sinks');
    });

    it('should verify CSS performance specs (registered @property and no stage backdrop-filter)', async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const css = await fs.readFile(path.resolve('styles/lab/store-checkout-selector.css'), 'utf-8');

        assert.ok(css.includes('@property --truck-offset'), 'CSS should register @property --truck-offset for hardware interpolation');
        assert.ok(css.includes('syntax: "<length>"'), 'Property syntax should be length');
        
        // Assert carousel-stage does not have backdrop-filter
        const stageMatch = css.match(/\.carousel-stage\s*\{([^}]+)\}/);
        assert.ok(stageMatch, '.carousel-stage rule must exist');
        assert.equal(stageMatch[1].includes('backdrop-filter'), false, '.carousel-stage must not apply redundant backdrop-filter');
    });

    it('should verify email order confirmation CSS defines scrollable flex layout', async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const css = await fs.readFile(path.resolve('styles/lab/store-checkout-selector.css'), 'utf-8');

        // Verify .checkout-variant--email contains scrollable layout properties
        assert.ok(css.includes('.checkout-variant--email'), 'CSS must define .checkout-variant--email');
        assert.ok(css.includes('.email-client {'), 'CSS must define .email-client flex column');
        assert.ok(css.includes('.ec-body {'), 'CSS must define .ec-body');
        assert.ok(css.includes('overflow-y: auto;'), 'CSS must specify overflow-y: auto for scrolling');
        assert.ok(css.includes('min-block-size: 0;'), 'CSS must specify min-block-size: 0 to allow flex items to shrink and scroll');
    });

    it('should verify all checkout assets and variants are registered in sw.js cache', async () => {
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const sw = await fs.readFile(path.resolve('sw.js'), 'utf-8');

        const expectedAssets = [
            '/lab/store-checkout-selector.html',
            '/lab/google-store-checkout-timeline.html',
            '/lab/google-store-checkout-truck.html',
            '/lab/checkout-tracking-card.html',
            '/lab/google-store-checkout.html',
            '/styles/lab/store-checkout-selector.css',
            '/styles/lab/google-store-checkout-timeline.css',
            '/styles/lab/google-store-checkout-truck.css',
            '/scripts/lab/StoreCheckoutSelector.js',
            '/scripts/lab/google-store-checkout-timeline.js',
            '/scripts/lab/google-store-checkout-truck.js',
            '/scripts/lab/checkout-tracking-card.js'
        ];

        for (const asset of expectedAssets) {
            assert.ok(sw.includes(asset), `sw.js must cache asset ${asset}`);
        }
    });
});

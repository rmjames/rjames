
export function initLabAnalytics() {
    const iframes = document.querySelectorAll(".demo-examples iframe");

    const attachIframeListener = (iframe) => {
        try {
            // Note: in a real cross-origin scenario this throws or returns null/restricted
            // But for same-origin labs it works.
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc && iframeDoc.body) {
                if (iframe.dataset.analyticsAttached) return;

                iframeDoc.body.addEventListener("click", (event) => {
                    // Check for specific element tracking
                    const target = event.target.closest('[data-analytics-element]');
                    
                    if (target) {
                         const elementLabel = target.getAttribute('data-analytics-element');
                         const eventData = {
                            event_category: iframe.title, // Namespaced to Project
                            event_label: elementLabel,
                            transport_type: "beacon",
                        };
                        if (typeof gtag === 'function') {
                            gtag("event", "click", eventData);
                        }
                    } else {
                        // Generic tracking for clicks elsewhere in the iframe
                        const eventData = {
                            event_category: iframe.title, // Namespaced to Project
                            event_label: "Body Click",
                            transport_type: "beacon",
                        };
                        if (typeof gtag === 'function') {
                            gtag("event", "click", eventData);
                        }
                    }
                });
                
                // Track hover on specific elements inside iframe
                const trackedElements = iframeDoc.querySelectorAll('[data-analytics-element]');
                trackedElements.forEach(el => {
                     el.addEventListener('mouseenter', () => {
                        const elementLabel = el.getAttribute('data-analytics-element');
                         const eventData = {
                            event_category: iframe.title, // Namespaced to Project
                            event_label: `${elementLabel} Hover`,
                            non_interaction: true,
                        };
                        if (typeof gtag === 'function') {
                            gtag("event", "mouseover", eventData);
                        }
                     });
                });

                iframe.dataset.analyticsAttached = "true";
            }
        } catch (e) {
            // Cross-origin or restricted access
        }
    };

    // IntersectionObserver for lazy-loading and analytics attachment (PERF-29, PERF-31)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    // Don't delete dataset.src yet, so we can check if it's already loading
                }
                // Try attaching immediately in case it's already loaded or fast
                attachIframeListener(iframe);
            }
        });
    }, {
        rootMargin: '200px' // Load slightly before they enter the viewport
    });

    iframes.forEach((iframe) => {
        // Track hover on the iframe container (parent article)
        const wrapper = iframe.closest("article");
        if (wrapper) {
            wrapper.addEventListener("mouseenter", () => {
                const eventData = {
                    event_category: iframe.title, // Namespaced to Project
                    event_label: "Card Hover",
                    non_interaction: true,
                };
                if (typeof gtag === 'function') {
                    gtag("event", "mouseover", eventData);
                }
            });

            // Track focus on the article
            wrapper.addEventListener("focus", () => {
                const eventData = {
                    event_category: iframe.title, // Namespaced to Project
                    event_label: "Card Focus",
                    non_interaction: true,
                };
                if (typeof gtag === 'function') {
                    gtag("event", "focus", eventData);
                }
            });
        }

        // Attach listener on load
        iframe.addEventListener("load", () => attachIframeListener(iframe));

        // Start observing for lazy loading
        observer.observe(iframe);
    });
}

// Defer initialization until the browser is idle
if ("requestIdleCallback" in window) {
    requestIdleCallback(initLabAnalytics);
} else {
    setTimeout(initLabAnalytics, 200);
}

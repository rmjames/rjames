
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

        // Track clicks inside the iframe
        // Try immediately
        attachIframeListener(iframe);

        // Try on load
        iframe.addEventListener("load", () => attachIframeListener(iframe));

        // Fallback polling to catch cases where load fired before script ran
        const pollId = setInterval(() => {
            if (iframe.dataset.analyticsAttached) {
                clearInterval(pollId);
            } else {
                attachIframeListener(iframe);
            }
        }, 500);

        // Stop polling after 5 seconds
        setTimeout(() => clearInterval(pollId), 5000);
    });
}

// Defer initialization until the browser is idle
if ("requestIdleCallback" in window) {
    requestIdleCallback(initLabAnalytics);
} else {
    setTimeout(initLabAnalytics, 200);
}

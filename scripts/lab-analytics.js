
function trackEvent(category, action, label, extra = {}) {
    if (typeof gtag === 'function') {
        gtag("event", action, {
            event_category: category,
            event_label: label,
            ...extra,
        });
    }
}

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
                    const target = event.target.closest('[data-analytics-element]');
                    const elementLabel = target ? target.getAttribute('data-analytics-element') : "Body Click";
                    trackEvent(iframe.title, "click", elementLabel, { transport_type: "beacon" });
                });
                
                // Track hover on specific elements inside iframe
                const trackedElements = iframeDoc.querySelectorAll('[data-analytics-element]');
                trackedElements.forEach(el => {
                     el.addEventListener('mouseenter', () => {
                         const elementLabel = el.getAttribute('data-analytics-element');
                         trackEvent(iframe.title, "mouseover", `${elementLabel} Hover`, { non_interaction: true });
                     });
                });

                iframe.dataset.analyticsAttached = "true";
            }
        } catch {
            // Cross-origin or restricted access
        }
    };

    // IntersectionObserver for lazy-loading and analytics attachment (PERF-29, PERF-31)
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    // Don't delete dataset.src yet, so we can check if it's already loading
                }
                // Try attaching immediately in case it's already loaded or fast
                attachIframeListener(iframe);

                // Performance optimization: Stop observing after lazy-loading
                obs.unobserve(iframe);
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
                trackEvent(iframe.title, "mouseover", "Card Hover", { non_interaction: true });
            });

            // Track focus on the article
            wrapper.addEventListener("focus", () => {
                trackEvent(iframe.title, "focus", "Card Focus", { non_interaction: true });
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

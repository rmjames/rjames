document.addEventListener("DOMContentLoaded", () => {
    const iframes = document.querySelectorAll(".demo-examples iframe");

    const attachIframeListener = (iframe) => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc && iframeDoc.body) {
                if (iframe.dataset.analyticsAttached) return;

                iframeDoc.body.addEventListener("click", () => {
                    const eventData = {
                        event_category: "Lab Demo Click",
                        event_label: iframe.title,
                        transport_type: "beacon",
                    };
                    if (typeof gtag === 'function') {
                        gtag("event", "click", eventData);
                    }
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
                    event_category: "Lab Demo Hover",
                    event_label: iframe.title,
                    non_interaction: true,
                };
                if (typeof gtag === 'function') {
                    gtag("event", "mouseover", eventData);
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
});

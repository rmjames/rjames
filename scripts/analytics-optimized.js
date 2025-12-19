// Optimized analytics with lazy loading and request idle callback
function initAnalytics() {
  // Wait for gtag to be available
  if (typeof gtag === 'undefined') {
    setTimeout(initAnalytics, 100);
    return;
  }

  // Track header navigation clicks
  const headerNav = document.querySelector("header nav");
  if (headerNav) {
    headerNav.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        const link = event.target;
        gtag("event", "click", {
          event_category: "Header Navigation",
          event_label: link.textContent,
          transport_type: "beacon"
        });
      }
    });
  }

  // Track footer navigation clicks
  const footerMenu = document.querySelector(".footer-menu");
  if (footerMenu) {
    footerMenu.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (link) {
        gtag("event", "click", {
          event_category: "Footer Navigation",
          event_label: link.querySelector(".icon-text")?.textContent.trim() || link.href,
          transport_type: "beacon"
        });
      }
    });
  }

  // Track page section visibility (lazy observer)
  const sections = document.querySelectorAll("[data-analytics-section]");
  if (sections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.dataset.analyticsSection;
            gtag("event", "view_item", {
              event_category: "Section Visibility",
              event_label: sectionName,
              non_interaction: true
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Track other links (delegated)
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-analytics-link]");
    if (link) {
      gtag("event", "click", {
        event_category: "Link Click",
        event_label: link.dataset.analyticsLink,
        transport_type: "beacon"
      });
    }
  });

  // Track brand interactions (combined)
  document.addEventListener("click", (event) => {
    const brand = event.target.closest(".brand");
    if (brand) {
      gtag("event", "click", {
        event_category: "Brand Interaction",
        event_label: `Click - ${brand.textContent.trim()}`,
        transport_type: "beacon"
      });
    }
  });

  // Track brand hover (throttled)
  let hoverTimeout;
  document.addEventListener("mouseenter", (event) => {
    const brand = event.target.closest(".brand");
    if (brand) {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        gtag("event", "mouseover", {
          event_category: "Brand Interaction",
          event_label: `Hover - ${brand.textContent.trim()}`,
          non_interaction: true
        });
      }, 300); // Debounce 300ms
    }
  }, true);

  // Track popover engagement
  const popovers = document.querySelectorAll("[popover]");
  popovers.forEach((popover) => {
    popover.addEventListener("toggle", () => {
      if (popover.matches(":popover-open")) {
        gtag("event", "view_item", {
          event_category: "Popover Engagement",
          event_label: `View - ${popover.id}`,
          non_interaction: true
        });
      }
    });
  });
}

// Use requestIdleCallback for non-critical analytics initialization
if ('requestIdleCallback' in window) {
  requestIdleCallback(initAnalytics, { timeout: 3000 });
} else {
  // Fallback to setTimeout
  setTimeout(initAnalytics, 3000);
}

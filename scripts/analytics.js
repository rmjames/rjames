// Ensure gtag is defined even if analytics-loader.js failed or was blocked
window.gtag = window.gtag || function () {
  (window.dataLayer = window.dataLayer || []).push(arguments);
};

export function initAnalytics() {
  // Track header navigation clicks
  const headerNav = document.querySelector("header nav");
  if (headerNav) {
    headerNav.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        const link = event.target;
        const eventData = {
          event_category: "Header Navigation",
          event_label: link.textContent,
          transport_type: "beacon",
        };
        gtag("event", "click", eventData);
      }
    });
  }

  // Track footer navigation clicks
  const footerMenu = document.querySelector(".footer-menu");
  if (footerMenu) {
    footerMenu.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (link) {
        const eventData = {
          event_category: "Footer Navigation",
          event_label:
            link.querySelector(".icon-text")?.textContent.trim() || link.href,
          transport_type: "beacon",
        };
        gtag("event", "click", eventData);
      }
    });
  }

  // Track page section visibility
  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.dataset.analyticsSection;
          const eventData = {
            event_category: "Section Visibility",
            event_label: sectionName,
            non_interaction: true,
          };
          gtag("event", "view_item", eventData);
          observer.unobserve(entry.target); // Only track once per page load
        }
      });
    },
    { threshold: .5 },
  );

  const sections = document.querySelectorAll("[data-analytics-section]");
  sections.forEach((section) => sectionObserver.observe(section));

  // Track other links and brand interactions via event delegation
  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest("[data-analytics-link]");
    if (link) {
      const linkName = link.dataset.analyticsLink;
      const eventData = {
        event_category: "Link Click",
        event_label: linkName,
        transport_type: "beacon",
      };
      gtag("event", "click", eventData);
    }

    const brand = event.target.closest && event.target.closest(".brand");
    if (brand) {
      const eventData = {
        event_category: "Brand Interaction",
        event_label: `Click - ${brand.textContent.trim()}`,
        transport_type: "beacon",
      };
      gtag("event", "click", eventData);
    }
  });

  // Performance optimization (PERF-XX): Avoid global mouseover event delegation.
  // Listening to 'mouseover' on the document causes event.target.closest() to be
  // evaluated on almost every mouse movement, blocking the main thread.
  // Instead, attach 'mouseenter' directly to the elements we want to track.
  const analyticsLinks = document.querySelectorAll("[data-analytics-link]");
  analyticsLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const linkName = link.dataset.analyticsLink;
      const eventData = {
        event_category: "Link Hover",
        event_label: linkName,
        non_interaction: true,
      };
      gtag("event", "mouseover", eventData);
    });
  });

  const brands = document.querySelectorAll(".brand");
  brands.forEach((brand) => {
    brand.addEventListener("mouseenter", () => {
      const eventData = {
        event_category: "Brand Interaction",
        event_label: `Hover - ${brand.textContent.trim()}`,
        non_interaction: true,
      };
      gtag("event", "mouseover", eventData);
    });
  });

  // Track toggle events via event delegation (capturing phase because toggle doesn't bubble)
  document.addEventListener("toggle", (event) => {
    // Popover engagement
    const popover = event.target;
    if (popover && popover.hasAttribute && popover.hasAttribute("popover")) {
      if (popover.matches(":popover-open")) {
        const eventData = {
          event_category: "Popover Engagement",
          event_label: `View - ${popover.id}`,
          non_interaction: true,
        };
        gtag("event", "view_item", eventData);
      }
    }

    // Details engagement
    const details = event.target;
    if (details && details.tagName === "DETAILS") {
      if (details.open) {
        const summary = details.querySelector("summary");
        const label = summary ? summary.textContent.trim() : "Details Expanded";
        const eventData = {
          event_category: "Resume Interaction",
          event_label: `Expand - ${label}`,
          transport_type: "beacon",
        };
        gtag("event", "select_content", eventData);
      }
    }
  }, true); // Use capture phase
}

// Defer initialization until the browser is idle
if ("requestIdleCallback" in window) {
  requestIdleCallback(initAnalytics);
} else {
  // Fallback for Safari < 2019 etc (though most support it now, or polyfill)
  // Defer slightly to allow main thread to clear
  setTimeout(initAnalytics, 200);
}

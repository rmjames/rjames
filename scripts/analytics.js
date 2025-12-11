document.addEventListener("DOMContentLoaded", () => {
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
          event_callback: () => {
            // This callback is not strictly necessary for tracking,
            // but can be useful for debugging or ensuring navigation
            // happens after the event is sent.
          },
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
    { threshold: 0.5 },
  );

  const sections = document.querySelectorAll("[data-analytics-section]");
  sections.forEach((section) => sectionObserver.observe(section));

  // Track other links
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-analytics-link]");
    if (link) {
      const linkName = link.dataset.analyticsLink;
      const eventData = {
        event_category: "Link Click",
        event_label: linkName,
        transport_type: "beacon",
      };
      gtag("event", "click", eventData);
    }
  });

  document.addEventListener("mouseover", (event) => {
    const link = event.target.closest("[data-analytics-link]");
    if (link) {
      const linkName = link.dataset.analyticsLink;
      const eventData = {
        event_category: "Link Hover",
        event_label: linkName,
        non_interaction: true,
      };
      gtag("event", "mouseover", eventData);
    }
  });

  // Track brand interactions
  const brands = document.querySelectorAll(".brand");
  brands.forEach((brand) => {
    brand.addEventListener("click", () => {
      const eventData = {
        event_category: "Brand Interaction",
        event_label: `Click - ${brand.textContent.trim()}`,
        transport_type: "beacon",
      };
      gtag("event", "click", eventData);
    });

    brand.addEventListener("mouseenter", () => {
      const eventData = {
        event_category: "Brand Interaction",
        event_label: `Hover - ${brand.textContent.trim()}`,
        non_interaction: true,
      };
      gtag("event", "mouseover", eventData);
    });
  });

  // Track popover engagement
  const popovers = document.querySelectorAll("[popover]");
  popovers.forEach((popover) => {
    popover.addEventListener("toggle", () => {
      if (popover.matches(":popover-open")) {
        const eventData = {
          event_category: "Popover Engagement",
          event_label: `View - ${popover.id}`,
          non_interaction: true,
        };
        gtag("event", "view_item", eventData);
      }
    });
  });

  // Track details engagement (Resume Job History)
  const detailsElements = document.querySelectorAll("details");
  detailsElements.forEach((details) => {
    details.addEventListener("toggle", () => {
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
    });
  });
});

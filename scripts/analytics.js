document.addEventListener('DOMContentLoaded', () => {
  // Track header navigation clicks
  const headerNav = document.querySelector('header nav');
  if (headerNav) {
    headerNav.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        const link = event.target;
        const eventData = {
          event_category: 'Header Navigation',
          event_label: link.textContent,
          transport_type: 'beacon',
          event_callback: () => {
            // This callback is not strictly necessary for tracking,
            // but can be useful for debugging or ensuring navigation
            // happens after the event is sent.
          }
        };
        console.log('Sending GA event for header navigation:', eventData);
        gtag('event', 'click', eventData);
      }
    });
  }

  // Track footer navigation clicks
  const footerMenu = document.querySelector('.footer-menu');
  if (footerMenu) {
    footerMenu.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link) {
        const eventData = {
          event_category: 'Footer Navigation',
          event_label: link.querySelector('.icon-text')?.textContent.trim() || link.href,
          transport_type: 'beacon'
        };
        console.log('Sending GA event for footer navigation:', eventData);
        gtag('event', 'click', eventData);
      }
    });
  }

  // Track page section visibility
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionName = entry.target.dataset.analyticsSection;
        const eventData = {
          event_category: 'Section Visibility',
          event_label: sectionName,
          non_interaction: true,
        };
        console.log('Sending GA event for section visibility:', eventData);
        gtag('event', 'view_item', eventData);
        observer.unobserve(entry.target); // Only track once per page load
      }
    });
  }, { threshold: 0.5 });

  const sections = document.querySelectorAll('[data-analytics-section]');
  sections.forEach(section => sectionObserver.observe(section));

  // Track other links
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-analytics-link]');
    if (link) {
      const linkName = link.dataset.analyticsLink;
      const eventData = {
        event_category: 'Link Click',
        event_label: linkName,
        transport_type: 'beacon'
      };
      console.log('Sending GA event for link click:', eventData);
      gtag('event', 'click', eventData);
    }
  });
});

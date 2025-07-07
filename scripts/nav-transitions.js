// scripts/nav-transitions.js
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('header nav ul li a');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
      link.style.viewTransitionName = 'active-nav-link';
    } else {
      link.classList.remove('active');
      link.style.viewTransitionName = ''; // Remove for non-active links
    }

    link.addEventListener('click', (event) => {
      if (link.getAttribute('href') === currentPath) {
        event.preventDefault(); // Don't navigate if already on the page
        return;
      }

      if (!document.startViewTransition) {
        return; // Browser doesn't support View Transitions
      }

      // Set view-transition-name on the clicked link before transition
      navLinks.forEach(l => l.style.viewTransitionName = ''); // Clear old names
      link.style.viewTransitionName = 'active-nav-link';

      const transition = document.startViewTransition(() => {
        // This promise resolves when the new page's content is ready to be displayed
        // but before it's actually rendered.
        // We don't need to do anything specific here for the border,
        // as the CSS and the 'active' class will handle the styling on the new page.
      });

      transition.finished.then(() => {
        // Clean up after transition if needed, though usually not necessary for this case
        // The new page will set its own active link and view-transition-name
      });
    });
  });
});

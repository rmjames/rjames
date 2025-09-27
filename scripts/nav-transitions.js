// scripts/nav-transitions.js

export const pagePaths = {
  work: ['/work.html'],
  resume: ['/resume.html']
};

export function getPageKey(path) {
  for (const key in pagePaths) {
    if (pagePaths[key].includes(path)) {
      return key;
    }
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('header nav ul li a');
  const currentPath = window.location.pathname.endsWith('/') && window.location.pathname.length > 1 ? window.location.pathname.slice(0, -1) : window.location.pathname;

  const currentPageKey = getPageKey(currentPath);

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    const linkPageKey = getPageKey(linkHref);

    // Set initial active state
    if (linkPageKey === currentPageKey) {
      link.classList.add('active');
      link.style.viewTransitionName = 'active-nav-link';
      // Set initial border for work/resume pages (visible without animation on load)
      if (currentPageKey === 'work' || currentPageKey === 'resume') {
        link.classList.add('force-border-full'); // Show border, no animation
      }
    } else {
      link.classList.remove('active');
      link.style.viewTransitionName = '';
    }

    link.addEventListener('click', (event) => {
      const targetHref = link.getAttribute('href');
      const targetPageKey = getPageKey(targetHref);

      if (targetPageKey === currentPageKey) {
        event.preventDefault();
        return;
      }

      if (!document.startViewTransition) {
        window.location.href = targetHref; // Fallback
        return;
      }

      event.preventDefault();

      // Clear previous animation classes and view transition names from all links
      navLinks.forEach(l => {
        l.classList.remove('animate-border-in', 'animate-border-out', 'force-border-full', 'active');
        l.style.viewTransitionName = '';
      });

      // Logic for border animation on the CLICKED link
      let animateOut = false;

      // From Work to Resume
      if (currentPageKey === 'work' && targetPageKey === 'resume') {
        link.classList.add('animate-border-in');
      }
      // From Resume to Work
      else if (currentPageKey === 'resume' && targetPageKey === 'work') {
        animateOut = true;
      }

      if (animateOut) {
        link.classList.add('force-border-full'); // Set to 100% width, no transition
        requestAnimationFrame(() => {
          // Ensure force-border-full is applied and rendered
          requestAnimationFrame(() => {
            link.classList.remove('force-border-full'); // Remove it so transition can take effect
            link.classList.add('animate-border-out'); // Animate 100% to 0%
          });
        });
      }

      link.style.viewTransitionName = 'active-nav-link'; // For the page transition itself

      const transition = document.startViewTransition(() => {
        // The actual navigation will be handled by the browser resolving the href
        // For SPA-like behavior or more control, you'd update content here.
        // For MPA, we let the click proceed after setting up styles.
        // Since we called preventDefault, we need to navigate manually.
        window.location.href = targetHref;
      });

      transition.finished.then(() => {
        // Clean up on the link that was clicked.
        // Note: When the new page loads, its own JS will run and set initial states.
        // So, this cleanup might be redundant if full page reloads occur.
        // However, it's good practice for View Transitions which can be very fast.
        link.classList.remove('animate-border-in', 'animate-border-out', 'force-border-full');
        // The 'active' class and 'active-nav-link' view transition name will be set by the script on the new page.
      });
    });
  });
});
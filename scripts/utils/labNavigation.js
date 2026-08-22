/**
 * Lab Navigation Utility
 * Detects if the current page was navigated from /lab or /lab.html
 * and adds the 'from-lab' class to the document root element.
 * Also adds 'in-iframe' class when embedded inside an iframe.
 */
export function initLabNavigation() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (window.self !== window.top) {
    document.documentElement.classList.add('in-iframe');
  }

  try {
    const referrer = document.referrer;
    if (referrer) {
      const base = window.location.href || (window.location.origin ? `${window.location.origin}/` : 'http://localhost/');
      const refUrl = new URL(referrer, base);
      const currentOrigin = window.location.origin || (window.location.host ? `${window.location.protocol || 'http:'}//${window.location.host}` : refUrl.origin);
      if (refUrl.origin === currentOrigin && (refUrl.pathname.endsWith('/lab.html') || refUrl.pathname.includes('/lab'))) {
        document.documentElement.classList.add('from-lab');
      }
    }
  } catch {
    // Ignore URL parse error
  }
}

// Auto-run if executed in a browser environment
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLabNavigation, { once: true });
  } else {
    initLabNavigation();
  }
}

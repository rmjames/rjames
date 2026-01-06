/**
 * Google Analytics Loader
 *
 * Conditionally loads Google Analytics based on the environment.
 * - Localhost/Dev: Mocks gtag to log events to console and prevent network requests.
 * - Production: Loads the real Google Analytics script.
 *
 * Loaded with 'defer' to avoid blocking the initial page render.
 */
(function() {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  if (isLocal) {
    // Mock gtag for local development and testing
    console.log('Analytics: Local environment detected. Google Analytics is mocked.');

    window.gtag = function() {
      window.dataLayer.push(arguments);
      console.log('Analytics (Mock):', ...arguments);
    };
  } else {
    // Production: Load the real Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-51900523-1';
    document.head.appendChild(script);

    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'UA-51900523-1');
  }
})();

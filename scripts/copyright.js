
(function() {
  const copyright = document.querySelector('.copyright');
  if (copyright) {
    copyright.textContent = `©Robert James ${new Date().getFullYear()}`;
  }
})();

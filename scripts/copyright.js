
(function () {
  const copyright = document.querySelector('.copyright');
  if (copyright) {
    copyright.textContent = `© ${new Date().getFullYear()} Robert James`;
  }
})();

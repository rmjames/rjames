const initResumePrint = () => {
  // Select all job details that participate in the accordion
  const details = document.querySelectorAll('details[name="job"]');

  if (details.length === 0) return;

  const handleBeforePrint = () => {
    details.forEach((el) => {
      // Save the current open state so we could theoretically restore it,
      // but primarily we just need to re-add the name attribute.
      // Removing 'name' breaks the exclusive accordion behavior, allowing all to be open.
      el.removeAttribute('name');
      el.open = true;
    });
  };

  const handleAfterPrint = () => {
    details.forEach((el) => {
      // Restore the exclusive accordion behavior
      el.setAttribute('name', 'job');
    });
  };

  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);
};

initResumePrint();

self.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) =>
        console.log("serviceWorker registered in scope: ", registration.scope),
      )
      .catch((err) => console.log("registration failed :", err));
  }
});

console.log("This Portfolio is an open design");

document.addEventListener("DOMContentLoaded", async (e) => {
  const coverElement = document.querySelector(".cover");
  if (coverElement) {
    coverElement.style.viewTransitionName = "cover";
  }

  if (!document.startViewTransition) {
    console.warn("View Transitions API is not supported");
    return;
  }

  document.addEventListener("click", (e) => {
    if (e.target.matches("a[data-view-transition]")) {
      e.preventDefault();

      const link = e.target;
      const href = e.target.href;

      link.classList.add("link-clicked");

      document.startViewTransition(() => {
        window.location = href;
      });
    }
  });
});

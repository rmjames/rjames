self.addEventListener("load", () => {
   if ("serviceWorker" in navigator) {
      const outputElement = document.getElementById("output");

      navigator.serviceWorker
         .register("/sw.js")
         .then(registration =>
            console.log(
               "serviceWorker registered in scope: ",
               registration.scope
            )
         )
         .catch(err => console.log("registration failed :", err));
   }
});

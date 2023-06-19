const playState = document.querySelector('.button-state')
const motionItem = document.querySelector('.motion-item')
const playStateOn = motionItem.classList.contains('pause')

self.addEventListener("load", () => {
   if ("serviceWorker" in navigator) {
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


playState.addEventListener('click', () => {  
  motionItem.classList.toggle('pause')
  playState.classList.toggle('button-state-active')
})

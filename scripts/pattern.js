const playState = document.querySelector('.button-state')
const motionItem = document.querySelector('.motion-item')


playState.addEventListener('click', () => {  
    motionItem.classList.toggle('pause')
    playState.classList.toggle('button-state-active')
  }
)

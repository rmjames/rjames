const playState = document.querySelector('.button-state')
const motionItem = document.querySelector('.motion-item')
const playStateOn = motionItem.classList.contains('pause')


playState.addEventListener('click', () => {  
    motionItem.classList.toggle('pause')
    playState.classList.toggle('button-state-active')
  }
)

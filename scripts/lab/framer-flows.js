import { resetAnimation } from '../utils/resetAnimation.js';

function handleReset() {
    resetAnimation('.box, .box-m, .box-s');
}

document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
});

import { resetAnimation } from '../utils.js';

function handleReset() {
    resetAnimation('.bloc, .triangle, .circle, .half-circle, .polygon');
}

document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
});

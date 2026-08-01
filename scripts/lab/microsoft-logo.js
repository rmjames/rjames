import { resetAnimation } from '../utils/resetAnimation.js';

document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetAnimation('.box');
        });
    }
});

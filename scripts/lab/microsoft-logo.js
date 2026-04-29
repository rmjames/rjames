import { resetAnimation } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetAnimation('.box');
        });
    }
});

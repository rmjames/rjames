import { resetAnimation } from '../utils/resetAnimation.js';

function handleReset() {
    resetAnimation('.item');
}

function init() {
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

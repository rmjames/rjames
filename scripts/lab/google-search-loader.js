import { resetAnimation } from '../utils/resetAnimation.js';

function init() {
    const container = document.querySelector('.container');
    const dots = document.querySelectorAll('.item');
    const resetBtn = document.querySelector('.reset-btn');

    let timeoutId = null;

    function setInitialState() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        if (container) {
            container.classList.remove('talkState');
            container.classList.add('initialState');
        }

        dots.forEach(dot => {
            dot.classList.remove('equalizer');
        });

        resetAnimation('.item');

        timeoutId = setTimeout(() => {
            if (container) {
                container.classList.remove('initialState');
                container.classList.add('talkState');
            }
        }, 3700);
    }

    setInitialState();

    if (container) {
        container.addEventListener('click', () => {
            dots.forEach(dot => {
                dot.classList.toggle('equalizer');
            });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', setInitialState);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

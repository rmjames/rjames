import { resetAnimation } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const dots = document.querySelectorAll('.item');
    const resetBtn = document.querySelector('.reset-btn');

    const load = () => {
        setTimeout(() => {
            if (container) {
                container.classList.add('talkState');
            }
        }, 3700);
    };

    load();

    if (container) {
        container.addEventListener('click', () => {
            dots.forEach(dot => {
                dot.classList.toggle('equalizer');
            });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetAnimation('.item');
        });
    }
});

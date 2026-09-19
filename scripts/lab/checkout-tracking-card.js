/**
 * Checkout Tracking Card controller
 */
const form = document.querySelector('.form-checkout');
if (form) {
    form.addEventListener('submit', (e) => e.preventDefault());
}

const steps = ['order', 'prepare', 'ship', 'arrive'];

function updateCascade(index) {
    const el = document.getElementById(steps[index]);
    if (!el) return;

    if (el.checked) {
        for (let i = 0; i < index; i++) {
            const prevEl = document.getElementById(steps[i]);
            if (prevEl && !prevEl.checked) {
                prevEl.checked = true;
            }
        }
    } else {
        for (let i = index + 1; i < steps.length; i++) {
            const nextEl = document.getElementById(steps[i]);
            if (nextEl && nextEl.checked) {
                nextEl.checked = false;
            }
        }
    }
}

steps.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('command', e => {
            if (e.command === `--set-${id}`) {
                el.checked = true;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        el.addEventListener('change', () => {
            updateCascade(index);
        });
    }
});

document.querySelectorAll('button[commandfor]').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('commandfor');
        const el = document.getElementById(id);
        if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
});

let timeoutIds = [];

function activateStep(id) {
    const el = document.getElementById(id);
    if (el && !el.checked) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function startAnimation() {
    const delays = [800, 2200, 3800, 5400];
    timeoutIds = steps.map((id, i) => {
        return setTimeout(() => activateStep(id), delays[i]);
    });
}

function resetAnimation() {
    timeoutIds.forEach(id => clearTimeout(id));
    steps.forEach(id => {
        const el = document.getElementById(id);
        if (el && id !== 'order') {
            el.checked = false;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    startAnimation();
}

const resetBtn = document.querySelector('.reset-btn');
if (resetBtn) {
    resetBtn.addEventListener('click', resetAnimation);
}

window.addEventListener('load', startAnimation);

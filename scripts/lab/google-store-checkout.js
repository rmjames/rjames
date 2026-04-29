/**
 * Google Store Checkout Lab Logic
 * Handles progress bar cascading and theme toggling.
 */

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

function activateStep(id) {
    const el = document.getElementById(id);
    if (el && !el.checked) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

// Initialize step listeners
steps.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('command', e => {
            if (e.command === `--set-${id}`) {
                el.checked = true;
                el.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`${id} checked`);
            }
        });

        el.addEventListener('change', () => {
            updateCascade(index);
        });
    }
});

// Handle commandfor buttons
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

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Auto-run steps on load
window.addEventListener('load', () => {
    const delays = [800, 2200, 3800, 5400];
    steps.forEach((id, i) => {
        setTimeout(() => activateStep(id), delays[i]);
    });
});

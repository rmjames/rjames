function init() {
    const colors = ['oklch(from blue l c h)', 'oklch(from red l c h)', 'oklch(from orange l c h)', 'oklch(from blue l c h)', 'oklch(from green l c h)', 'oklch(from red l c h)'];
    const container = document.querySelector('.container');
    const resetBtn = document.querySelector('.reset-btn');

    function split(text) {
        if (!container) return;
        const delay = 1000 / colors.length;

        for (let i = 0; i < text.length; i++) {
            let char = document.createElement('span');
            char.style.color = colors[i % colors.length];
            char.textContent = text[i];
            container.appendChild(char);

            const animation = char.animate(
                [
                    { opacity: 0, transform: 'translateX(1.25rem)' },
                    { opacity: 1, transform: 'translateX(0)' }
                ],
                {
                    duration: 600,
                    easing: 'ease-in-out',
                    delay: i * delay
                }
            );

            animation.onfinish = () => {
                char.style.opacity = 1;
                char.style.transform = 'translateY(0)';
            };
        }
    }

    function resetAnimation() {
        if (!container) return;
        container.innerHTML = '';
        split('Google');
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetAnimation);
    }

    split('Google');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

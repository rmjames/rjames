const players = [
    { title: "Main Media Player", url: "media-player.html" },
    { title: "Inline Widget", url: "media-player-inline.html" },
    { title: "Lock Screen Player", url: "media-player-lock-screen.html" },
    { title: "Media Player Widget", url: "media-player-widget.html" }
];

const carousel = document.getElementById('carousel');
const pagination = document.getElementById('pagination');

if (carousel && pagination) {
    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.style.viewTimelineName = `--card-${index}`;

        // Create Header
        const header = document.createElement('div');
        header.className = 'card-header';
        const h2 = document.createElement('h2');
        h2.textContent = player.title;
        header.appendChild(h2);
        card.appendChild(header);

        // Create Iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'player-frame';
        iframe.src = player.url;
        iframe.loading = 'lazy';
        card.appendChild(iframe);

        // Create Interaction Overlay to handle swiping vs clicking
        const overlay = document.createElement('div');
        overlay.className = 'swipe-overlay';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.zIndex = '10';
        overlay.style.cursor = 'pointer';

        let startX = 0;
        let isSwiping = false;

        overlay.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = false;
        }, { passive: true });

        overlay.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            if (Math.abs(startX - currentX) > 10) {
                isSwiping = true;
            }
        }, { passive: true });

        overlay.addEventListener('touchend', (e) => {
            if (!isSwiping) {
                // Tap detected, disable overlay to let clicks through to the iframe
                overlay.style.pointerEvents = 'none';
            } else {
                // Swipe detected, scroll carousel programmatically
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (Math.abs(diff) > 30) {
                    const direction = diff > 0 ? 1 : -1;
                    carousel.scrollBy({ left: direction * window.innerWidth * 0.8, behavior: 'smooth' });
                }
            }
        });

        // Only show overlay on touch devices. For desktop mice, allow direct iframe interaction.
        // We use a CSS media query check to see if the primary pointer is coarse (touch)
        if (window.matchMedia("(pointer: coarse)").matches) {
            card.appendChild(overlay);
        } else {
            // For desktop, disable overlay to allow immediate interaction without double clicking
            overlay.style.pointerEvents = 'none';
            overlay.style.display = 'none';
            card.appendChild(overlay);
        }

        carousel.appendChild(card);

        // Create Dot
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.animationTimeline = `--card-${index}`;

        dot.addEventListener('click', () => {
            card.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        });
        pagination.appendChild(dot);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') carousel.scrollBy({ left: -window.innerWidth * 0.8, behavior: 'smooth' });
        if (e.key === 'ArrowRight') carousel.scrollBy({ left: window.innerWidth * 0.8, behavior: 'smooth' });
    });

    // Reset interaction overlays when carousel scrolls
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.querySelectorAll('.swipe-overlay').forEach(overlay => {
                overlay.style.pointerEvents = 'auto';
            });
        }, 150);
    }, { passive: true });
}

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
}

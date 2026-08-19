// Fixture: Insecure postMessage listener without origin validation
window.addEventListener('message', (event) => {
    // Missing event.origin validation
    const { action, payload } = event.data;
    if (action === 'executeCommand') {
        window.location.href = payload.url;
    }
});

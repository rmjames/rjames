const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const icon = document.querySelector('link[rel="icon"]');

function animate() {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 16, 16);
    
    // Expensive synchronous operation in hot loop
    icon.href = canvas.toDataURL('image/png');
    
    requestAnimationFrame(animate);
}
animate();

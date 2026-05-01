function updateLayout() {
    const elements = document.querySelectorAll('.item');
    
    // REGRESSION: Layout thrashing pattern (Read-Write loop)
    for (let i = 0; i < elements.length; i++) {
        // Read layout (forces reflow)
        const width = elements[i].offsetWidth;
        
        // Write layout (invalidates layout)
        elements[i].style.height = (width * 2) + 'px';
    }
}

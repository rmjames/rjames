/**
 * Google Store Checkout Truck micro-interaction controller
 */
const form = document.querySelector('.form-checkout');
if (form) {
    form.addEventListener('submit', (e) => e.preventDefault());
    const inputs = Array.from(form.querySelectorAll('input[type="checkbox"]'));
    inputs.forEach((input, index) => {
        input.addEventListener('change', () => {
            if (input.checked) {
                for (let i = 0; i < index; i++) {
                    inputs[i].checked = true;
                }
            } else {
                for (let i = index + 1; i < inputs.length; i++) {
                    inputs[i].checked = false;
                }
            }
        });
    });
}

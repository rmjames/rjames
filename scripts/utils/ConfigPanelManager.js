export class ConfigPanelManager {
    constructor(options) {
        this.target = options.target;
        this.schema = options.schema || [];
        this.id = `config-popover-${Math.random().toString(36).substr(2, 9)}`;
        this._init();
    }

    _init() {
        // Create the Config Button
        this.configBtn = document.createElement('button');
        this.configBtn.className = 'config-btn';
        this.configBtn.setAttribute('popovertarget', this.id);
        this.configBtn.setAttribute('title', 'Configure Component');
        this.configBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/>
            </svg>
        `;

        // Append the button to the target element (or optionally another anchor)
        // Assuming the target is position: relative to anchor the button correctly
        this.target.appendChild(this.configBtn);

        // Create the Popover
        this.popover = document.createElement('div');
        this.popover.id = this.id;
        this.popover.className = 'config-popover';
        this.popover.setAttribute('popover', 'auto');

        const header = document.createElement('div');
        header.className = 'config-popover-header';
        header.innerHTML = `
            <h4>Configuration</h4>
            <button class="config-popover-close" popovertarget="${this.id}" popovertargetaction="hide">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                </svg>
            </button>
        `;
        this.popover.appendChild(header);

        // Build controls based on schema
        this.schema.forEach(ctrl => {
            const group = document.createElement('div');
            group.className = 'config-control-group';

            const label = document.createElement('label');
            label.textContent = ctrl.label;

            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'config-control-value';

            // Helper to update the display
            const updateDisplay = (val) => {
                if (ctrl.type === 'range') {
                    valueDisplay.textContent = `${val}${ctrl.unit || ''}`;
                } else if (ctrl.type === 'select' || ctrl.type === 'text') {
                    valueDisplay.textContent = val || 'Default';
                }
            };

            let input;
            if (ctrl.type === 'select') {
                input = document.createElement('select');
                ctrl.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    const currentVal = this.target.style[ctrl.property];
                    if (currentVal === opt || (opt === 'Default' && !currentVal) || (opt === 'flex' && !currentVal && ctrl.property === 'display')) {
                        option.selected = true;
                    }
                    input.appendChild(option);
                });

                updateDisplay(input.value);
                input.addEventListener('change', (e) => {
                    ctrl.onChange(e.target.value, this.target);
                    updateDisplay(e.target.value);
                });
            } else if (ctrl.type === 'text') {
                input = document.createElement('input');
                input.type = 'text';
                input.placeholder = ctrl.placeholder || '';
                input.value = this.target.style[ctrl.property] || '';

                updateDisplay(input.value);
                input.addEventListener('input', (e) => {
                    ctrl.onChange(e.target.value, this.target);
                    updateDisplay(e.target.value);
                });
            } else {
                input = document.createElement('input');
                input.type = ctrl.type;
                if (ctrl.type === 'range') {
                    if(ctrl.min !== undefined) input.min = ctrl.min;
                    if(ctrl.max !== undefined) input.max = ctrl.max;
                }

                // Determine initial value safely
                let initialValue = ctrl.value;
                if(typeof initialValue === 'function') {
                    initialValue = initialValue(this.target);
                }
                input.value = initialValue !== undefined ? initialValue : '';

                updateDisplay(input.value);
                input.addEventListener('input', (e) => {
                    ctrl.onChange(e.target.value, this.target);
                    updateDisplay(e.target.value);
                });
            }

            group.appendChild(label);
            group.appendChild(input);
            group.appendChild(valueDisplay);
            this.popover.appendChild(group);
        });

        // Add Event Listeners for State Management
        this.popover.addEventListener('toggle', (e) => {
            if (e.newState === 'open') {
                this.target.dispatchEvent(new CustomEvent('config-open', { bubbles: true }));
            } else {
                this.target.dispatchEvent(new CustomEvent('config-close', { bubbles: true }));
            }
        });

        document.body.appendChild(this.popover);
    }
}
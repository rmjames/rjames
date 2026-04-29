import re

def update_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # The new styling chunk
    new_css = """
    .form-checkout {
      display: grid;
      grid-template-columns: repeat(7, minmax(2rem, 1fr));
      align-items: start;
      gap: 0;
      inline-size: 100%;
      max-inline-size: 26rem;
      border-radius: .125rem;
      padding: 1.25rem;
      color: var(--system-color);
      box-sizing: border-box;
      container-type: inline-size;
      container-name: form;
    }

    @container viewport (max-inline-size: 400px) {
      .form-checkout {
          grid-template-columns: repeat(7, minmax(.5rem, 1fr));
          padding-inline: 0;
      }
      .step-label {
          font-size: 0.75rem;
      }
      .check input {
          width: 1.25rem;
          height: 1.25rem;
      }
      .check input::before {
          width: 0.6rem;
          height: 0.3rem;
          margin-top: -0.15rem;
      }
      .line {
          margin-top: calc(0.625rem - 1px);
          width: min(50%, 80%);
          margin-left: auto;
          margin-right: auto;
      }
    }

    .check {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .5rem;
        font-size: 0.85rem;
        font-weight: 500;
        text-align: center;
        position: relative;
        cursor: pointer;
        z-index: 2;
    }

    .check input {
        margin: 0;
        width: 1.5rem;
        height: 1.5rem;
        appearance: none;
        border: 2px solid light-dark(#dadce0, #5f6368);
        border-radius: 50%;
        background-color: light-dark(#fff, #303134);
        transition: all 0.2s ease;
        cursor: pointer;
        display: grid;
        place-content: center;
        font: inherit;
        color: currentColor;
    }

    .check input::before {
        content: '';
        width: 0.7rem;
        height: 0.35rem;
        background-color: transparent;
        border-left: 2px solid light-dark(#fff, #000);
        border-bottom: 2px solid light-dark(#fff, #000);
        transform: rotate(-45deg) scale(0);
        transition: 200ms transform cubic-bezier(0.4, 0.0, 0.2, 1);
        transform-origin: bottom left;
    }

    .check input:checked {
        background-color: var(--checkbox-bg-color);
        border-color: var(--checkbox-bg-color);
    }

    .check input:checked::before {
        transform: rotate(-45deg) scale(1) translate(1px, 4.5px);
    }

    .step-label {
        margin-top: 0.5rem;
        line-height: 1.2;
    }

    .step-date {
        font-weight: 400;
        font-size: 0.8rem;
        color: inherit;
        opacity: 0.7;
    }

    .line {
        height: 2px;
        background-color: light-dark(#dadce0, #5f6368);
        width: 100%;
        margin-top: calc(0.75rem - 1px);
        position: relative;
        z-index: 1;
    }

    .line::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0%;
        background-color: var(--checkbox-bg-color);
        transition: width 0.2s ease;
    }

    .form-checkout:has(#prepare:checked) .l-prep-js::after { width: 100%; }
    .form-checkout:has(#ship:checked) .l-ship-js::after { width: 100%; }
    .form-checkout:has(#ship:checked) .l-prep-js::after { width: 100%; }
    .form-checkout:has(#arrive:checked) .l-arrv-js::after { width: 100%; }
    .form-checkout:has(#arrive:checked) .l-ship-js::after { width: 100%; }
    .form-checkout:has(#arrive:checked) .l-prep-js::after { width: 100%; }

    .icon-wrapper--truck {
        position: absolute;
        inset-block-end: 2.5rem;
        left: 50%;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateX(-50%) translateY(100%);
        transition: opacity 1s,
            transform var(--truck-speed, 0.76s) cubic-bezier(0.68, -0.55, 0.265, 1.55),
            visibility 1s;
        z-index: 10;
        color: var(--checkbox-bg-color);
        width: 24px;
        height: 24px;
    }

    .icon-wrapper--truck svg {
        fill: currentColor;
        width: 100%;
        height: 100%;
        display: block;
    }

    input[name="prepare"]:checked~.icon-wrapper--truck {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateX(calc(-50% + var(--truck-offset, 0px))) translateY(-2rem) scale(1);
        transition: opacity 1s .28s,
            transform var(--truck-speed, 0.76s) cubic-bezier(0.68, -0.24, 0.265, 1.24),
            visibility 0s;
    }

    .form-checkout:has(input[name="ship"]:checked) .icon-wrapper--truck {
        --truck-offset: calc(100cqw / 7 * 2);
    }

    .form-checkout:has(input[name="arrive"]:checked) .icon-wrapper--truck {
        --truck-offset: calc(100cqw / 7 * 4);
    }

    @starting-style {
        .icon-wrapper--truck {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transform: translateX(-50%) translateY(100%) scale(0);
            transition: opacity 1s,
                transform var(--truck-speed, 0.76s) cubic-bezier(0.68, -0.55, 0.265, 1.55),
                visibility 1s;
        }
    }

    @property --truck-offset {
        syntax: "<length>";
        initial-value: 0px;
        inherits: true;
    }
  </style>
"""
    
    # We replace from input[type="checkbox"] down to just before <style> ends, basically ripping out the old checker logic and keyframes
    # It might be easier to use regex
    css_pattern = re.compile(r'input\[type="checkbox"\].*?@property --truck-position \{.*?\n    \}', re.DOTALL)
    if not css_pattern.search(content):
        # Fallback for google-store-check-out.html which might omit the truck property depending on its old version
        css_pattern = re.compile(r'input\[type="checkbox"\].*?@container viewport[^\}]+\n    \}\n', re.DOTALL)
        if not css_pattern.search(content):
            css_pattern = re.compile(r'input\[type="checkbox"\].*?@keyframes progress \{[^}]+\}\s*\}', re.DOTALL)
            if not css_pattern.search(content):
                # Another fallback
                css_pattern = re.compile(r'input\[type="checkbox"\].*?<\/style>', re.DOTALL)

    if css_pattern.search(content):
        # Replace up to </style> if using the final fallback, else standard
        if "<\/style>" in css_pattern.pattern:
            content = css_pattern.sub(new_css.strip() + "\n  </style>", content)
        else:
            content = css_pattern.sub(new_css.strip(), content)

    # Let's clean out the @media prefers color dark since we use light-dark() now
    content = re.sub(r'@media \(prefers-color-scheme: dark\) \{[^}]+\n      \}\n    \}\n', '', content)

    # Remove the old .form-checkout block if it was left behind
    content = re.sub(r'\.form-checkout\s*\{\s*display:\s*grid;\s*grid-template-columns:[^}]+\}\n', '', content)

    # Replace the HTML block inside body, preserving wrapper if it exists
    new_html = """
    <form class="form-checkout">
        <label class='check'>
            <input id='order' name='order' type="checkbox" disabled>
            <span class="step-label">Ordered</span>
            <span class="step-date">Oct 08</span>
        </label>
        <div class="line l-prep-js"></div>
        <label class='check'>
            <input id='prepare' name='prepare' type="checkbox">
            <span class="step-label">Preparing</span>
            <div class="icon-wrapper--truck">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                    <path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h520v120h160l80 120v280q0 33-23.5 56.5T840-120h-45q-13-37-44.5-58.5T680-200q-38 0-69.5 21.5T566-120H394q-13-37-44.5-58.5T280-200q-38 0-69.5 21.5T165-120h-5Zm120-80q17 0 28.5-11.5T320-240q0-17-11.5-28.5T280-280q-17 0-28.5 11.5T240-240q0 17 11.5 28.5T280-200Zm400 0q17 0 28.5-11.5T720-240q0-17-11.5-28.5T680-280q-17 0-28.5 11.5T640-240q0 17 11.5 28.5T680-200ZM160-640v360h33q13-37 44.5-58.5T308-360h344q13 37 44.5 58.5T741-280h19v-160h-85l-75-110v-90H160Zm0 0v440-440Z"></path>
                </svg>
            </div>
        </label>
        <div class="line l-ship-js"></div>
        <label class='check'>
            <input id='ship' name='ship' type="checkbox">
            <span class="step-label">Shipping</span>
        </label>
        <div class="line l-arrv-js"></div>
        <label class='check'>
            <input id='arrive' name='arrive' type="checkbox">
            <span class="step-label">Arriving</span>
            <span class="step-date">Oct 14</span>
        </label>
    </form>
    
    <script>
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
                el.addEventListener('change', () => {
                    updateCascade(index);
                });
            }
        });

        function activateStep(id) {
            const el = document.getElementById(id);
            if (el && !el.checked) {
                el.checked = true;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        window.addEventListener('load', () => {
            const delays = [800, 2200, 3800, 5400];
            steps.forEach((id, i) => {
                setTimeout(() => activateStep(id), delays[i]);
            });
        });
    </script>
"""

    html_pattern = re.compile(r'<form class="form-checkout">.*?</form>', re.DOTALL)
    if html_pattern.search(content):
        # We also need to add the script block if it doesn't have one
        if "<script>" not in content:
            content = html_pattern.sub(new_html.strip(), content)
        else:
            # Overwrite the script as well if exist
            html_script_pattern = re.compile(r'<form class="form-checkout">.*?</script>', re.DOTALL)
            content = html_script_pattern.sub(new_html.strip(), content)

    with open(filename, 'w') as f:
        f.write(content)

update_file('google-store-check-out-v2.html')
update_file('google-store-check-out.html')

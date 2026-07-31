# Component Control Panel Documentation

## Overview

The `lab/components.html` environment includes a dynamic, native configuration control panel built into the UI components. This allows developers and designers to interactively adjust and test common CSS layout properties, typography, and colors directly in the browser.

The primary goal of this tool is to stress-test layout robustness, specifically observing how nested components react to **CSS Container Queries** (`container-type: inline-size`) when their parent wrapper is resized.

## Architecture & Implementation

The control panel avoids external UI libraries, instead leveraging modern HTML and JS standards for a lightweight implementation.

### Native HTML Popover API
The panel utilizes the native HTML `<div popover="auto">` API.
- **Benefits:** It automatically handles top-layer positioning (preventing z-index collisions), light dismiss (clicking outside to close), and keyboard accessibility (ESC to close) without complex Javascript.
- **Trigger:** A "..." SVG icon button dynamically injected into the `.component-wrapper` acts as the trigger via `popovertarget="config-popover-{index}"`.

### 3-Column Layout UI
The internal controls follow a clean, developer-tools inspired 3-column layout utilizing CSS Grid:
```css
.config-control-group {
    display: grid;
    grid-template-columns: 1.5fr 2fr 1fr; /* [Label] [Input/Select] [Live Value] */
}
```
1. **Property Name:** A clear `<label>` describing the property.
2. **Control Tool:** The input element (`<input type="range">`, `<select>`, `<input type="text">`).
3. **Current Value:** A read-only `<span>` that updates in real-time as the control is manipulated.

### Visual Focus State (Dim & Blur)
To enhance usability, the UI employs a focus state when a configuration panel is active.
- **Active Component:** The component being configured receives an `.is-configuring` class, applying an outline (`var(--orange-3)`).
- **Background Components:** The parent `.components-grid` receives a `.has-active-config` class. CSS is used to gracefully fade (`opacity: 0.4`) and blur (`filter: blur(4px)`) all other `.component-wrapper` elements that are *not* currently active, keeping the user's focus locked on their task.
- **State Management:** This logic is handled strictly through the native `toggle` event listener attached to the popover element, ensuring states accurately reflect the open/closed status.

### Theming & Design Tokens
The control panel heavily utilizes established CSS custom properties from `styles/main.css`.
- **Colors:** Fallback colors and predefined color selections (e.g., Background Color, Text Color) strictly utilize the `oklch` color space format tied to project design tokens (e.g., `var(--black-3)`, `var(--white-1)`).
- **Light/Dark Mode:** The popover UI utilizes media queries (`@media (prefers-color-scheme: light)`) to adapt flawlessly to the system theme setting, switching background surfaces and border opacities accordingly.

## Available Controls

The JavaScript iterates over an array of control definitions, dynamically generating the DOM for each. Currently supported controls include:

| Property Name | Control Type | Maps to CSS Property | Default Example |
| :--- | :--- | :--- | :--- |
| **Inline Size (Width)** | Range Slider | `width` | Dynamically captured (`offsetWidth`) |
| **Block Size (Height)** | Range Slider | `height` | Dynamically captured (`offsetHeight`) |
| **Border Radius** | Range Slider | `border-radius` | `24px` |
| **Padding** | Range Slider | `padding` | `24px` |
| **Font Size** | Range Slider | `font-size` | `16px` |
| **Background Color** | Select Dropdown | `background-color` | `Default` (Tokens: Black-1, White-1, etc.) |
| **Text/Icon Color** | Select Dropdown | `color` | `Default` (Tokens: Gray-1, Orange-2, etc.) |
| **Font Family** | Select Dropdown | `font-family` | System Default, Arial, Courier New |
| **Display** | Select Dropdown | `display` | `flex`, `block`, `grid`, `inline-block` |
| **Transform** | Text Input | `transform` | `e.g., scale(0.9)` |
| **Transition** | Text Input | `transition` | `e.g., all 0.3s ease` |

## Refactoring for Element Agnosticism

While the initial implementation targets specific classes (`.component-wrapper` and `.components-grid`) in `lab/components.html`, the core logic is highly adaptable. To make this implementation entirely agnostic to any element or container across the project, it should be refactored into a reusable Factory Class (e.g., `ConfigPanelManager`).

### Proposed Agnostic Architecture

1. **Target Injection via Parameters:**
   Instead of hardcoding a `document.querySelectorAll()` loop over a specific class, the initialization function should accept specific nodes.
   ```javascript
   const panel = new ConfigPanelManager({
       target: document.getElementById('my-hero-section'), // The element being styled
       container: document.querySelector('main') // The scope for the dim/blur effect
   });
   ```

2. **Dynamic Control Schemas:**
   Different elements require different controls (e.g., an image doesn't need font controls). The configuration array should be passed in at initialization rather than hardcoded in the loop.
   ```javascript
   const textSchema = [
       { label: 'Font Size', type: 'range', property: 'fontSize', min: 10, max: 72, unit: 'px' },
       { label: 'Color', type: 'select', property: 'color', options: ['var(--white-1)', 'var(--black-1)'] }
   ];
   ```

3. **Event-Driven State Management:**
   To decouple the JavaScript from the CSS logic, the `toggle` listener shouldn't hardcode classes like `.is-configuring` or `.has-active-config`. Instead, it should dispatch `CustomEvent` objects (`config-open` and `config-close`) on the target element.
   The consuming HTML page or a broader layout manager can then listen for these events and apply whatever CSS classes it deems appropriate for outlines and blurring.
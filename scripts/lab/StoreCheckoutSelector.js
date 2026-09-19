/**
 * Store Checkout Selector Carousel
 * Zero-iframe Native DOM implementation showcasing the evolution of Google Store Checkout components.
 * Follows Approach B from MediaPlayerSelector with View Transitions API, CSS sibling-index staggering,
 * AbortController lifecycle cleanup, and strict zero-innerHTML security.
 */

export const checkoutVariants = [
    {
        id: 'v1',
        title: 'Checkout Timeline (CSS Only)',
        subtitle: 'Initial Concept • Pure CSS :has() & Keyframes Progress',
        variantClass: 'checkout-variant--v1'
    },
    {
        id: 'v2',
        title: 'Delivery Truck Micro-Interaction',
        subtitle: 'Motion Polish • @starting-style & Spring-Eased Truck',
        variantClass: 'checkout-variant--v2'
    },
    {
        id: 'tracking-card',
        title: 'Checkout Tracking Card',
        subtitle: 'Interactive Card • Delivery Dates & Automated Replay',
        variantClass: 'checkout-variant--card'
    },
    {
        id: 'email',
        title: 'Order Confirmation Email',
        subtitle: 'Production Design • Gmail Environment & Item Summary',
        variantClass: 'checkout-variant--email'
    }
];

const TRUCK_SVG_PATH = "M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h520v120h160l80 120v280q0 33-23.5 56.5T840-120h-45q-13-37-44.5-58.5T680-200q-38 0-69.5 21.5T566-120H394q-13-37-44.5-58.5T280-200q-38 0-69.5 21.5T165-120h-5Zm120-80q17 0 28.5-11.5T320-240q0-17-11.5-28.5T280-280q-17 0-28.5 11.5T240-240q0 17 11.5 28.5T280-200Zm400 0q17 0 28.5-11.5T720-240q0-17-11.5-28.5T680-280q-17 0-28.5 11.5T640-240q0 17 11.5 28.5T680-200ZM160-640v360h33q13-37 44.5-58.5T308-360h344q13 37 44.5 58.5T741-280h19v-160h-85l-75-110v-90H160Zm0 0v440-440Z";

const REPLAY_SVG_PATH = "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z";

const GOOGLE_G_PATHS = [
    { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "oklch(from #4285F4 l c h)" },
    { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "oklch(from #34A853 l c h)" },
    { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.21z", fill: "oklch(from #FBBC05 l c h)" },
    { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "oklch(from #EA4335 l c h)" }
];

function createSvgElement(doc, pathD, viewBox = "0 -960 960 960", fill = "currentColor", width = "24", height = "24") {
    const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", fill);
    svg.appendChild(path);
    return svg;
}

function createGoogleIcon(doc, width = "20", height = "20") {
    const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    GOOGLE_G_PATHS.forEach(({ d, fill }) => {
        const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", fill);
        svg.appendChild(path);
    });
    return svg;
}

/**
 * Setup forward/backward checkbox state cascade with abort signal support
 */
function wireCascade(inputs, signal) {
    inputs.forEach((input, index) => {
        input.addEventListener('change', () => {
            if (input.checked) {
                for (let i = 0; i < index; i++) {
                    if (!inputs[i].checked) {
                        inputs[i].checked = true;
                        inputs[i].dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            } else {
                for (let i = index + 1; i < inputs.length; i++) {
                    if (inputs[i].checked) {
                        inputs[i].checked = false;
                        inputs[i].dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }
        }, { signal });
    });
}

/**
 * Slide 1: Checkout Timeline (CSS-Only)
 */
export function buildV1Checkout(mount, doc, signal) {
    const form = doc.createElement('form');
    form.className = 'form-checkout form-checkout--v1';
    form.addEventListener('submit', (e) => e.preventDefault(), { signal });

    const steps = [
        { name: 'order', label: 'Ordered', lineClass: 'l-prep-js' },
        { name: 'prepare', label: 'Preparing', lineClass: 'l-ship-js' },
        { name: 'ship', label: 'Shipping', lineClass: 'l-arrv-js' },
        { name: 'arrive', label: 'Arriving', lineClass: null }
    ];

    const inputs = [];

    steps.forEach((step) => {
        const label = doc.createElement('label');
        label.className = 'check';

        const input = doc.createElement('input');
        input.type = 'checkbox';
        input.name = step.name;
        label.appendChild(input);
        label.appendChild(doc.createTextNode(` ${step.label}`));
        inputs.push(input);

        form.appendChild(label);

        if (step.lineClass) {
            const line = doc.createElement('div');
            line.className = `line ${step.lineClass}`;
            form.appendChild(line);
        }
    });

    wireCascade(inputs, signal);
    mount.appendChild(form);
    return { form, inputs };
}

/**
 * Slide 2: Delivery Truck Micro-Interaction
 */
export function buildV2Checkout(mount, doc, signal) {
    const wrapper = doc.createElement('div');
    wrapper.className = 'wrapper-v2';

    const form = doc.createElement('form');
    form.className = 'form-checkout form-checkout--v2';
    form.addEventListener('submit', (e) => e.preventDefault(), { signal });

    const steps = [
        { name: 'order', label: 'Ordered', lineClass: 'l-prep-js', hasTruck: false },
        { name: 'prepare', label: 'Preparing', lineClass: 'l-ship-js', hasTruck: true },
        { name: 'ship', label: 'Shipping', lineClass: 'l-arrv-js', hasTruck: false },
        { name: 'arrive', label: 'Arriving', lineClass: null, hasTruck: false }
    ];

    const inputs = [];

    steps.forEach((step) => {
        const label = doc.createElement('label');
        label.className = 'check';

        const input = doc.createElement('input');
        input.type = 'checkbox';
        input.name = step.name;
        label.appendChild(input);
        label.appendChild(doc.createTextNode(` ${step.label}`));
        inputs.push(input);

        if (step.hasTruck) {
            const truckWrapper = doc.createElement('div');
            truckWrapper.className = 'icon-wrapper--truck';
            const truckSvg = createSvgElement(doc, TRUCK_SVG_PATH);
            truckWrapper.appendChild(truckSvg);
            label.appendChild(truckWrapper);
        }

        form.appendChild(label);

        if (step.lineClass) {
            const line = doc.createElement('div');
            line.className = `line ${step.lineClass}`;
            form.appendChild(line);
        }
    });

    wireCascade(inputs, signal);
    wrapper.appendChild(form);
    mount.appendChild(wrapper);
    return { form, inputs };
}

/**
 * Slide 3: Checkout Tracking Card
 */
export function buildTrackingCard(mount, doc, signal) {
    const card = doc.createElement('article');
    card.className = 'tracking-card';

    const cardHeader = doc.createElement('header');
    cardHeader.className = 'card-header';
    const h2 = doc.createElement('h2');
    h2.textContent = 'Shipment 1 of 1';
    cardHeader.appendChild(h2);
    card.appendChild(cardHeader);

    const visual = doc.createElement('div');
    visual.className = 'tracking-visual';

    const form = doc.createElement('form');
    form.className = 'form-checkout form-checkout--card';
    form.addEventListener('submit', (e) => e.preventDefault(), { signal });

    const steps = [
        { name: 'order', label: 'Ordered', date: 'Oct 08', lineClass: 'l-prep-js', hasTruck: false, checked: true },
        { name: 'prepare', label: 'Preparing to ship', date: null, lineClass: 'l-ship-js', hasTruck: true, checked: false },
        { name: 'ship', label: 'Shipping', date: null, lineClass: 'l-arrv-js', hasTruck: false, checked: false },
        { name: 'arrive', label: 'Delivers', date: 'Oct 13 - Oct 14', lineClass: null, hasTruck: false, checked: false }
    ];

    const inputs = [];

    steps.forEach((step) => {
        const label = doc.createElement('label');
        label.className = 'check';

        const input = doc.createElement('input');
        input.type = 'checkbox';
        input.name = step.name;
        input.id = `card-step-${step.name}`;
        if (step.checked) input.checked = true;
        label.appendChild(input);

        const labelSpan = doc.createElement('span');
        labelSpan.className = 'step-label';
        labelSpan.textContent = step.label;
        label.appendChild(labelSpan);

        if (step.date) {
            const dateSpan = doc.createElement('span');
            dateSpan.className = 'step-date';
            dateSpan.textContent = step.date;
            label.appendChild(dateSpan);
        }

        if (step.hasTruck) {
            const truckWrapper = doc.createElement('div');
            truckWrapper.className = 'icon-wrapper--truck';
            const truckSvg = createSvgElement(doc, TRUCK_SVG_PATH);
            truckWrapper.appendChild(truckSvg);
            label.appendChild(truckWrapper);
        }

        inputs.push(input);
        form.appendChild(label);

        if (step.lineClass) {
            const line = doc.createElement('div');
            line.className = `line ${step.lineClass}`;
            form.appendChild(line);
        }
    });

    visual.appendChild(form);
    card.appendChild(visual);

    // Replay sequence button
    const resetBtn = doc.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'reset-btn';
    resetBtn.setAttribute('aria-label', 'Replay animation');
    resetBtn.title = 'Replay animation';
    resetBtn.appendChild(createSvgElement(doc, REPLAY_SVG_PATH, "0 0 24 24", "currentColor", "24", "24"));
    card.appendChild(resetBtn);

    let sequenceTimerIds = [];

    const stopSequence = () => {
        sequenceTimerIds.forEach(id => clearTimeout(id));
        sequenceTimerIds = [];
    };

    const startSequence = () => {
        stopSequence();
        const delays = [400, 1600, 2800, 4000];
        inputs.forEach((input, i) => {
            const timerId = setTimeout(() => {
                if (!input.checked) {
                    input.checked = true;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, delays[i]);
            sequenceTimerIds.push(timerId);
        });
    };

    const resetSequence = () => {
        stopSequence();
        inputs.forEach((input, i) => {
            if (i > 0) {
                input.checked = false;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        startSequence();
    };

    resetBtn.addEventListener('click', resetSequence, { signal });
    wireCascade(inputs, signal);

    mount.appendChild(card);
    return { card, inputs, resetBtn, startSequence, stopSequence, resetSequence };
}

/**
 * Slide 4: Full Order Confirmation Email (Zero-innerHTML Defense-in-Depth)
 */
export function buildEmailClient(mount, doc, signal) {
    const emailWrapper = doc.createElement('div');
    emailWrapper.className = 'email-client-wrapper';

    const client = doc.createElement('div');
    client.className = 'email-client';

    // 1. Appbar
    const appbar = doc.createElement('header');
    appbar.className = 'ec-appbar';

    const appbarLeft = doc.createElement('div');
    appbarLeft.className = 'ec-appbar-left';

    const hamburger = doc.createElement('button');
    hamburger.className = 'ec-hamburger';
    hamburger.type = 'button';
    hamburger.setAttribute('aria-label', 'Main menu');
    for (let i = 0; i < 3; i++) {
        hamburger.appendChild(doc.createElement('span'));
    }
    appbarLeft.appendChild(hamburger);

    const brand = doc.createElement('div');
    brand.className = 'ec-brand';
    brand.appendChild(createGoogleIcon(doc, "20", "20"));
    const brandText = doc.createElement('span');
    brandText.textContent = 'Gmail';
    brand.appendChild(brandText);
    appbarLeft.appendChild(brand);
    appbar.appendChild(appbarLeft);

    const searchBox = doc.createElement('div');
    searchBox.className = 'ec-search';
    const searchSvg = createSvgElement(doc, "M20.49 19l-5.73-5.73A7 7 0 1 0 5 17a7 7 0 0 0 4.57-1.68L15.3 21l5.19-2zm-15.48-6A5 5 0 1 1 10 18a5 5 0 0 1-5-5z", "0 0 24 24", "currentColor", "16", "16");
    searchBox.appendChild(searchSvg);
    const searchInput = doc.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search mail';
    searchInput.setAttribute('aria-label', 'Search mail');
    searchInput.readOnly = true;
    searchInput.value = 'Google Store order placed';
    searchBox.appendChild(searchInput);
    appbar.appendChild(searchBox);

    const actions = doc.createElement('div');
    actions.className = 'ec-appbar-actions';
    const avatar = doc.createElement('div');
    avatar.className = 'ec-avatar';
    avatar.setAttribute('aria-label', 'Account');
    avatar.textContent = 'R';
    actions.appendChild(avatar);
    appbar.appendChild(actions);

    client.appendChild(appbar);

    // 2. Email Body
    const body = doc.createElement('div');
    body.className = 'ec-body';

    const pane = doc.createElement('div');
    pane.className = 'ec-message-pane';

    const msgMeta = doc.createElement('div');
    msgMeta.className = 'ec-msg-meta';

    const subject = doc.createElement('h3');
    subject.className = 'ec-msg-subject';
    subject.textContent = 'Your Google Store order has been placed! 🎉';
    msgMeta.appendChild(subject);

    const metaRow = doc.createElement('div');
    metaRow.className = 'ec-msg-meta-row';

    const senderAvatar = doc.createElement('div');
    senderAvatar.className = 'ec-sender-avatar';
    senderAvatar.textContent = 'G';
    metaRow.appendChild(senderAvatar);

    const senderInfo = doc.createElement('div');
    senderInfo.className = 'ec-sender-info';
    const senderName = doc.createElement('div');
    senderName.className = 'ec-sender-name';
    senderName.textContent = 'Google Store ';
    const senderEmail = doc.createElement('span');
    senderEmail.className = 'ec-sender-email';
    senderEmail.textContent = '<no-reply@store.google.com>';
    senderName.appendChild(senderEmail);
    senderInfo.appendChild(senderName);

    const recipient = doc.createElement('div');
    recipient.className = 'ec-recipient';
    recipient.textContent = 'to me';
    senderInfo.appendChild(recipient);
    metaRow.appendChild(senderInfo);

    const msgDate = doc.createElement('div');
    msgDate.className = 'ec-msg-date';
    msgDate.textContent = 'Oct 8, 2022, 6:42 PM';
    metaRow.appendChild(msgDate);
    msgMeta.appendChild(metaRow);
    pane.appendChild(msgMeta);

    // 3. Order Page Content
    const pageWrapper = doc.createElement('div');
    pageWrapper.className = 'page-wrapper';

    const siteHeader = doc.createElement('header');
    siteHeader.className = 'site-header';

    const logoWrapper = doc.createElement('div');
    logoWrapper.className = 'logo-wrapper';
    logoWrapper.appendChild(createGoogleIcon(doc, "20", "20"));
    const logoText = doc.createElement('span');
    logoText.className = 'logo-text';
    logoText.textContent = 'Google Store';
    logoWrapper.appendChild(logoText);
    siteHeader.appendChild(logoWrapper);

    const toggleBtn = doc.createElement('button');
    toggleBtn.className = 'icon-btn theme-toggle-btn';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
    toggleBtn.appendChild(createSvgElement(doc, "M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z", "0 -960 960 960", "currentColor", "20", "20"));
    siteHeader.appendChild(toggleBtn);
    pageWrapper.appendChild(siteHeader);

    // 4. Hero Section
    const hero = doc.createElement('section');
    hero.className = 'hero-section';

    const heroTitle = doc.createElement('h2');
    heroTitle.className = 'hero-title';
    heroTitle.appendChild(doc.createTextNode('Good things come in '));
    const mark = doc.createElement('mark');
    mark.textContent = 'Google';
    heroTitle.appendChild(mark);
    heroTitle.appendChild(doc.createElement('br'));
    heroTitle.appendChild(doc.createTextNode('packages'));
    hero.appendChild(heroTitle);

    const shipmentStatus = doc.createElement('div');
    shipmentStatus.className = 'shipment-status-box';
    const statusIcon = doc.createElement('div');
    statusIcon.className = 'status-icon';
    statusIcon.appendChild(createSvgElement(doc, TRUCK_SVG_PATH, "0 -960 960 960", "currentColor", "20", "20"));
    shipmentStatus.appendChild(statusIcon);

    const statusText = doc.createElement('div');
    statusText.className = 'status-text';
    const p1 = doc.createElement('p');
    p1.textContent = 'Your order will arrive in 1 shipment.';
    const p2 = doc.createElement('p');
    p2.className = 'secondary-text';
    p2.textContent = "You can cancel your order until it's prepared to ship.";
    statusText.appendChild(p1);
    statusText.appendChild(p2);
    shipmentStatus.appendChild(statusText);
    hero.appendChild(shipmentStatus);
    pageWrapper.appendChild(hero);

    // 5. Embedded Tracking Card
    const trackingSection = doc.createElement('section');
    trackingSection.className = 'email-tracking-section';
    const trackingCardInstance = buildTrackingCard(trackingSection, doc, signal);
    pageWrapper.appendChild(trackingSection);

    // 6. Product Item
    const product = doc.createElement('article');
    product.className = 'product-item';

    const figure = doc.createElement('figure');
    figure.className = 'product-media';
    const watchSvg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    watchSvg.setAttribute("viewBox", "0 0 100 100");
    watchSvg.setAttribute("role", "img");
    watchSvg.setAttribute("aria-label", "Pixel Watch black");
    watchSvg.setAttribute("width", "56");
    watchSvg.setAttribute("height", "56");
    const circle = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "45");
    circle.setAttribute("fill", "oklch(from #111 l c h)");
    watchSvg.appendChild(circle);
    const watchHand = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    watchHand.setAttribute("d", "M50 20v30l20 20");
    watchHand.setAttribute("stroke", "oklch(from #fff l c h)");
    watchHand.setAttribute("stroke-width", "4");
    watchHand.setAttribute("fill", "none");
    watchSvg.appendChild(watchHand);
    figure.appendChild(watchSvg);
    product.appendChild(figure);

    const productDetails = doc.createElement('div');
    productDetails.className = 'product-details';
    const productH4 = doc.createElement('h4');
    const brandSpan = doc.createElement('span');
    brandSpan.className = 'brand-highlight';
    brandSpan.textContent = 'Google';
    productH4.appendChild(brandSpan);
    productH4.appendChild(doc.createTextNode(' Pixel Watch, Matte Black case / Obsidian Active band'));
    productDetails.appendChild(productH4);

    const qty = doc.createElement('span');
    qty.className = 'qty';
    qty.textContent = 'Qty: 1';
    productDetails.appendChild(qty);
    product.appendChild(productDetails);

    const productPricing = doc.createElement('div');
    productPricing.className = 'product-pricing';
    const price = doc.createElement('span');
    price.className = 'price';
    price.textContent = '$349.99';
    productPricing.appendChild(price);
    product.appendChild(productPricing);

    pageWrapper.appendChild(product);
    pane.appendChild(pageWrapper);
    body.appendChild(pane);
    client.appendChild(body);
    emailWrapper.appendChild(client);

    toggleBtn.addEventListener('click', () => {
        emailWrapper.classList.toggle('dark-mode');
    }, { signal });

    mount.appendChild(emailWrapper);
    return { emailWrapper, toggleBtn, trackingCardInstance };
}

/**
 * Main Controller: Store Checkout Carousel
 */
export function initStoreCheckoutSelector(doc = document, win = typeof window !== 'undefined' ? window : null) {
    const carousel = doc.getElementById('carousel');
    const pagination = doc.getElementById('pagination');
    const prevBtn = doc.getElementById('prev-btn');
    const nextBtn = doc.getElementById('next-btn');

    if (!carousel || !pagination) return null;

    const abortController = new AbortController();
    const { signal } = abortController;

    let currentIndex = 0;
    let isTransitioning = false;
    const dots = [];
    const slideInstances = [];

    // Clear existing children
    carousel.replaceChildren();
    pagination.replaceChildren();

    // Render slides
    checkoutVariants.forEach((variant, index) => {
        const slide = doc.createElement('div');
        slide.className = `checkout-slide${index === 0 ? ' active' : ''}`;
        slide.id = `checkout-slide-${index}`;
        slide.dataset.index = index;
        slide.dataset.variant = variant.id;
        slide.setAttribute('role', 'tabpanel');
        slide.setAttribute('aria-labelledby', `checkout-tab-${index}`);
        slide.setAttribute('tabindex', '0');

        // Slide Header
        const header = doc.createElement('div');
        header.className = 'card-header';
        const h2 = doc.createElement('h2');
        h2.textContent = variant.title;
        const p = doc.createElement('p');
        p.className = 'card-subtitle';
        p.textContent = variant.subtitle;
        header.appendChild(h2);
        header.appendChild(p);
        slide.appendChild(header);

        // Mount container
        const mount = doc.createElement('div');
        mount.className = `checkout-mount ${variant.variantClass}`;

        let instance = null;
        switch (variant.id) {
            case 'v1':
                instance = buildV1Checkout(mount, doc, signal);
                break;
            case 'v2':
                instance = buildV2Checkout(mount, doc, signal);
                break;
            case 'tracking-card':
                instance = buildTrackingCard(mount, doc, signal);
                break;
            case 'email':
                instance = buildEmailClient(mount, doc, signal);
                break;
        }
        slideInstances.push(instance);

        slide.appendChild(mount);
        carousel.appendChild(slide);

        // Pagination Dot
        const dot = doc.createElement('button');
        dot.className = `dot${index === 0 ? ' active' : ''}`;
        dot.id = `checkout-tab-${index}`;
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.setAttribute('aria-controls', `checkout-slide-${index}`);
        dot.setAttribute('aria-label', `Variant ${index + 1}: ${variant.title}`);
        dot.setAttribute('tabindex', index === 0 ? '0' : '-1');

        dot.addEventListener('click', () => {
            if (index === currentIndex || isTransitioning) return;
            transitionToSlide(index);
        }, { signal });

        pagination.appendChild(dot);
        dots.push(dot);
    });

    const transitionToSlide = (targetIndex) => {
        if (targetIndex === currentIndex || isTransitioning) return;

        let nextIndex = targetIndex;
        if (nextIndex < 0) nextIndex = checkoutVariants.length - 1;
        if (nextIndex >= checkoutVariants.length) nextIndex = 0;

        isTransitioning = true;

        // Stop active timers on previous slide
        const prevInstance = slideInstances[currentIndex];
        if (prevInstance && typeof prevInstance.stopSequence === 'function') {
            prevInstance.stopSequence();
        }

        const currentSlide = carousel.querySelector(`.checkout-slide[data-index="${currentIndex}"]`);
        const nextSlide = carousel.querySelector(`.checkout-slide[data-index="${nextIndex}"]`);

        const updateDOM = () => {
            currentSlide?.classList.remove('active');
            nextSlide?.classList.add('active');

            dots.forEach((dot, idx) => {
                const isSelected = idx === nextIndex;
                dot.classList.toggle('active', isSelected);
                dot.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                dot.setAttribute('tabindex', isSelected ? '0' : '-1');
            });

            currentIndex = nextIndex;
        };

        if (doc.startViewTransition) {
            let transition;
            try {
                transition = doc.startViewTransition({
                    update: updateDOM,
                    types: ['cross-fade']
                });
            } catch {
                transition = doc.startViewTransition(updateDOM);
            }

            if (transition && transition.finished) {
                transition.finished.finally(() => {
                    isTransitioning = false;
                });
            } else {
                isTransitioning = false;
            }
        } else {
            updateDOM();
            isTransitioning = false;
        }
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            transitionToSlide(currentIndex - 1);
        }, { signal });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            transitionToSlide(currentIndex + 1);
        }, { signal });
    }

    // Keyboard Navigation
    if (win) {
        win.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                transitionToSlide(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                transitionToSlide(currentIndex + 1);
            } else if (e.key === 'Home') {
                transitionToSlide(0);
            } else if (e.key === 'End') {
                transitionToSlide(checkoutVariants.length - 1);
            }
        }, { signal });
    }

    // Touch Swipe Navigation
    let touchStartX = 0;
    let touchStartY = 0;

    carousel.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }
    }, { signal, passive: true });

    carousel.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
            const deltaX = e.changedTouches[0].screenX - touchStartX;
            const deltaY = e.changedTouches[0].screenY - touchStartY;

            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0) {
                    transitionToSlide(currentIndex + 1);
                } else {
                    transitionToSlide(currentIndex - 1);
                }
            }
        }
    }, { signal, passive: true });

    const destroy = () => {
        abortController.abort();
        slideInstances.forEach(inst => {
            if (inst && typeof inst.stopSequence === 'function') {
                inst.stopSequence();
            }
        });
    };

    return {
        getCurrentIndex: () => currentIndex,
        transitionToSlide,
        variants: checkoutVariants,
        destroy
    };
}

if (typeof document !== 'undefined' && document.getElementById('carousel')) {
    initStoreCheckoutSelector();
}

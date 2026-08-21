const { test, expect } = require('@playwright/test');

test.describe('Lab Animations Control', () => {
  test('Headphones Knock animation can be paused and played', async ({ page }) => {
    await page.goto('/lab/headphones.html');

    const toggleBtn = page.locator('.toggle-btn');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Play animation');

    const headphone = page.locator('.headphone');
    await expect(headphone).toHaveCSS('animation-play-state', 'paused');

    // Click play
    // Force click since the element is pulsating and Playwright considers it not stable
    await toggleBtn.click({ force: true });
    await expect(headphone).toHaveCSS('animation-play-state', 'running');
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Pause animation');

    // Click pause
    await toggleBtn.click();
    await expect(headphone).toHaveCSS('animation-play-state', 'paused');
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Play animation');
  });

  test('Emoji Speaker animation can be paused and played', async ({ page }) => {
    await page.goto('/lab/emoji-speaker.html');

    const toggleBtn = page.locator('.toggle-btn');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Pause animation');

    const speaker = page.locator('.stack li').first();
    await expect(speaker).toHaveCSS('animation-play-state', /running/);

    // Pause
    await toggleBtn.click();
    await expect(speaker).toHaveCSS('animation-play-state', /paused/);
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Play animation');

    // Play
    await toggleBtn.click();
    await expect(speaker).toHaveCSS('animation-play-state', /running/);
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Pause animation');
  });

  test('Microsoft Logo animation renders boxes and supports reset/replay', async ({ page }) => {
    await page.goto('/lab/microsoft-logo.html');

    const boxes = page.locator('.box');
    await expect(boxes).toHaveCount(4);

    const resetBtn = page.locator('.reset-btn');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute('aria-label', 'Replay animation');

    await expect(page.locator('.box.toTop')).toBeVisible();
    await expect(page.locator('.box.toRight')).toBeVisible();
    await expect(page.locator('.box.toLeft')).toBeVisible();
    await expect(page.locator('.box.toBottom')).toBeVisible();

    // Trigger reset animation button
    await resetBtn.click();
    await expect(boxes.first()).toBeVisible();
  });

  test('Framer Flows animation supports reset/replay', async ({ page }) => {
    await page.goto('/lab/framer-flows.html');

    const resetBtn = page.locator('.reset-btn');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute('aria-label', 'Replay animation');

    await resetBtn.click();
    await expect(page.locator('.box')).toBeVisible();
  });

  test('Framer Loaders animation supports reset/replay', async ({ page }) => {
    await page.goto('/lab/framer-loaders.html');

    const resetBtn = page.locator('.reset-btn');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute('aria-label', 'Replay animation');

    await resetBtn.click();
    await expect(page.locator('.container')).toBeVisible();
  });

  test('Google Loader animation supports reset/replay', async ({ page }) => {
    await page.goto('/lab/google-loader.html');

    const resetBtn = page.locator('.reset-btn');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute('aria-label', 'Replay animation');

    await resetBtn.click();
    await expect(page.locator('.container span')).toHaveCount(6);
  });

  test('Google Search Loader animation supports reset/replay', async ({ page }) => {
    await page.goto('/lab/google-search-loader.html');

    const resetBtn = page.locator('.reset-btn');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute('aria-label', 'Replay animation');

    await resetBtn.click();
    await expect(page.locator('.item')).toHaveCount(4);
  });

  test('Checkout Tracking Card supports reset/replay', async ({ page }) => {
    await page.goto('/lab/checkout-tracking-card.html');

    const resetBtn = page.locator('.reset-btn');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute('aria-label', 'Replay animation');

    await resetBtn.click();
    await expect(page.locator('.tracking-card')).toBeVisible();
  });
});

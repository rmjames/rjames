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
});

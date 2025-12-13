const { test, expect } = require('@playwright/test');

test.describe('Lab Animations Control', () => {
  test('Headphones Knock animation can be paused and played', async ({ page }) => {
    await page.goto('/lab/headphones.html');

    const toggleBtn = page.locator('.toggle-btn');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Pause animation');

    const headphone = page.locator('.headphone');
    await expect(headphone).toHaveCSS('animation-play-state', 'running');

    // Click pause
    await toggleBtn.click();
    await expect(headphone).toHaveCSS('animation-play-state', 'paused');
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Play animation');

    // Click play
    await toggleBtn.click();
    await expect(headphone).toHaveCSS('animation-play-state', 'running');
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Pause animation');
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

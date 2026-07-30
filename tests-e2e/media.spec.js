import { test, expect } from '@playwright/test';

test('Media Player loads local audio', async ({ page }) => {
  await page.goto('/lab/media-player.html');

  // Wait for the presets to be populated (buttons > 0)
  const presets = page.locator('.media-player__presets__preset');
  await expect(presets).toHaveCount(127);

  // Click first preset
  await presets.first().click();

  // Check metadata
  const title = page.locator('.media-player__meta__title');
  await expect(title).toHaveText('01 Fabolous - Transformation');

  const audio = page.locator('#audio-player');
  // Check that src ends with the expected path (to avoid domain issues)
  const src = await audio.getAttribute('src');
  expect(src).toContain('Transformation.mp3');
});

test('Media Player Widget loads local audio', async ({ page }) => {
  await page.goto('/lab/media-player-widget.html');

  // Check title (first track)
  const title = page.locator('.media-player__meta__title');
  await expect(title).toHaveText('01 Fabolous - Transformation');

  // Check art
  const currentArtImg = page.locator('.media-player__current img');
  await expect(currentArtImg).toBeVisible();

  // Click Next
  await page.locator('.media-player__next').click();

  // Check title changed
  await expect(title).not.toHaveText('01 Fabolous - Transformation');
});

test('Media Components Lab page loads and components are interactive', async ({ page }) => {
  await page.goto('/lab/components.html');

  // Verify meta element is present
  const metaTitle = page.locator('.media-player__meta__title span');
  await expect(metaTitle).toHaveText('01 Fabolous - Transformation');

  // Verify individual play button exists and can be clicked
  const indPlayBtn = page.locator('.individual-btn.media-player-inline__play');
  await indPlayBtn.click();

  // Verify Long Click Button short press
  const longClickBtn = page.locator('.long-click-btn');
  const longClickOutput = page.locator('#long-click-output');

  await longClickBtn.click();
  await expect(longClickOutput).toHaveText('Action: Short Press Triggered!');

  // Verify Long Click Button long press (delay > 500ms)
  await longClickBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(600); // Wait longer than the 500ms threshold
  await page.mouse.up();
  await expect(longClickOutput).toHaveText('Action: LONG Press Triggered!');
});

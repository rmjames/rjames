import { test, expect } from '@playwright/test';

test('Media Player loads local audio', async ({ page }) => {
  await page.goto('/lab/media-player.html');

  // Wait for the presets to be populated (buttons > 0)
  // We added 2 tracks in AudioLibrary.js
  const presets = page.locator('.media-player__presets__preset');
  await expect(presets).toHaveCount(2);

  // Click first preset
  await presets.first().click();

  // Check metadata
  const title = page.locator('.media-player__meta__title');
  await expect(title).toHaveText('Coffee Shop');

  const audio = page.locator('#audio-player');
  // Check that src ends with the expected path (to avoid domain issues)
  const src = await audio.getAttribute('src');
  expect(src).toContain('/media/audio/coffee_shop.ogg');
});

test('Media Player Widget loads local audio', async ({ page }) => {
  await page.goto('/lab/media-player-widget.html');

  // Check title (first track)
  const title = page.locator('.media-player__meta__title');
  await expect(title).toHaveText('Coffee Shop');

  // Check art
  const currentArtImg = page.locator('.media-player__current img');
  await expect(currentArtImg).toBeVisible();

  // Click Next
  await page.locator('.media-player__next').click();

  // Check title changed (to Fire)
  await expect(title).toHaveText('Fire');
});

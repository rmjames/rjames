import { test, expect } from '@playwright/test';

test('Media Player loads local audio', async ({ page }) => {
  await page.goto('/lab/media-player.html');

  // Wait for the presets to be populated (buttons > 0)
  const presets = page.locator('.media-player__presets__preset');
  await expect(presets).toHaveCount(2);

  // Click first preset
  await presets.first().click();

  // Check metadata
  const title = page.locator('.media-player__meta__title');
  await expect(title).toHaveText('Coffee Shop Ambience');

  const audio = page.locator('#audio-player');
  // Check that src ends with the expected path (to avoid domain issues)
  const src = await audio.getAttribute('src');
  expect(src.toLowerCase()).toContain('coffee_shop');
});

test('Media Player Widget loads local audio', async ({ page }) => {
  await page.goto('/lab/media-player-widget.html');

  // Check title (first track)
  const title = page.locator('.media-player__meta__title');
  await expect(title).toHaveText('Coffee Shop Ambience');

  // Check art
  const currentArtImg = page.locator('.media-player__current img');
  await expect(currentArtImg).toBeVisible();

  // Click Next
  await page.locator('.media-player__next').click();

  // Check title changed
  await expect(title).not.toHaveText('Coffee Shop Ambience');
});

test('Media Components Lab page loads and components are interactive', async ({ page }) => {
  await page.goto('/lab/components.html');

  // Verify meta element is present
  const metaTitle = page.locator('.media-player__meta__title span');
  await expect(metaTitle).toHaveText(/^(01 Fabolous - Transformation|Coffee Shop Ambience)$/);

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

test('Media Player Option button toggles mode on long press', async ({ page }) => {
  await page.goto('/lab/media-player.html');

  const optionBtn = page.locator('.media-player__controls__option');
  await expect(optionBtn).toHaveAttribute('title', 'Mode: LIKE');

  await optionBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();

  await expect(optionBtn).toHaveAttribute('title', 'Mode: EQUALIZER');
});

test('Inline Media Player Option button toggles mode on long press', async ({ page }) => {
  await page.goto('/lab/media-player-inline.html');

  const optionBtn = page.locator('.media-player-inline__option');
  await expect(optionBtn).toHaveAttribute('title', 'Shuffle');

  await optionBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();

  await expect(optionBtn).toHaveAttribute('title', 'Like');
});

test('Lock Screen Media Player Option button toggles mode on long press', async ({ page }) => {
  await page.goto('/lab/media-player-lock-screen.html');

  const optionBtn = page.locator('.media-player__option');
  await expect(optionBtn).toHaveAttribute('title', 'Random (Mode)');

  await optionBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();

  await expect(optionBtn).toHaveAttribute('title', 'Like (Mode)');
});

test('Media Player preset button shows metadata popover on long press', async ({ page }) => {
  await page.goto('/lab/media-player.html');

  const presets = page.locator('.media-player__presets__preset');
  await expect(presets).toHaveCount(2);

  const firstPreset = presets.first();
  await expect(firstPreset).toBeVisible();

  const popover = page.locator('#preset-popover');
  await expect(popover).toBeHidden();

  // Long press on first preset
  await firstPreset.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);

  // Popover appears while holding long press
  await expect(popover).toBeVisible();
  await expect(popover).toContainText('Coffee Shop Ambience');

  await page.mouse.up();
});

test('Media Player Widget dislike button uses dislike icon and toggles state correctly', async ({ page }) => {
  await page.goto('/lab/media-player-widget.html');

  const dislikeBtn = page.locator('.media-player__dislike');
  const dislikePath = dislikeBtn.locator('path');
  const likeBtn = page.locator('.media-player__like');
  const likePath = likeBtn.locator('path');

  // Verify initial dislike icon is NOT the like icon
  const initialDislikeD = await dislikePath.getAttribute('d');
  const initialLikeD = await likePath.getAttribute('d');
  expect(initialDislikeD).not.toBe(initialLikeD);
  expect(initialDislikeD.startsWith('M240-840')).toBe(true);

  // Click dislike -> switches to filled dislike icon
  await dislikeBtn.click();
  const filledDislikeD = await dislikePath.getAttribute('d');
  expect(filledDislikeD).not.toBe(initialDislikeD);
  expect(filledDislikeD.startsWith('M240-840')).toBe(true);

  // Click dislike again -> untoggles back to outline
  await dislikeBtn.click();
  expect(await dislikePath.getAttribute('d')).toBe(initialDislikeD);

  // Like then dislike resets like
  await likeBtn.click();
  const filledLikeD = await likePath.getAttribute('d');
  expect(filledLikeD).not.toBe(initialLikeD);
  await dislikeBtn.click();
  expect(await likePath.getAttribute('d')).toBe(initialLikeD);
  expect(await dislikePath.getAttribute('d')).toBe(filledDislikeD);
});

test('Media Player Selector carousel widgets support dislike button and long-press modes', async ({ page }) => {
  await page.goto('/lab/media-player-selector.html');

  // Slide 0: Main Player - Long press option button
  const mainOptionBtn = page.locator('.player-variant--main .media-player__controls__option');
  await expect(mainOptionBtn).toHaveAttribute('title', 'Mode: LIKE');
  await mainOptionBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await expect(mainOptionBtn).toHaveAttribute('title', 'Mode: EQUALIZER');

  // Navigate to Slide 1: Inline Player
  await page.locator('#player-tab-1').click();
  const inlineOptionBtn = page.locator('.player-variant--inline .media-player-inline__option');
  await expect(inlineOptionBtn).toHaveAttribute('title', 'Shuffle');
  await inlineOptionBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await expect(inlineOptionBtn).toHaveAttribute('title', 'Like');

  // Navigate to Slide 2: Lock Screen Player
  await page.locator('#player-tab-2').click();
  const lockOptionBtn = page.locator('.player-variant--lock-screen .media-player__option');
  await expect(lockOptionBtn).toHaveAttribute('title', 'Random (Mode)');
  await lockOptionBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await expect(lockOptionBtn).toHaveAttribute('title', 'Like (Mode)');

  // Navigate to Slide 3: Widget Player
  await page.locator('#player-tab-3').click();
  const widgetDislikeBtn = page.locator('.player-variant--widget .media-player__dislike');
  const widgetDislikePath = widgetDislikeBtn.locator('path');
  const widgetLikeBtn = page.locator('.player-variant--widget .media-player__like');
  const widgetLikePath = widgetLikeBtn.locator('path');

  const initialWidgetDislikeD = await widgetDislikePath.getAttribute('d');
  const initialWidgetLikeD = await widgetLikePath.getAttribute('d');
  expect(initialWidgetDislikeD).not.toBe(initialWidgetLikeD);
  expect(initialWidgetDislikeD.startsWith('M240-840')).toBe(true);

  // Click dislike
  await widgetDislikeBtn.click();
  const filledWidgetDislikeD = await widgetDislikePath.getAttribute('d');
  expect(filledWidgetDislikeD).not.toBe(initialWidgetDislikeD);
  expect(filledWidgetDislikeD.startsWith('M240-840')).toBe(true);
});

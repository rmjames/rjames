import { test, expect } from '@playwright/test';

test.describe('Pattern Library Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pattern-library.html');
  });

  test('should render header and primary styleguide articles', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Pattern Library');

    const styleguide = page.locator('.styleguide');
    await expect(styleguide).toBeVisible();
  });

  test('should showcase all token groups', async ({ page }) => {
    const tokenCards = page.locator('.token-card');
    const count = await tokenCards.count();
    expect(count).toBeGreaterThan(25);

    const spacerCards = page.locator('.spacer-card');
    const spacerCount = await spacerCards.count();
    expect(spacerCount).toBeGreaterThanOrEqual(8);
  });

  test('should trigger popovers from brand buttons', async ({ page }) => {
    const sbeBtn = page.locator('button.brand[popovertarget="sbe-popover"]').first();
    const sbePopover = page.locator('#sbe-popover');

    await expect(sbePopover).toBeHidden();
    await sbeBtn.click();
    await expect(sbePopover).toBeVisible();

    const guardianBtn = page.locator('button.brand[popovertarget="guardian-popover"]').first();
    const guardianPopover = page.locator('#guardian-popover');
    await guardianBtn.click();
    await expect(guardianPopover).toBeVisible();
  });

  test('should render media player suite components', async ({ page }) => {
    const mainPlayer = page.locator('.media-player');
    await expect(mainPlayer).toBeVisible();

    const inlinePlayer = page.locator('.media-player-inline');
    await expect(inlinePlayer).toBeVisible();

    const lockScreenPlayer = page.locator('.media-player-grid');
    await expect(lockScreenPlayer).toBeVisible();
  });

  test('should render checkout timeline and tracking card with interactive replay', async ({ page }) => {
    const formCheckout = page.locator('.form-checkout');
    await expect(formCheckout).toBeVisible();

    const replayBtn = page.locator('.replay-btn');
    await expect(replayBtn).toBeVisible();
    await replayBtn.click();

    // After animation, all 4 checkboxes should be checked
    await page.waitForTimeout(1600);
    const checkedBoxes = page.locator('.form-checkout input:checked');
    await expect(checkedBoxes).toHaveCount(4);
  });
});

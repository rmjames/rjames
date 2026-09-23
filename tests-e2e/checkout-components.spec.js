import { test, expect } from '@playwright/test';

test.describe('Store Checkout & Email Confirmation Pattern Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lab/checkout-components.html');
  });

  test('should render page title and header', async ({ page }) => {
    const heading = page.locator('.header-title h1');
    await expect(heading).toHaveText('Store Checkout & Email Confirmation Pattern Library');
  });

  test('should render all 10 component wrappers with data-component attributes', async ({ page }) => {
    const expectedComponents = [
      'checkout-checkmark',
      'checkout-replay-button',
      'checkout-timeline',
      'checkout-truck-animation',
      'checkout-tracking-card',
      'email-document-header',
      'email-hero-status',
      'email-product-item',
      'email-order-summary',
      'email-client-frame'
    ];

    for (const comp of expectedComponents) {
      const wrapper = page.locator(`.component-wrapper[data-component="${comp}"]`);
      await expect(wrapper).toBeVisible();
    }
  });

  test('should allow toggling the interactive checkmark demo', async ({ page }) => {
    const chk = page.locator('#interactive-chk');
    await expect(chk).not.toBeChecked();
    await chk.check();
    await expect(chk).toBeChecked();
  });

  test('should trigger the replay sequence on replay button click', async ({ page }) => {
    const replayBtn = page.locator('#demo-replay-btn');
    const replayStatus = page.locator('#replay-status');

    await replayBtn.click();
    await expect(replayStatus).toHaveText(/Running replay sequence/);

    // Wait for replay sequence completion
    await page.waitForTimeout(1400);
    await expect(replayStatus).toHaveText(/Delivered! Sequence complete/);
  });

  test('should advance the delivery truck micro-interaction', async ({ page }) => {
    const truck = page.locator('.icon-wrapper--truck');
    const moveBtn = page.locator('#truck-move-btn');

    await moveBtn.click();
    await expect(truck).toHaveCSS('transform', /matrix/);
  });

  test('should open ConfigPanelManager popover and update styling', async ({ page }) => {
    const firstWrapper = page.locator('.component-wrapper').first();
    const configBtn = firstWrapper.locator('.config-btn');
    const popover = page.locator('.config-popover').first();

    await expect(popover).toBeHidden();
    await configBtn.dispatchEvent('click');
    await expect(popover).toBeVisible();

    // Verify configuration header
    await expect(popover.locator('h4')).toHaveText('Configuration');

    // Modify width input
    const widthInput = popover.locator('.config-control-group').filter({ hasText: 'Inline Size' }).locator('input[type="range"]');
    await widthInput.fill('450');
    await widthInput.dispatchEvent('input');

    await expect(firstWrapper).toHaveCSS('width', '450px');
  });
});

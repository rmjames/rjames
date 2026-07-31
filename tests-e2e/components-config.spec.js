import { test, expect } from '@playwright/test';

test.describe('Component Configuration Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the components lab page
    await page.goto('/lab/components.html');
  });

  test('should open the configuration popover when clicking the config button', async ({ page }) => {
    const configBtn = page.locator('.config-btn').first();
    const popover = page.locator('.config-popover').first();

    await expect(popover).toBeHidden();

    // Popover click sometimes needs dispatchEvent in webkit/chromium headless mode
    await configBtn.dispatchEvent('click');

    await expect(popover).toBeVisible();

    // Check if header exists
    await expect(popover.locator('h4')).toHaveText('Configuration');
  });

  test('should update component styles when modifying a control', async ({ page }) => {
    const wrapper = page.locator('.component-wrapper').first();
    const configBtn = wrapper.locator('.config-btn');
    const popover = page.locator('.config-popover').first();

    await configBtn.dispatchEvent('click');

    // Ensure popover is visible before interacting
    await expect(popover).toBeVisible();

    // Find the 'Inline Size' range input
    const widthInput = popover.locator('.config-control-group').filter({ hasText: 'Inline Size' }).locator('input[type="range"]');

    // Set a new width value
    await widthInput.fill('400');
    // Dispatch input event to trigger the JS logic
    await widthInput.dispatchEvent('input');

    // Verify the inline style was updated
    await expect(wrapper).toHaveCSS('width', '400px');

    // Verify the value display column was updated
    const valueDisplay = popover.locator('.config-control-group').filter({ hasText: 'Inline Size' }).locator('.config-control-value');
    await expect(valueDisplay).toHaveText('400px');
  });

  test('should apply active focus and background blur states when opened', async ({ page }) => {
    const wrapper = page.locator('.component-wrapper').first();
    const configBtn = wrapper.locator('.config-btn');
    const grid = page.locator('.components-grid');

    // Initially neither should have the active classes
    await expect(wrapper).not.toHaveClass(/is-configuring/);
    await expect(grid).not.toHaveClass(/has-active-config/);

    // Open the popover
    await configBtn.dispatchEvent('click');
    await expect(page.locator('.config-popover').first()).toBeVisible();

    // Verify the classes were applied
    await expect(wrapper).toHaveClass(/is-configuring/);
    await expect(grid).toHaveClass(/has-active-config/);

    // Verify the blur effect is applied to OTHER wrappers
    const secondWrapper = page.locator('.component-wrapper').nth(1);
    await expect(secondWrapper).toHaveCSS('opacity', '0.4');
    await expect(secondWrapper).toHaveCSS('filter', 'blur(4px)');

    // Verify the outline is applied to the ACTIVE wrapper
    await expect(wrapper).toHaveCSS('outline-style', 'solid');
    await expect(wrapper).toHaveCSS('outline-width', '2px');
    await expect(wrapper).toHaveCSS('outline-color', /oklch\(0\.73296 0\.158839 37\.5332\)|rgb\(244, 155, 62\)/); // --orange-3 fallback value usually computed

    // Close the popover
    const closeBtn = page.locator('.config-popover').first().locator('.config-popover-close');
    await closeBtn.dispatchEvent('click');

    // Verify the classes were removed
    await expect(wrapper).not.toHaveClass(/is-configuring/);
    await expect(grid).not.toHaveClass(/has-active-config/);
  });
});
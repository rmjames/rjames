import { test, expect } from '@playwright/test';

test('Resume expands details on print', async ({ page }) => {
  await page.goto('/resume.html');
  await page.waitForLoadState('networkidle');

  // Verify initial state: at least one detail is open, but they have name="job"
  const details = page.locator('details.job');
  const count = await details.count();
  expect(count).toBeGreaterThan(0);

  // Check initial state: all should have name="job"
  for (let i = 0; i < count; ++i) {
    await expect(details.nth(i)).toHaveAttribute('name', 'job');
  }

  // Emulate beforeprint
  await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeprint'));
  });

  // Verify they are all open and name is removed
  for (let i = 0; i < count; ++i) {
    await expect(details.nth(i)).toHaveAttribute('open', '');
    await expect(details.nth(i)).not.toHaveAttribute('name');
  }

  // Emulate afterprint
  await page.evaluate(() => {
    window.dispatchEvent(new Event('afterprint'));
  });

  // Verify name is restored
  for (let i = 0; i < count; ++i) {
    await expect(details.nth(i)).toHaveAttribute('name', 'job');
  }
});

import { test, expect } from "@playwright/test";

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Robert James/);
});

test('header navigation to resume page', async ({ page }) => {
  await page.goto('/');

  // Click the resume link.
  await page.getByRole('link', { name: 'resume' }).click();

  // Expects the URL to contain resume.html.
  await expect(page).toHaveURL(/.*resume.html/);
});

test.describe('Work Section Popovers', () => {
  const brands = [
    'SBE',
    'Guardian',
    'MacMillan',
    'Weber Shandwick',
    'Royal Caribbean',
    'Microsoft',
    'Bank of America',
    'Corteva',
  ];

  for (const brand of brands) {
    test(`clicking ${brand} button shows popover`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: brand }).click();
      const popoverId = brand.toLowerCase().replace(/ /g, '-') + '-popover';
      const popover = page.locator(`#${popoverId}`);
      await expect(popover).toBeVisible();
    });
  }
});

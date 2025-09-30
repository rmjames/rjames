import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Robert James/);
});

test('resume link', async ({ page }) => {
  await page.goto('/');

  // Click the resume link.
  await page.getByRole('link', { name: 'resume' }).click();

  // Expects the URL to contain resume.html.
  await expect(page).toHaveURL(/.*resume.html/);
});
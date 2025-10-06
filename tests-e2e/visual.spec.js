import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test('Home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot();
  });

  test('Resume page', async ({ page }) => {
    await page.goto('/resume.html');
    await expect(page).toHaveScreenshot();
  });

  test('Lab page', async ({ page }) => {
    await page.goto('/lab.html');
    await expect(page).toHaveScreenshot();
  });

  test('Pattern Library page', async ({ page }) => {
    await page.goto('/pattern-library.html');
    await expect(page).toHaveScreenshot();
  });
});
import { test, expect } from '@playwright/test';

test.describe('UX Enhancements', () => {
  test('Home page has current page indicator', async ({ page }) => {
    await page.goto('/');
    // The h1 link to "/"
    const currentLink = page.locator('h1 > a');
    await expect(currentLink).toHaveAttribute('href', '/');
    await expect(currentLink).toHaveAttribute('aria-current', 'page');
  });

  test('Lab page has current page indicators', async ({ page }) => {
    await page.goto('/lab.html');
    // Header link
    const headerLink = page.locator('header nav').getByRole('link', { name: 'Lab' });
    await expect(headerLink).toHaveAttribute('aria-current', 'page');
    // Footer link
    const footerLink = page.locator('footer').getByRole('link', { name: 'Lab' });
    await expect(footerLink).toHaveAttribute('aria-current', 'page');
  });

  test('Resume page has current page indicator', async ({ page }) => {
    await page.goto('/resume.html');
    const footerLink = page.locator('footer').getByRole('link', { name: 'Resume' });
    await expect(footerLink).toHaveAttribute('aria-current', 'page');
  });
});

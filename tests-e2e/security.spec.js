import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('index.html has Content-Security-Policy and Referrer-Policy', async ({ page }) => {
    await page.goto('/');

    // Check for Content-Security-Policy
    const csp = await page.$('meta[http-equiv="Content-Security-Policy"]');
    expect(csp).not.toBeNull();
    const cspContent = await csp.getAttribute('content');
    expect(cspContent).toContain("default-src 'self'");
    expect(cspContent).toContain("script-src 'self'");

    // Check for Referrer-Policy
    const referrer = await page.$('meta[name="referrer"]');
    expect(referrer).not.toBeNull();
    const referrerContent = await referrer.getAttribute('content');
    expect(referrerContent).toBe('strict-origin-when-cross-origin');
  });

  test('resume.html has Content-Security-Policy and Referrer-Policy', async ({ page }) => {
    await page.goto('/resume.html');

    const csp = await page.$('meta[http-equiv="Content-Security-Policy"]');
    expect(csp).not.toBeNull();
    const cspContent = await csp.getAttribute('content');
    expect(cspContent).toContain("default-src 'self'");
    // Resume uses Google Fonts
    expect(cspContent).toContain("https://fonts.googleapis.com");

    const referrer = await page.$('meta[name="referrer"]');
    expect(referrer).not.toBeNull();
    const referrerContent = await referrer.getAttribute('content');
    expect(referrerContent).toBe('strict-origin-when-cross-origin');
  });

  test('lab.html has Content-Security-Policy and Referrer-Policy', async ({ page }) => {
    await page.goto('/lab.html');

    const csp = await page.$('meta[http-equiv="Content-Security-Policy"]');
    expect(csp).not.toBeNull();
    const cspContent = await csp.getAttribute('content');
    expect(cspContent).toContain("default-src 'self'");
    // Lab uses iframes
    expect(cspContent).toContain("frame-src 'self'");

    const referrer = await page.$('meta[name="referrer"]');
    expect(referrer).not.toBeNull();
    const referrerContent = await referrer.getAttribute('content');
    expect(referrerContent).toBe('strict-origin-when-cross-origin');
  });

  test('No console errors related to CSP on index.html', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    // Wait for a bit to let analytics and other scripts run
    await page.waitForTimeout(1000);

    const cspErrors = errors.filter(e => e.includes('Content Security Policy'));
    expect(cspErrors).toEqual([]);
  });
});

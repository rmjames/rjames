import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test('should not load Google Analytics external script on localhost', async ({ page }) => {
    // Intercept network requests to check if GA is loaded
    let gaRequestMade = false;
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('google-analytics.com') || url.includes('googletagmanager.com')) {
        gaRequestMade = true;
      }
      route.continue();
    });

    await page.goto('/');

    // Wait a bit to ensure scripts have time to execute
    await page.waitForTimeout(1000);

    // Verify no network request was made
    expect(gaRequestMade, 'External GA script should not be requested').toBe(false);
  });

  test('should mock gtag and capture events', async ({ page }) => {
    await page.goto('/');

    // Wait for gtag to be defined
    await page.waitForFunction(() => typeof window.gtag === 'function');

    // Click an element with data-analytics-link
    const resumeLink = page.locator('footer a[data-analytics-link="Resume"]');
    await expect(resumeLink).toBeVisible();

    // Prevent navigation so we can inspect dataLayer on the current page
    await page.evaluate(() => {
        const link = document.querySelector('footer a[data-analytics-link="Resume"]');
        if (link) {
            link.addEventListener('click', (e) => e.preventDefault());
        }
    });

    await resumeLink.click();

    // Wait for event to appear in dataLayer
    await page.waitForFunction(() => {
        return window.dataLayer && window.dataLayer.some(item => {
            // Handle both Arguments object (converted to array) and standard arrays
            // The mock pushes 'arguments', which acts like an array
            return item[0] === 'event' && item[1] === 'click';
        });
    }, null, { timeout: 5000 });

    // Check dataLayer content
    const dataLayer = await page.evaluate(() => window.dataLayer);

    // We expect at least one event in dataLayer (likely "click")
    const clickEvent = dataLayer.find(item => item[0] === 'event' && item[1] === 'click');

    expect(clickEvent, 'Click event should be pushed to dataLayer').toBeTruthy();
    expect(clickEvent[2].event_label).toBe('Resume');
  });
});

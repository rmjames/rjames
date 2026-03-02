import { test, expect } from '@playwright/test';

test.describe('Service Worker Caching Security', () => {
  test('should not cache 404 responses (or HTML fallbacks for assets)', async ({ page, context }) => {
    await page.goto('/');

    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.active?.state === 'activated';
    });

    const missingUrl = '/images/missing-repro.png';

    // 2. Perform initial fetch and inspect it
    const initialResult = await page.evaluate(async (url) => {
      try {
        const res = await fetch(url);
        // Ensure the server actually returned 200 HTML (SPA fallback)
        // so we know we are testing the anti-poisoning logic.
        return {
          status: res.status,
          contentType: res.headers.get('content-type'),
        };
      } catch (e) {
        return { error: e.toString() };
      }
    }, missingUrl);

    console.log('Initial Fetch Result (Missing Image):', initialResult);

    // 3. Go offline
    await context.setOffline(true);

    // 4. Request again
    let fetchError;
    let fetchStatus;

    try {
      fetchStatus = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return res.status;
      }, missingUrl);
    } catch (e) {
      fetchError = e;
    }

    // Expect fail (not cached)
    expect(fetchError, `Expected fetch to fail but got status ${fetchStatus}`).toBeDefined();
  });

  test('should cache valid HTML files (Network First strategy)', async ({ page, context }) => {
    await page.goto('/');

    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.active?.state === 'activated';
    });

    // Use a file that is NOT in assetsToCache to test runtime caching
    const validHtmlUrl = '/lab/media-player-inline.html';

    // 1. Fetch online to trigger caching
    const statusOnline = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return res.status;
    }, validHtmlUrl);
    expect(statusOnline).toBe(200);

    // 2. Go offline
    await context.setOffline(true);

    // 3. Fetch offline -> Should succeed (cached)
    const statusOffline = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return res.status;
    }, validHtmlUrl);

    expect(statusOffline).toBe(200);
  });
});

import { test, expect } from "@playwright/test";

test.describe("Visual Regression Testing", () => {
  test("Home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot();
  });

  test("Resume page", async ({ page }) => {
    await page.goto("/resume.html");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot();
  });

  test("Lab page", async ({ page }) => {
    await page.goto("/lab.html");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot();
  });

  test("Pattern Library page", async ({ page }) => {
    await page.goto("/pattern-library.html");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot();
  });

  test("Dark and Light Themes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test dark mode
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page).toHaveScreenshot("home-dark.png");

    // Test light mode
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page).toHaveScreenshot("home-light.png");
  });
});

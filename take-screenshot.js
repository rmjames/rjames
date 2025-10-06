const { chromium } = require("playwright");
const { exec } = require("child_process");
const path = require("path");

const PORT = 8080;
const URL = `http://localhost:${PORT}`;
const SCREENSHOT_PATH = "sbe-popover-screenshot.png";

(async () => {
  let server;
  let browser;
  try {
    // Start a simple web server
    const projectRoot = path.resolve(__dirname);
    server = exec(`npx http-server -p ${PORT} -c-1`, { cwd: projectRoot });
    console.log(`Server started at ${URL}`);

    // Wait a bit for the server to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Launch the browser
    browser = await chromium.launch();
    const page = await browser.newPage();

    // Navigate to the page
    await page.goto(URL);
    console.log("Navigated to page.");

    // Click the button to show the popover
    const buttonSelector = 'button[popovertarget="sbe-popover"]';
    await page.waitForSelector(buttonSelector, { state: "visible" });
    await page.click(buttonSelector);
    console.log("Clicked the SBE button.");

    // Wait for the popover to be visible and animations to complete
    const popoverSelector = "#sbe-popover";
    await page.waitForSelector(popoverSelector, { state: "visible" });
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait for CSS transition
    console.log("Popover is visible.");

    // Take a screenshot of the popover element
    const popover = await page.$(popoverSelector);
    if (popover) {
      await popover.screenshot({ path: SCREENSHOT_PATH });
      console.log(`Screenshot saved to ${path.resolve(SCREENSHOT_PATH)}`);
    } else {
      throw new Error("Could not find the popover element to screenshot.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
      console.log("Browser closed.");
    }
    if (server) {
      server.kill();
      console.log("Server stopped.");
    }
  }
})();

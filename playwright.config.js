const { defineConfig } = require('@playwright/test');

const isCi = !!process.env.CI;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  // HTML report must use open: 'never' in CI or the folder is often missing on Linux runners.
  // Reporters are defined here (not only via CLI) so outputFolder is reliable.
  reporter: isCi
    ? [
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['allure-playwright', { outputFolder: 'allure-results' }],
        ['github'],
        ['line'],
      ]
    : [
        ['list'],
        ['allure-playwright', { outputFolder: 'allure-results' }],
      ],
  use: {
    headless: true,
    // Fixed layout + recording size so traces/videos aren’t tiny or oddly scaled
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    screenshot: 'only-on-failure',
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 },
    },
    ...(isCi ? { trace: 'retain-on-failure' } : {}),
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});

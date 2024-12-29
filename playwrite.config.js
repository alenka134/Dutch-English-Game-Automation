const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000, // 30 seconds timeout for each test
  retries: 1, // Retry on failure
  use: {
    headless: true, // Run tests in headless mode
    screenshot: 'only-on-failure', // Take screenshots only on failures
    video: 'retain-on-failure', // Record videos for failed tests
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
});

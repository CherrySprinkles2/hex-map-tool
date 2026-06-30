import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  retries: 1,
  // Cap concurrency: the default (half of CPU cores) spins up far too many browsers
  // on high-core machines, saturating CPU/RAM. 4 local browsers is plenty.
  workers: process.env.CI ? 2 : 4,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    // Record video/trace only when a test is retried after failing, not for every
    // test — 'retain-on-failure' records always and just discards on success.
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BROWSER: 'none',
    },
  },
});

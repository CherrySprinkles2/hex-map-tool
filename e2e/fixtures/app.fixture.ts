import { test as base, expect, type Page } from '@playwright/test';

type AppFixtures = {
  appPage: Page;
};

export const test = base.extend<AppFixtures>({
  appPage: async ({ page }, use) => {
    await page.goto('/');
    // Clear all localStorage so each test starts with a clean slate
    await page.evaluate(() => {
      return localStorage.clear();
    });
    await page.reload();
    // Wait for the HomeScreen to be ready
    await page.waitForSelector('[data-testid="new-map-card"]', { timeout: 15_000 });
    await use(page);
  },
});

export { expect };

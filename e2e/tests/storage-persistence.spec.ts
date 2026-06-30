import { test, expect } from '../fixtures/app.fixture';
import { APP_BASE } from '../helpers/base-path';
import { readStorage } from '../helpers/storage';
import { installStorageStub, persistCalls } from '../helpers/storagePersistenceStub';

const SEEN_KEY = 'hex-map-tool-persistence-prompt-seen';

// The fixture pre-sets the "seen" flag to keep the explainer out of unrelated tests.
// These tests clear it (on the live page; the change survives the next reload) so the
// first-visit modal can be exercised.
async function clearSeen(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate((key: string) => {
    return localStorage.removeItem(key);
  }, SEEN_KEY);
}

test.describe('Persistent storage — first-visit explainer', () => {
  test('appears on first load on the home screen', async ({ appPage }) => {
    await installStorageStub(appPage);
    await clearSeen(appPage);
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');
    await expect(appPage.getByTestId('persistence-intro-modal')).toBeVisible();
  });

  test('appears on a non-home route too (route-independent)', async ({ appPage }) => {
    await installStorageStub(appPage);
    await clearSeen(appPage);
    await appPage.goto(APP_BASE + '/help');
    await expect(appPage.getByTestId('persistence-intro-modal')).toBeVisible();
  });

  test('Enable requests persistence, marks seen, and does not reappear', async ({ appPage }) => {
    await installStorageStub(appPage);
    await clearSeen(appPage);
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    const modal = appPage.getByTestId('persistence-intro-modal');
    await expect(modal).toBeVisible();
    await appPage.getByTestId('persistence-intro-enable-btn').click();
    await expect(modal).toHaveCount(0);

    expect(await persistCalls(appPage)).toBe(1);
    expect(await readStorage(appPage, SEEN_KEY)).toBe('true');

    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');
    await appPage.waitForTimeout(700);
    await expect(appPage.getByTestId('persistence-intro-modal')).toHaveCount(0);
  });

  test('Not now marks seen without requesting persistence', async ({ appPage }) => {
    await installStorageStub(appPage);
    await clearSeen(appPage);
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    await expect(appPage.getByTestId('persistence-intro-modal')).toBeVisible();
    await appPage.getByTestId('persistence-intro-dismiss-btn').click();
    await expect(appPage.getByTestId('persistence-intro-modal')).toHaveCount(0);

    expect(await persistCalls(appPage)).toBe(0);
    expect(await readStorage(appPage, SEEN_KEY)).toBe('true');

    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');
    await appPage.waitForTimeout(700);
    await expect(appPage.getByTestId('persistence-intro-modal')).toHaveCount(0);
  });

  test('does not appear when storage is already persisted', async ({ appPage }) => {
    await installStorageStub(appPage, { persisted: true });
    await clearSeen(appPage);
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');
    await appPage.waitForTimeout(700);
    await expect(appPage.getByTestId('persistence-intro-modal')).toHaveCount(0);
  });

  test('does not appear when the API is unsupported', async ({ appPage }) => {
    await installStorageStub(appPage, { unsupported: true });
    await clearSeen(appPage);
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');
    await appPage.waitForTimeout(700);
    await expect(appPage.getByTestId('persistence-intro-modal')).toHaveCount(0);
  });
});

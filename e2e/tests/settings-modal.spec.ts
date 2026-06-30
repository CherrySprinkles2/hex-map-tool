import { readFileSync } from 'fs';
import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { readStorage, getMapIndex, readStorageJson } from '../helpers/storage';
import { installStorageStub, persistCalls } from '../helpers/storagePersistenceStub';

// Open the in-map Settings modal via the gear menu → "Settings" item.
async function openSettingsModal(page: import('@playwright/test').Page): Promise<void> {
  await page.getByLabel('Settings').click();
  await page.getByTestId('settings-btn').click();
  await page.getByTestId('settings-modal').waitFor();
}

test.describe('Settings modal', () => {
  test('opens from the gear menu', async ({ appPage }) => {
    await installStorageStub(appPage, { seen: true });
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    await openSettingsModal(appPage);

    await expect(appPage.getByTestId('settings-modal')).toBeVisible();
    await expect(appPage.getByTestId('storage-section')).toBeVisible();
    await expect(appPage.getByTestId('orientation-section')).toBeVisible();
    await expect(appPage.getByTestId('language-section')).toBeVisible();
    await expect(appPage.getByTestId('bug-report-section')).toBeVisible();
  });

  test('bug report button downloads an anonymised diagnostic JSON', async ({ appPage }) => {
    await installStorageStub(appPage, { seen: true });
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0); // dispatches importTiles/importArmies/... → action log
    await openSettingsModal(appPage);

    const [download] = await Promise.all([
      appPage.waitForEvent('download'),
      appPage.getByTestId('create-bug-report-btn').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^hex-map-tool-bug-report-.*\.json$/);

    const path = await download.path();
    const report = JSON.parse(readFileSync(path, 'utf-8'));

    expect(report.schema).toBe('hex-map-tool-bug-report/2');
    expect(typeof report.environment.userAgent).toBe('string');
    expect(report.render.mainPaints).toHaveProperty('last1s');
    expect(Array.isArray(report.actions.log)).toBe(true);
    expect(report.actions.count).toBeGreaterThan(0);

    // Counts are anonymised into range buckets, not exact numbers.
    expect(typeof report.app.tileCount).toBe('string');
    expect(report.app.tileCount).toMatch(/^(\d+|\d+-\d+|\d+\+)$/);
    // Map name is a token (starts with ~), never the real name.
    expect(report.app.mapName).toMatch(/^~/);

    // The importTiles payload summary keeps its shape but is anonymised: the size
    // is a bucket string and the keys are tokens, never real tile coordinates.
    const importTiles = report.actions.log.find((e: { type: string }) => {
      return e.type === 'tiles/importTiles';
    });
    expect(importTiles).toBeTruthy();
    expect(importTiles.summary.kind).toBe('object');
    expect(typeof importTiles.summary.size).toBe('string');
    for (const key of importTiles.summary.keys) {
      expect(key).toMatch(/^~/); // tokenised, not "q,r" coordinates
    }
  });

  test('storage section shows status + usage and enables persistence', async ({ appPage }) => {
    // Usage reflects the app's own localStorage; seed ~1.5 MB of it deterministically.
    await installStorageStub(appPage, { seen: true, seedUsageBytes: 1572864 });
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    await openSettingsModal(appPage);

    await expect(appPage.getByTestId('storage-section-status')).toContainText(/not persisted/i);
    await expect(appPage.getByTestId('storage-section-usage')).toContainText('1.5 MB');

    await appPage.getByTestId('storage-section-enable-btn').click();
    expect(await persistCalls(appPage)).toBe(1);

    await expect(appPage.getByTestId('storage-section-status')).toContainText(
      /saved on this device/i
    );
    await expect(appPage.getByTestId('storage-section-enable-btn')).toHaveCount(0);
  });

  test('storage section shows persisted state with no enable button', async ({ appPage }) => {
    await installStorageStub(appPage, { persisted: true, seen: true, seedUsageBytes: 1572864 });
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    await openSettingsModal(appPage);

    await expect(appPage.getByTestId('storage-section-status')).toContainText(
      /saved on this device/i
    );
    await expect(appPage.getByTestId('storage-section-usage')).toContainText('1.5 MB');
    await expect(appPage.getByTestId('storage-section-enable-btn')).toHaveCount(0);
  });

  test('orientation section switches the map orientation', async ({ appPage }) => {
    await installStorageStub(appPage, { seen: true });
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    // A saved map is needed so the orientation change persists to its data key.
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    await openSettingsModal(appPage);

    await appPage.getByTestId('orientation-flat-btn').click();

    const index = await getMapIndex(appPage);
    const id = index[0]?.id;
    expect(id).toBeTruthy();
    await expect
      .poll(async () => {
        const data = await readStorageJson<{ orientation?: string }>(
          appPage,
          `hex-map-tool-data-${id}`
        );
        return data?.orientation ?? null;
      })
      .toBe('flat-top');
  });

  test('language section switches the UI language', async ({ appPage }) => {
    await installStorageStub(appPage, { seen: true });
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    await openSettingsModal(appPage);

    await appPage.getByTestId('language-fi-btn').click();
    await expect
      .poll(() => {
        return readStorage(appPage, 'i18nextLng');
      })
      .toMatch(/^fi/);
  });
});

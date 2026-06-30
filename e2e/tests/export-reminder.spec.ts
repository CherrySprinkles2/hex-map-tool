import { test, expect } from '../fixtures/app.fixture';
import { APP_BASE } from '../helpers/base-path';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { readStorageJson, getMapIndex } from '../helpers/storage';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const daysAgo = (n: number): string => {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
};

const SEED_TILE = {
  q: 0,
  r: 0,
  terrain: 'grass',
  hasRiver: false,
  hasRoad: false,
  riverBlocked: [],
  roadBlocked: [],
  hasTown: false,
  townName: '',
  portBlocked: [],
  notes: '',
  factionId: null,
  forageLevel: 0,
};

/**
 * Seed a saved map directly into localStorage with the given index timestamps,
 * then deep-link to it. Returns the map id and slug.
 */
async function seedAndOpen(
  page: import('@playwright/test').Page,
  name: string,
  entry: { updatedAt: string; createdAt?: string; lastExportedAt?: string }
): Promise<{ id: string; slug: string }> {
  const id = `map_seed_${name.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  await page.evaluate(
    ({ id: _id, name: _name, entry: _entry, tile }) => {
      localStorage.setItem(
        'hex-map-tool-index',
        JSON.stringify([{ id: _id, name: _name, ..._entry }])
      );
      localStorage.setItem(
        'hex-map-tool-data-' + _id,
        JSON.stringify({ version: 2, tiles: { '0,0': tile }, armies: {}, factions: [] })
      );
    },
    { id, name, entry, tile: SEED_TILE }
  );

  await page.goto(APP_BASE + '/map/' + slug);
  await page.waitForSelector('[data-testid="back-btn"]');
  return { id, slug };
}

test.describe('Export reminder', () => {
  test('shows the reminder when a map is overdue for a backup', async ({ appPage }) => {
    await seedAndOpen(appPage, 'Overdue Map', {
      lastExportedAt: daysAgo(8),
      updatedAt: daysAgo(1),
    });
    await expect(appPage.getByTestId('export-reminder-modal')).toBeVisible();
  });

  test('does not show when the map was recently exported', async ({ appPage }) => {
    await seedAndOpen(appPage, 'Fresh Map', {
      lastExportedAt: daysAgo(1),
      updatedAt: daysAgo(0),
    });
    // Give the deferred evaluation a chance to run, then assert it stays hidden.
    await appPage.waitForTimeout(200);
    await expect(appPage.getByTestId('export-reminder-modal')).toHaveCount(0);
  });

  test('"Remind me later" snoozes — closes and does not reappear on re-open', async ({
    appPage,
  }) => {
    const { slug, id } = await seedAndOpen(appPage, 'Snooze Map', {
      lastExportedAt: daysAgo(9),
      updatedAt: daysAgo(1),
    });

    const modal = appPage.getByTestId('export-reminder-modal');
    await expect(modal).toBeVisible();
    await appPage.getByTestId('export-reminder-snooze-btn').click();
    await expect(modal).toHaveCount(0);

    // A snooze timestamp ~7 days out is written for this map.
    const snooze = await readStorageJson<Record<string, string>>(
      appPage,
      'hex-map-tool-export-reminder-snooze'
    );
    expect(snooze?.[id]).toBeTruthy();
    const until = new Date(snooze![id]).getTime();
    expect(until).toBeGreaterThan(Date.now() + SEVEN_DAYS - 60_000);

    // Re-opening within the snooze window does not show it again.
    await appPage.goto(APP_BASE + '/map/' + slug);
    await appPage.waitForSelector('[data-testid="back-btn"]');
    await appPage.waitForTimeout(200);
    await expect(appPage.getByTestId('export-reminder-modal')).toHaveCount(0);
  });

  test('"Export now" downloads a backup, stamps the export, and clears the reminder', async ({
    appPage,
  }) => {
    const { slug, id } = await seedAndOpen(appPage, 'Backup Map', {
      lastExportedAt: daysAgo(10),
      updatedAt: daysAgo(2),
    });

    await expect(appPage.getByTestId('export-reminder-modal')).toBeVisible();
    const [download] = await Promise.all([
      appPage.waitForEvent('download'),
      appPage.getByTestId('export-reminder-export-btn').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    await expect(appPage.getByTestId('export-reminder-modal')).toHaveCount(0);

    // lastExportedAt is bumped to ~now in the index.
    const index = await getMapIndex(appPage);
    const entry = index.find((m) => {
      return m.id === id;
    }) as { lastExportedAt?: string } | undefined;
    expect(entry?.lastExportedAt).toBeTruthy();
    expect(new Date(entry!.lastExportedAt!).getTime()).toBeGreaterThan(Date.now() - 60_000);

    // Re-opening no longer nags (nothing changed since the fresh export).
    await appPage.goto(APP_BASE + '/map/' + slug);
    await appPage.waitForSelector('[data-testid="back-btn"]');
    await appPage.waitForTimeout(200);
    await expect(appPage.getByTestId('export-reminder-modal')).toHaveCount(0);
  });

  test('is never shown for an unsaved example map', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    await appPage.waitForTimeout(200);
    await expect(appPage.getByTestId('export-reminder-modal')).toHaveCount(0);
  });
});

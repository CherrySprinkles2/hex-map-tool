import { test, expect } from '../fixtures/app.fixture';
import type { Page } from '@playwright/test';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';

/** Open the PNG export modal — toolbar button on desktop, settings sheet on mobile. */
const openExportPngModal = async (appPage: Page, isMobile: boolean): Promise<void> => {
  if (isMobile) {
    await appPage.getByLabel('Settings').click();
    await appPage.getByTestId('mobile-export-png-btn').click();
  } else {
    await appPage.getByTestId('export-png-btn').click();
  }
  await appPage.waitForSelector('[data-testid="export-png-download-btn"]');
};

test.describe('PNG export', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    // New maps start empty — place one tile so there is something to export.
    const editor = new EditorPage(appPage);
    await editor.clickGhost(0, 0);
  });

  test('entire-map export downloads a .png file', async ({ appPage, isMobile }) => {
    await openExportPngModal(appPage, isMobile);
    await appPage.getByTestId('export-png-area-full').click();
    const [download] = await Promise.all([
      appPage.waitForEvent('download'),
      appPage.getByTestId('export-png-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test('current-view export downloads a .png file', async ({ appPage, isMobile }) => {
    await openExportPngModal(appPage, isMobile);
    await appPage.getByTestId('export-png-area-viewport').click();
    const [download] = await Promise.all([
      appPage.waitForEvent('download'),
      appPage.getByTestId('export-png-download-btn').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test('faction borders checkbox appears only when factions exist', async ({
    appPage,
    isMobile,
  }) => {
    await openExportPngModal(appPage, isMobile);
    await expect(appPage.getByTestId('export-png-borders-checkbox')).toHaveCount(0);
  });
});

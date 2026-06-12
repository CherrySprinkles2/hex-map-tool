import { test, expect } from '../fixtures/app.fixture';
import type { Page } from '@playwright/test';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { FactionsPanelPage } from '../pages/FactionsPanel.page';

/** Enter faction mode and activate the brush for the first real faction. */
const selectFirstFactionBrush = async (appPage: Page): Promise<void> => {
  await appPage.getByTestId('map-mode-faction').click();
  await appPage
    .locator('[data-testid^="faction-brush-"]:not([data-testid="faction-brush-unassigned"])')
    .first()
    .click();
};

// All tests are desktop-only: the factions side panel overlaps the map-mode
// toggle on mobile viewports, and the unassign test depends on right-click.
test.describe('Faction mode', () => {
  test.beforeEach(async ({ appPage, isMobile }) => {
    test.skip(isMobile, 'Faction-mode flows are desktop-only (panel overlap / right-click)');
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const factions = new FactionsPanelPage(appPage);
    await factions.openPanel();
    await factions.addFaction();
  });

  test('clicking a tile with a faction brush assigns the faction', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    await selectFirstFactionBrush(appPage);
    expect(await editor.getTileFaction(0, 0)).toBeNull();
    await editor.clickTile(0, 0);
    expect(await editor.getTileFaction(0, 0)).not.toBeNull();
  });

  test('right-click in faction mode unassigns the faction but keeps the tile', async ({
    appPage,
  }) => {
    const editor = new EditorPage(appPage);
    await selectFirstFactionBrush(appPage);
    await editor.clickTile(0, 0);
    expect(await editor.getTileFaction(0, 0)).not.toBeNull();

    await editor.rightClickTile(0, 0);
    expect(await editor.tileExists(0, 0)).toBe(true);
    expect(await editor.getTileFaction(0, 0)).toBeNull();
  });

  test('right-click on an unassigned tile in faction mode does nothing', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    // Create the tile in terrain mode first (new maps start empty).
    await editor.clickGhost(0, 0);
    await appPage.getByTestId('map-mode-faction').click();
    await editor.rightClickTile(0, 0);
    expect(await editor.tileExists(0, 0)).toBe(true);
  });

  test('borders-only toggle flips on and off', async ({ appPage }) => {
    await appPage.getByTestId('map-mode-faction').click();
    const toggle = appPage.getByTestId('faction-borders-toggle');
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });
});

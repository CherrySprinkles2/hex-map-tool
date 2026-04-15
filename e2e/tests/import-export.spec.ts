import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';

test.describe('Import / Export', () => {
  test.beforeEach(async ({ appPage }) => {
    // Open the example map so there's content to export
    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
  });

  test('export produces a JSON download with the correct envelope shape', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const { suggestedFilename, bodyText } = await editor.exportMap();

    expect(suggestedFilename).toMatch(/\.json$/);
    const json = JSON.parse(bodyText) as Record<string, unknown>;
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('tiles');
    expect(json).toHaveProperty('armies');
    expect(json).toHaveProperty('factions');
  });

  test('exported JSON has tile data', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const { bodyText } = await editor.exportMap();
    const json = JSON.parse(bodyText) as { tiles: Record<string, unknown> };
    expect(Object.keys(json.tiles).length).toBeGreaterThan(0);
  });

  test('importing a valid JSON file adds a new map card on the home screen', async ({
    appPage,
    isMobile,
  }) => {
    const editor = new EditorPage(appPage);

    // Export the example map to get a valid JSON payload
    const { bodyText } = await editor.exportMap();
    const importData = JSON.parse(bodyText) as Record<string, unknown>;
    importData.name = 'Imported Map';
    const importJson = JSON.stringify(importData);

    // Go back to the home screen and import
    await editor.goBack();
    const home = new HomeScreenPage(appPage);
    await home.importMap(importJson, isMobile);

    // A card with the imported name should appear in the map list
    await expect(appPage.getByText('Imported Map')).toBeVisible();
  });

  test('importing with a duplicate name appends (2)', async ({ appPage, isMobile }) => {
    const editor = new EditorPage(appPage);
    const { bodyText } = await editor.exportMap();
    const importData = JSON.parse(bodyText) as Record<string, unknown>;

    // Create and save a map named 'Dupe Test'
    await editor.goBack();
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    await editor.renameMap('Dupe Test');
    await editor.goBack();

    // Import a file with the same name — should become 'Dupe Test (2)'
    importData.name = 'Dupe Test';
    await home.importMap(JSON.stringify(importData), isMobile);

    await expect(appPage.getByText('Dupe Test (2)')).toBeVisible();
  });
});

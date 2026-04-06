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

  test('importing a valid JSON file loads the map', async ({ appPage }) => {
    const editor = new EditorPage(appPage);

    // First export so we have a valid file
    const { bodyText } = await editor.exportMap();

    // Modify name to check import
    const importData = JSON.parse(bodyText) as Record<string, unknown>;
    importData.name = 'Imported Map';
    const importJson = JSON.stringify(importData);

    // Navigate to a fresh map
    await editor.goBack();
    const home = new HomeScreenPage(appPage);
    await home.createMap();

    // Trigger import via file input
    await editor.openSettings();
    const [fileChooser] = await Promise.all([
      appPage.waitForEvent('filechooser'),
      appPage.getByTestId('import-json-btn').click(),
    ]);
    await fileChooser.setFiles({
      name: 'import.json',
      mimeType: 'application/json',
      buffer: Buffer.from(importJson),
    });

    // Map name input should update
    await expect(appPage.getByTestId('map-name-input')).toHaveValue('Imported Map');
  });

  test('importing with a duplicate name appends (2)', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const { bodyText } = await editor.exportMap();
    const importData = JSON.parse(bodyText) as Record<string, unknown>;

    // Go back and create a REAL saved map (with a generated ID) named 'Dupe Test'
    await editor.goBack();
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    // Rename — this map has a real ID so the name is saved to the localStorage index
    await editor.renameMap('Dupe Test');
    await editor.goBack();

    // Create a second map and import a file with the same name
    await home.createMap();
    importData.name = 'Dupe Test';

    await editor.openSettings();
    const [fileChooser] = await Promise.all([
      appPage.waitForEvent('filechooser'),
      appPage.getByTestId('import-json-btn').click(),
    ]);
    await fileChooser.setFiles({
      name: 'import.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(importData)),
    });

    await expect(appPage.getByTestId('map-name-input')).toHaveValue(/\(2\)$/);
  });
});

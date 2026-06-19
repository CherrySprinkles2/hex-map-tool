import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { TileEditPanelPage } from '../pages/TileEditPanel.page';
import { TerrainConfigPanel } from '../pages/TerrainConfigPanel.page';
import { readStorageJson, getMapIndex } from '../helpers/storage';

interface SavedData {
  terrainConfig?: { riverTypes?: Array<{ name: string }> };
}

test.describe('River & Road Varieties', () => {
  test('adding a river style persists it and exposes a paint brush', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const [{ id: mapId }] = await getMapIndex(appPage);

    const config = new TerrainConfigPanel(appPage);
    await config.open();
    // Only the seeded default river style exists initially.
    expect(await config.riverRowCount()).toBe(1);

    await config.addRiverStyle('Stream');
    expect(await config.riverRowCount()).toBe(2);

    // The new style is persisted to the map's data key.
    await expect
      .poll(async () => {
        const data = await readStorageJson<SavedData>(appPage, `hex-map-tool-data-${mapId}`);
        return (data?.terrainConfig?.riverTypes ?? []).map((v) => {
          return v.name;
        });
      })
      .toContain('Stream');

    await config.close();

    // The new style shows up as a paint brush in the tile panel.
    const editor = new EditorPage(appPage);
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    await editor.clickGhost(ghost!.q, ghost!.r);

    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    await expect(appPage.getByRole('button', { name: 'Stream' })).toBeVisible();
  });
});

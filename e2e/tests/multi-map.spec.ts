import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { getMapIndex } from '../helpers/storage';

test.describe('Multi-Map', () => {
  test('two maps have independent tile data', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    const editor = new EditorPage(appPage);

    // Create map A and add a tile
    await home.createMap();
    await editor.renameMap('Map A');
    const ghostA = await editor.firstGhost();
    expect(ghostA).not.toBeNull();
    await editor.clickGhost(ghostA!.q, ghostA!.r);
    const countA = await editor.tileCount();

    // Go back and create map B (empty)
    await editor.goBack();
    await home.createMap();
    await editor.renameMap('Map B');
    const countB = await editor.tileCount();

    expect(countA).toBeGreaterThan(countB);
  });

  test('switching between maps restores correct tile state', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    const editor = new EditorPage(appPage);

    // Create Map A with a tile
    await home.createMap();
    await editor.renameMap('Switching A');
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    const { q, r } = ghost!;
    await editor.clickGhost(q, r);

    // Go back, create Map B (no tiles), go back
    await editor.goBack();
    await home.createMap();
    await editor.renameMap('Switching B');
    const countB = await editor.tileCount();
    expect(countB).toBe(0);

    // Go back and open Map A — tile should still be there
    await editor.goBack();
    await home.openMapByName('Switching A');
    expect(await editor.tileExists(q, r)).toBe(true);
  });

  test('deleting one map does not affect the other', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    const editor = new EditorPage(appPage);

    await home.createMap();
    await editor.renameMap('Keep Me');
    await editor.goBack();

    await home.createMap();
    await editor.renameMap('Delete Me');
    await editor.goBack();

    const index = await getMapIndex(appPage);
    const toDelete = index.find((m) => {
      return m.name === 'Delete Me';
    });
    expect(toDelete).toBeDefined();
    await home.deleteMapById(toDelete!.id);

    await expect(appPage.getByText('Keep Me').first()).toBeVisible();
    await expect(appPage.getByText('Delete Me')).not.toBeVisible();
  });

  test('opening an example does not create a localStorage index entry', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    const index = await getMapIndex(appPage);
    expect(index).toHaveLength(0);
  });

  test('saving a real map alongside an example keeps them separate', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    await editor.renameMap('Real Map');
    await editor.goBack();

    // Open example — should NOT add to index
    await home.openExampleByIndex(0);
    const index = await getMapIndex(appPage);
    expect(index).toHaveLength(1);
    expect(index[0].name).toBe('Real Map');
  });
});

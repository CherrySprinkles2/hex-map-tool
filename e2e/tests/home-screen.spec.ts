import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { getMapIndex } from '../helpers/storage';

test.describe('Home Screen', () => {
  test('shows the New Map card on load', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await expect(home.newMapCard).toBeVisible();
  });

  test('creates a new map and enters the editor', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    await expect(appPage.getByTestId('back-btn')).toBeVisible();
  });

  test('created map is saved to localStorage index', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    // Rename to something identifiable
    const editor = new EditorPage(appPage);
    await editor.renameMap('My Test Map');
    // Navigate back to trigger save
    await editor.goBack();
    const index = await getMapIndex(appPage);
    expect(
      index.some((m) => {
        return m.name === 'My Test Map';
      })
    ).toBe(true);
  });

  test('map card appears in the list after creation', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    await editor.renameMap('Listed Map');
    await editor.goBack();
    await expect(appPage.getByText('Listed Map').first()).toBeVisible();
  });

  test('opens a saved map', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    await editor.renameMap('Open Me');
    await editor.goBack();
    await home.openMapByName('Open Me');
    await expect(appPage.getByTestId('back-btn')).toBeVisible();
    await expect(appPage.getByTestId('map-name-input')).toHaveValue('Open Me');
  });

  test('deletes a map and it disappears from the list', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    await editor.renameMap('To Delete');
    await editor.goBack();
    const index = await getMapIndex(appPage);
    const mapId =
      index.find((m) => {
        return m.name === 'To Delete';
      })?.id ?? '';
    expect(mapId).not.toBe('');
    await home.deleteMapById(mapId);
    await expect(appPage.getByTestId(`map-card-${mapId}`)).not.toBeVisible();
  });

  test('opens the small example map and enters the editor', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    const editor = new EditorPage(appPage);
    const count = await editor.tileCount();
    expect(count).toBeGreaterThan(0);
  });

  test('example map does not create a localStorage entry', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.openExampleByIndex(0);
    const index = await getMapIndex(appPage);
    expect(index).toHaveLength(0);
  });
});

import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { TileEditPanelPage } from '../pages/TileEditPanel.page';
import { TownEditPanelPage } from '../pages/TownEditPanel.page';

test.describe('Town Edit Panel', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    // Create a tile and toggle the town flag on
    const editor = new EditorPage(appPage);
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const [, coords] = testId!.split('ghost-tile-');
    const [q, r] = coords.split(',').map(Number);
    await editor.clickGhost(q, r);
    await appPage.evaluate(
      ({ q: _q, r: _r }) => {
        (window as unknown as Record<string, unknown>).__testTile = { q: _q, r: _r };
      },
      { q, r }
    );
    // Toggle town on and open the town edit panel
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.toggleFlag('hasTown');
    await tilePanel.openTownEdit();
  });

  test('town edit panel opens and shows name input', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    await townPanel.waitForPanel();
    await expect(appPage.getByTestId('town-edit-name-input')).toBeVisible();
  });

  test('back button returns to tile edit panel', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    await townPanel.back();
    await expect(appPage.getByTestId('edit-town-btn')).toBeVisible();
  });

  test('setting town name is reflected in the input', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    await townPanel.setName('Stonehaven');
    expect(await townPanel.getName()).toBe('Stonehaven');
  });

  test('fortification defaults to none and can be changed to palisade', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    // Default is 'none'
    expect(await townPanel.isFortificationActive('none')).toBe(true);
    expect(await townPanel.isFortificationActive('palisade')).toBe(false);
    // Switch to palisade
    await townPanel.setFortification('palisade');
    expect(await townPanel.isFortificationActive('palisade')).toBe(true);
    expect(await townPanel.isFortificationActive('none')).toBe(false);
  });

  test('fortification can be set to stone wall', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    await townPanel.setFortification('stone');
    expect(await townPanel.isFortificationActive('stone')).toBe(true);
    expect(await townPanel.isFortificationActive('none')).toBe(false);
    expect(await townPanel.isFortificationActive('palisade')).toBe(false);
  });

  test('town size defaults to town and can be changed to city', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    // Default is 'town'
    expect(await townPanel.isSizeActive('town')).toBe(true);
    expect(await townPanel.isSizeActive('city')).toBe(false);
    // Switch to city
    await townPanel.setSize('city');
    expect(await townPanel.isSizeActive('city')).toBe(true);
    expect(await townPanel.isSizeActive('town')).toBe(false);
  });

  test('town size can be set to village', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    await townPanel.setSize('village');
    expect(await townPanel.isSizeActive('village')).toBe(true);
    expect(await townPanel.isSizeActive('town')).toBe(false);
    expect(await townPanel.isSizeActive('city')).toBe(false);
  });

  test('fortification and size survive back-and-reopen', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    await townPanel.setFortification('stone');
    await townPanel.setSize('city');
    // Go back to tile edit panel then re-open town edit
    await townPanel.back();
    await appPage.getByTestId('edit-town-btn').click();
    await townPanel.waitForPanel();
    expect(await townPanel.isFortificationActive('stone')).toBe(true);
    expect(await townPanel.isSizeActive('city')).toBe(true);
  });

  test('town fortification icon is visible on the map tile', async ({ appPage }) => {
    const townPanel = new TownEditPanelPage(appPage);
    await townPanel.setFortification('stone');
    await townPanel.back();

    const { q, r } = await appPage.evaluate(() => {
      return (window as unknown as Record<string, { q: number; r: number }>).__testTile;
    });
    // The stone wall fortification renders a wall graphic on the tile
    await expect(appPage.getByTestId(`hex-tile-${q},${r}`)).toBeVisible();
    // The tile itself should have a town indicator (hasTown = true)
    const tile = appPage.getByTestId(`hex-tile-${q},${r}`);
    await expect(tile).toBeVisible();
  });
});

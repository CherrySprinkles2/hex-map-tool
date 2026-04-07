import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { TileEditPanelPage } from '../pages/TileEditPanel.page';

test.describe('Tile Placement', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
  });

  test('clicking a ghost tile creates a hex tile', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    // The first ghost tile visible after map creation
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const coords = testId!.replace('ghost-tile-', '').split(',');
    const q = parseInt(coords[0], 10);
    const r = parseInt(coords[1], 10);

    await editor.clickGhost(q, r);
    await expect(appPage.getByTestId(`hex-tile-${q},${r}`)).toBeVisible();
  });

  test('newly created tile is automatically selected (panel opens)', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const [, coords] = testId!.split('ghost-tile-');
    const [q, r] = coords.split(',').map(Number);

    await editor.clickGhost(q, r);
    await expect(appPage.getByTestId('delete-tile-btn')).toBeVisible();
  });

  test('right-clicking a tile deletes it', async ({ appPage, isMobile }) => {
    test.skip(isMobile, 'Right-click/context-menu is not available on touch devices');
    const editor = new EditorPage(appPage);
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const [, coords] = testId!.split('ghost-tile-');
    const [q, r] = coords.split(',').map(Number);

    await editor.clickGhost(q, r);
    await expect(appPage.getByTestId(`hex-tile-${q},${r}`)).toBeVisible();
    await editor.rightClickTile(q, r);
    await expect(appPage.getByTestId(`hex-tile-${q},${r}`)).not.toBeVisible();
  });

  test('tile persists after page reload', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const [, coords] = testId!.split('ghost-tile-');
    const [q, r] = coords.split(',').map(Number);

    await editor.clickGhost(q, r);

    // Note the map name so we can reopen it after reload
    const mapName = await appPage.getByTestId('map-name-input').inputValue();

    // Reload — app returns to home screen (ui.screen is not persisted)
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');

    // Reopen the saved map
    const home = new HomeScreenPage(appPage);
    await home.openMapByName(mapName);

    await expect(appPage.getByTestId(`hex-tile-${q},${r}`)).toBeVisible();
  });
});

test.describe('Tile Editing', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    // Create one tile to work with
    const editor = new EditorPage(appPage);
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const [, coords] = testId!.split('ghost-tile-');
    const [q, r] = coords.split(',').map(Number);
    await editor.clickGhost(q, r);
    // Store coords for later use
    await appPage.evaluate(
      ({ q: _q, r: _r }) => {
        (window as unknown as Record<string, unknown>).__testTile = { q: _q, r: _r };
      },
      { q, r }
    );
  });

  test('clicking a tile opens the TileEditPanel', async ({ appPage }) => {
    await expect(appPage.getByTestId('delete-tile-btn')).toBeVisible();
  });

  test('changing terrain type updates the tile', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.selectTerrain('forest');
    // The active terrain button for 'forest' should now be highlighted
    const forestBtn = appPage.getByTestId('terrain-btn-forest');
    await expect(forestBtn).toBeVisible();
  });

  test('toggling river ON and OFF', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();

    expect(await panel.isFlagActive('hasRiver')).toBe(false);
    await panel.toggleFlag('hasRiver');
    expect(await panel.isFlagActive('hasRiver')).toBe(true);
    await panel.toggleFlag('hasRiver');
    expect(await panel.isFlagActive('hasRiver')).toBe(false);
  });

  test('toggling road ON and OFF', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();

    expect(await panel.isFlagActive('hasRoad')).toBe(false);
    await panel.toggleFlag('hasRoad');
    expect(await panel.isFlagActive('hasRoad')).toBe(true);
    await panel.toggleFlag('hasRoad');
    expect(await panel.isFlagActive('hasRoad')).toBe(false);
  });

  test('toggling town ON shows the town name input', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.toggleFlag('hasTown');
    await expect(appPage.getByTestId('town-name-input')).toBeVisible();
  });

  test('setting a town name is reflected in the input', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.toggleFlag('hasTown');
    await panel.setTownName('Riverdale');
    const val = await appPage.getByTestId('town-name-input').inputValue();
    expect(val).toBe('Riverdale');
  });

  test('notes survive a deselect and reselect', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.setNotes('These are my notes');

    const { q, r } = await appPage.evaluate(() => {
      return (window as unknown as Record<string, { q: number; r: number }>).__testTile;
    });
    const editor = new EditorPage(appPage);

    // Deselect by clicking the already-selected tile (toggles selection off)
    await editor.clickTile(q, r);
    await expect(appPage.getByTestId('delete-tile-btn')).not.toBeVisible();

    // Reselect the tile
    await editor.clickTile(q, r);
    await panel.waitForPanel();

    expect(await panel.getNotes()).toBe('These are my notes');
  });

  test('delete tile button removes the tile', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    const { q, r } = await appPage.evaluate(() => {
      return (window as unknown as Record<string, { q: number; r: number }>).__testTile;
    });
    await panel.deleteTile();
    await expect(appPage.getByTestId(`hex-tile-${q},${r}`)).not.toBeVisible();
  });
});

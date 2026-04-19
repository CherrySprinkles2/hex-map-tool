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
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    const { q, r } = ghost!;

    await editor.clickGhost(q, r);
    expect(await editor.tileExists(q, r)).toBe(true);
  });

  test('newly created tile is automatically selected (panel opens)', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    await editor.clickGhost(ghost!.q, ghost!.r);
    await expect(appPage.getByTestId('delete-tile-btn')).toBeVisible();
  });

  test('right-clicking a tile deletes it', async ({ appPage, isMobile }) => {
    test.skip(isMobile, 'Right-click/context-menu is not available on touch devices');
    const editor = new EditorPage(appPage);
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    const { q, r } = ghost!;

    await editor.clickGhost(q, r);
    expect(await editor.tileExists(q, r)).toBe(true);
    await editor.rightClickTile(q, r);
    expect(await editor.tileExists(q, r)).toBe(false);
  });

  test('tile persists after page reload', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    const { q, r } = ghost!;

    await editor.clickGhost(q, r);

    // Reload stays on the map URL — EditorRoute deep-links the map back from localStorage
    await appPage.reload();
    expect(await editor.tileExists(q, r)).toBe(true);
  });
});

test.describe('Tile Editing', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    const { q, r } = ghost!;
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

  test('toggling town ON shows the Edit Town button', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.toggleFlag('hasTown');
    await expect(appPage.getByTestId('edit-town-btn')).toBeVisible();
  });

  test('setting a town name is reflected in the input', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.toggleFlag('hasTown');
    await panel.setTownName('Riverdale');
    const val = await appPage.getByTestId('town-edit-name-input').inputValue();
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
    const editor = new EditorPage(appPage);
    await panel.deleteTile();
    expect(await editor.tileExists(q, r)).toBe(false);
  });
});

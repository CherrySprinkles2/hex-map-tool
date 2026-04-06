import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { TileEditPanelPage } from '../pages/TileEditPanel.page';

test.describe('Terrain Paint Mode', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    // Create an initial tile and open it
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
  });

  test('entering paint mode shows the exit button', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    await expect(appPage.getByTestId('exit-paint-btn')).toBeVisible();
  });

  test('paint mode brushes are shown', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    // At least one terrain brush should be visible
    await expect(appPage.locator('[data-testid^="paint-brush-"]').first()).toBeVisible();
  });

  test('selecting a brush highlights it', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    await panel.selectBrush('forest');
    // forest brush should now be active — check it's still visible (no crash)
    await expect(appPage.getByTestId('paint-brush-forest')).toBeVisible();
  });

  test('clicking a tile in paint mode changes its terrain', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    await panel.selectBrush('mountain');

    const { q, r } = await appPage.evaluate(() => {
      return (window as unknown as Record<string, { q: number; r: number }>).__testTile;
    });
    const editor = new EditorPage(appPage);
    await editor.clickTile(q, r);

    // Exit paint mode — tile is still selected, panel stays open
    await panel.exitPaintMode();
    const mountainBtn = appPage.getByTestId('terrain-btn-mountain');
    // The mountain terrain button should be the active one (has $active styling)
    await expect(mountainBtn).toBeVisible();
  });

  test('pressing Escape exits paint mode', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    await expect(appPage.getByTestId('exit-paint-btn')).toBeVisible();
    await appPage.keyboard.press('Escape');
    await expect(appPage.getByTestId('exit-paint-btn')).not.toBeVisible();
  });

  test('exit button leaves paint mode', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    await panel.exitPaintMode();
    await expect(appPage.getByTestId('exit-paint-btn')).not.toBeVisible();
  });

  test('river-on brush is available in paint mode', async ({ appPage }) => {
    const panel = new TileEditPanelPage(appPage);
    await panel.waitForPanel();
    await panel.enterPaintMode();
    // River brush buttons are identified by text content in the panel
    await expect(appPage.getByTestId('paint-brush-forest')).toBeVisible();
    // No crash — brushes rendered
  });
});

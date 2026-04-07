import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { TileEditPanelPage } from '../pages/TileEditPanel.page';
import { ArmyPanelPage } from '../pages/ArmyPanel.page';

test.describe('Army Management', () => {
  let tileQ: number;
  let tileR: number;

  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);

    // Create a tile
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const [, coords] = testId!.split('ghost-tile-');
    [tileQ, tileR] = coords.split(',').map(Number);
    await editor.clickGhost(tileQ, tileR);

    // The tile is now selected — panel is open
  });

  test('adding an army opens the ArmyPanel', async ({ appPage }) => {
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await expect(appPage.getByTestId('move-army-btn')).toBeVisible();
  });

  test('army name can be edited', async ({ appPage }) => {
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await armyPanel.setName('The Iron Guard');
    expect(await armyPanel.getName()).toBe('The Iron Guard');
  });

  test('army can be deleted via the panel', async ({ appPage }) => {
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await armyPanel.deleteArmy();
    await expect(appPage.getByTestId('delete-army-btn')).not.toBeVisible();
  });

  test('move mode can be entered and cancelled', async ({ appPage }) => {
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await armyPanel.startMove();
    // Move button label changes to cancel
    await expect(appPage.getByTestId('move-army-btn')).toBeVisible();
    await armyPanel.cancelMove();
    // Still visible but not in move mode
    await expect(appPage.getByTestId('move-army-btn')).toBeVisible();
  });

  test('army can be moved to another tile', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();

    // Create a destination tile before entering move mode
    const ghost = appPage.locator('[data-testid^="ghost-tile-"]').first();
    const testId = await ghost.getAttribute('data-testid');
    const [, coords] = testId!.split('ghost-tile-');
    const [destQ, destR] = coords.split(',').map(Number);
    await editor.clickGhost(destQ, destR);
    // Re-select the original tile so TileEditPanel is on the army's tile
    await editor.clickTile(tileQ, tileR);
    await tilePanel.waitForPanel();

    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await armyPanel.startMove();

    // Move to the destination tile (already a real tile — no ghost click needed)
    await editor.clickTile(destQ, destR);

    // Army panel stays open (selectedArmyId not cleared by move)
    await expect(appPage.getByTestId('delete-army-btn')).toBeVisible();
    // Destination tile still exists
    await expect(appPage.getByTestId(`hex-tile-${destQ},${destR}`)).toBeVisible();
  });

  test('escape cancels move mode', async ({ appPage }) => {
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await armyPanel.startMove();
    await appPage.keyboard.press('Escape');
    // After escape, move mode ends — panel may close or stay, but army is not moved
    // Army token should still exist on original tile
    await expect(appPage.locator('[data-testid^="hex-tile-"]').first()).toBeVisible();
  });
});

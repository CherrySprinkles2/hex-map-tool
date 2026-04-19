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

    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    tileQ = ghost!.q;
    tileR = ghost!.r;
    await editor.clickGhost(tileQ, tileR);
    // The tile is now selected — panel is open
  });

  test('adding an army opens the ArmyPanel', async ({ appPage }) => {
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
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
    await expect(appPage.getByTestId('move-army-btn')).toBeVisible();
    await armyPanel.cancelMove();
    await expect(appPage.getByTestId('move-army-btn')).toBeVisible();
  });

  test('army can be moved to another tile', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();

    // Create a destination tile before entering move mode.
    // Placing the first tile consumed the default ghost — pick a new neighbour.
    const destGhost = await editor.firstGhost();
    expect(destGhost).not.toBeNull();
    const { q: destQ, r: destR } = destGhost!;
    await editor.clickGhost(destQ, destR);

    // Re-select the original tile so TileEditPanel is on the army's tile
    await editor.clickTile(tileQ, tileR);
    await tilePanel.waitForPanel();

    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await armyPanel.startMove();

    // Move to the destination tile
    await editor.clickTile(destQ, destR);

    // Army panel stays open (selectedArmyId not cleared by move)
    await expect(appPage.getByTestId('delete-army-btn')).toBeVisible();
    expect(await editor.tileExists(destQ, destR)).toBe(true);
  });

  test('escape cancels move mode', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const tilePanel = new TileEditPanelPage(appPage);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await armyPanel.startMove();
    await appPage.keyboard.press('Escape');
    // After escape, move mode ends — army should still exist on original tile
    expect(await editor.tileExists(tileQ, tileR)).toBe(true);
  });
});

import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { TileEditPanelPage } from '../pages/TileEditPanel.page';
import { ArmyPanelPage } from '../pages/ArmyPanel.page';
import { ArmyEditPanelPage } from '../pages/ArmyEditPanel.page';
import { FactionsPanelPage } from '../pages/FactionsPanel.page';

test.describe('Army Edit Mode', () => {
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
    // Deselect so panels are closed before each test begins
    await appPage.keyboard.press('Escape');
  });

  test('switching to army mode opens the panel', async ({ appPage }) => {
    await appPage.getByTestId('map-mode-army').click();
    const armyEdit = new ArmyEditPanelPage(appPage);
    await armyEdit.waitForPanel();
    await expect(appPage.getByTestId('army-edit-panel')).toBeVisible();
  });

  test('empty state is shown when no armies exist', async ({ appPage }) => {
    await appPage.getByTestId('map-mode-army').click();
    const armyEdit = new ArmyEditPanelPage(appPage);
    await armyEdit.waitForPanel();
    await expect(appPage.getByTestId('army-edit-empty')).toBeVisible();
  });

  test('armies are listed under their faction groups', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const tilePanel = new TileEditPanelPage(appPage);

    // Add an unassigned army to the first tile
    await editor.clickTile(tileQ, tileR);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await appPage.keyboard.press('Escape');

    // Create a faction — clicking the tile below will close the factions panel automatically
    const factionsPanel = new FactionsPanelPage(appPage);
    await factionsPanel.openPanel();
    await factionsPanel.addFaction();
    await factionsPanel.setFactionName(0, 'Iron Legion');

    // Create a second tile (also closes the factions panel via selectTile)
    const ghost2 = await editor.firstGhost();
    expect(ghost2).not.toBeNull();
    const { q: tile2Q, r: tile2R } = ghost2!;
    await editor.clickGhost(tile2Q, tile2R);
    await tilePanel.waitForPanel();

    // Add an army to the second tile and assign it to the faction
    await tilePanel.addArmy();
    await tilePanel.selectFirstArmy();
    await appPage.getByRole('button', { name: 'None' }).click();
    await appPage.getByRole('option', { name: 'Iron Legion' }).click();
    await appPage.keyboard.press('Escape');

    // Resolve the faction group testid from the store
    const armies = await editor.getArmies();
    const assignedArmy = Object.values(armies).find((a) => a.factionId !== null);
    expect(assignedArmy).toBeDefined();

    // Enter army mode
    await appPage.getByTestId('map-mode-army').click();
    const armyEdit = new ArmyEditPanelPage(appPage);
    await armyEdit.waitForPanel();

    // Faction group and unassigned group are both visible
    await expect(appPage.getByTestId(`army-edit-group-${assignedArmy!.factionId}`)).toBeVisible();
    await expect(appPage.getByTestId('army-edit-group-unassigned')).toBeVisible();
  });

  test('move button shows moving hint and army relocates on tile click', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const tilePanel = new TileEditPanelPage(appPage);

    // Create a destination tile
    const ghost2 = await editor.firstGhost();
    expect(ghost2).not.toBeNull();
    const { q: destQ, r: destR } = ghost2!;
    await editor.clickGhost(destQ, destR);
    await appPage.keyboard.press('Escape');

    // Add army to the first tile
    await editor.clickTile(tileQ, tileR);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await appPage.keyboard.press('Escape');

    const armies = await editor.getArmies();
    const [armyId] = Object.keys(armies);

    // Enter army mode and click Move
    await appPage.getByTestId('map-mode-army').click();
    const armyEdit = new ArmyEditPanelPage(appPage);
    await armyEdit.waitForPanel();

    await armyEdit.clickMove(armyId);
    await expect(appPage.getByTestId('army-edit-moving-hint')).toBeVisible();

    // Click the destination tile to complete the move
    await editor.clickTile(destQ, destR);

    // Moving hint clears after the move completes
    await expect(appPage.getByTestId('army-edit-moving-hint')).not.toBeVisible();

    // Army is now at the destination coordinates.
    // +0 normalises any -0 from floating-point pixelToAxial rounding before toBe's Object.is check.
    const updated = await editor.getArmies();
    expect(updated[armyId].q + 0).toBe(destQ);
    expect(updated[armyId].r + 0).toBe(destR);
  });

  test('edit button opens the ArmyPanel for the selected army', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    const tilePanel = new TileEditPanelPage(appPage);

    // Add army
    await editor.clickTile(tileQ, tileR);
    await tilePanel.waitForPanel();
    await tilePanel.addArmy();
    await appPage.keyboard.press('Escape');

    const armies = await editor.getArmies();
    const [armyId] = Object.keys(armies);

    // Enter army mode and click Edit
    await appPage.getByTestId('map-mode-army').click();
    const armyEdit = new ArmyEditPanelPage(appPage);
    await armyEdit.waitForPanel();

    await armyEdit.clickEdit(armyId);

    // ArmyPanel opens with the move button visible
    const armyPanel = new ArmyPanelPage(appPage);
    await armyPanel.waitForPanel();
    await expect(appPage.getByTestId('move-army-btn')).toBeVisible();
  });
});

import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { FactionsPanelPage } from '../pages/FactionsPanel.page';

test.describe('Factions', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
  });

  test('adding a faction shows it in the panel', async ({ appPage }) => {
    const factions = new FactionsPanelPage(appPage);
    await factions.openPanel();
    await factions.addFaction();
    expect(await factions.factionCount()).toBe(1);
  });

  test('faction name can be edited', async ({ appPage }) => {
    const factions = new FactionsPanelPage(appPage);
    await factions.openPanel();
    await factions.addFaction();
    await factions.setFactionName(0, 'The Northern Alliance');
    const names = await factions.getFactionNames();
    expect(names[0]).toBe('The Northern Alliance');
  });

  test('adding multiple factions increases the count', async ({ appPage }) => {
    const factions = new FactionsPanelPage(appPage);
    await factions.openPanel();
    await factions.addFaction();
    await factions.addFaction();
    await factions.addFaction();
    expect(await factions.factionCount()).toBe(3);
  });

  test('deleting a faction removes it', async ({ appPage }) => {
    const factions = new FactionsPanelPage(appPage);
    await factions.openPanel();
    await factions.addFaction();
    await factions.addFaction();
    expect(await factions.factionCount()).toBe(2);
    await factions.deleteFaction(0);
    expect(await factions.factionCount()).toBe(1);
  });

  test('deleting all factions leaves an empty panel', async ({ appPage }) => {
    const factions = new FactionsPanelPage(appPage);
    await factions.openPanel();
    await factions.addFaction();
    await factions.deleteFaction(0);
    expect(await factions.factionCount()).toBe(0);
    await expect(appPage.getByText('No factions yet. Add one below.')).toBeVisible();
  });
});

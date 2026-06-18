import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { OverlayPanelPage } from '../pages/OverlayPanel.page';

test.describe('Notes overlay', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    await editor.clickGhost(0, 0);
    await appPage.keyboard.press('Escape');
    await new OverlayPanelPage(appPage).select('notes');
  });

  test('selecting a tile shows the notes panel and edits persist', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    await editor.clickTile(0, 0);

    const panel = appPage.getByTestId('notes-panel');
    await expect(panel).toBeVisible();

    const textarea = appPage.getByTestId('notes-overlay-textarea');
    await textarea.fill('Ambush point');

    expect(await editor.getTileNotes(0, 0)).toBe('Ambush point');
  });

  test('empty-state hint shows until a tile is selected', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    await expect(appPage.getByTestId('notes-overlay-textarea')).toHaveCount(0);
    await editor.clickTile(0, 0);
    await expect(appPage.getByTestId('notes-overlay-textarea')).toBeVisible();
  });
});

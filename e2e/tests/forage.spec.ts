import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';
import { OverlayPanelPage } from '../pages/OverlayPanel.page';

test.describe('Forage overlay', () => {
  test.beforeEach(async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    // New maps start empty — create the (0,0) tile in terrain mode first.
    await editor.clickGhost(0, 0);
    await appPage.keyboard.press('Escape');
    await new OverlayPanelPage(appPage).select('forage');
  });

  test('left-click increments forage level, right-click decrements', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    expect(await editor.getForageLevel(0, 0)).toBe(0);

    await editor.clickTile(0, 0);
    expect(await editor.getForageLevel(0, 0)).toBe(1);

    await editor.clickTile(0, 0);
    expect(await editor.getForageLevel(0, 0)).toBe(2);

    await editor.rightClickTile(0, 0);
    expect(await editor.getForageLevel(0, 0)).toBe(1);
  });

  test('forage level is clamped to the cap of 5 and floored at 0', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    for (let i = 0; i < 8; i++) {
      await editor.clickTile(0, 0);
    }
    expect(await editor.getForageLevel(0, 0)).toBe(5);

    for (let i = 0; i < 8; i++) {
      await editor.rightClickTile(0, 0);
    }
    expect(await editor.getForageLevel(0, 0)).toBe(0);
  });

  test('panel controls adjust and clear the level', async ({ appPage }) => {
    const editor = new EditorPage(appPage);
    await editor.clickTile(0, 0); // select + level 1
    await expect(appPage.getByTestId('forage-panel')).toBeVisible();
    await expect(appPage.getByTestId('forage-level')).toContainText('1');

    await appPage.getByTestId('forage-inc').click();
    expect(await editor.getForageLevel(0, 0)).toBe(2);

    await appPage.getByTestId('forage-dec').click();
    expect(await editor.getForageLevel(0, 0)).toBe(1);

    await appPage.getByTestId('forage-clear').click();
    expect(await editor.getForageLevel(0, 0)).toBe(0);
  });
});

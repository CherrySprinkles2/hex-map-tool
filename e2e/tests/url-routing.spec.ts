import { test, expect } from '../fixtures/app.fixture';
import { APP_BASE } from '../helpers/base-path';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { EditorPage } from '../pages/Editor.page';

test.describe('URL Routing', () => {
  test('URL reflects the map slug after creating a new map', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    await expect(appPage).toHaveURL(/\/map\/untitled-map$/);
  });

  test('URL updates after renaming a map', async ({ appPage }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    await editor.renameMap('Routing Test');
    await expect(appPage).toHaveURL(/\/map\/routing-test$/, { timeout: 5_000 });
  });

  test('deep-linking to a saved map opens the editor with correct tile data', async ({
    appPage,
  }) => {
    const home = new HomeScreenPage(appPage);
    await home.createMap();
    const editor = new EditorPage(appPage);
    const ghost = await editor.firstGhost();
    expect(ghost).not.toBeNull();
    const { q, r } = ghost!;

    await editor.clickGhost(q, r);
    await editor.goBack();

    // Navigate directly to the saved map URL — EditorRoute deep-links from localStorage
    await appPage.goto(APP_BASE + '/map/untitled-map');
    expect(await editor.tileExists(q, r)).toBe(true);
  });

  test('deep-linking to /help opens the help screen', async ({ appPage }) => {
    await appPage.goto(APP_BASE + '/help');
    await expect(appPage).toHaveURL(/\/help$/);
    await expect(appPage.getByTestId('new-map-card')).not.toBeVisible();
  });

  test('deep-linking to a help section URL stays on that section', async ({ appPage }) => {
    await appPage.goto(APP_BASE + '/help/terrain');
    await expect(appPage).toHaveURL(/\/help\/terrain$/);
  });

  test('deep-linking to an unknown help section redirects to the help grid', async ({
    appPage,
  }) => {
    await appPage.goto(APP_BASE + '/help/nonexistent-section');
    await expect(appPage).toHaveURL(/\/help$/);
  });

  test('navigating to an unknown path redirects home with a warning', async ({ appPage }) => {
    await appPage.goto(APP_BASE + '/this-path-does-not-exist');
    await expect(appPage).toHaveURL(new RegExp(APP_BASE + '/?$'));
    await expect(appPage.getByText('Page not found')).toBeVisible();
  });

  test('deep-linking to a non-existent map slug redirects home with a warning', async ({
    appPage,
  }) => {
    await appPage.goto(APP_BASE + '/map/no-such-map-ever');
    await expect(appPage).toHaveURL(new RegExp(APP_BASE + '/?$'));
    await expect(appPage.getByText('could not be found')).toBeVisible();
  });
});

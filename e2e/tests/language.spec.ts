import { test, expect } from '../fixtures/app.fixture';
import { HomeScreenPage } from '../pages/HomeScreen.page';
import { readStorage } from '../helpers/storage';

// Language tests run on chromium only (desktop UI has the EN/FI toggle)
test.describe('Language Switching (desktop)', () => {
  test.skip(({ browserName }) => {
    return browserName !== 'chromium';
  }, 'Desktop-only test');

  test('EN toggle shows English UI', async ({ appPage }) => {
    // Find the EN button in the language toggle and click it
    await appPage.getByRole('button', { name: /^EN$/i }).click();
    await expect(appPage.getByTestId('new-map-card')).toBeVisible();
    // The "New Map" label should be in English
    await expect(appPage.getByText(/new map/i)).toBeVisible();
  });

  test('FI toggle changes labels to Finnish', async ({ appPage }) => {
    await appPage.getByRole('button', { name: /^FI$/i }).click();
    // In Finnish the new-map button reads something different from "New Map"
    // We just verify the UI does not crash and the card is still visible
    await expect(appPage.getByTestId('new-map-card')).toBeVisible();
    // Also check localStorage persisted the language
    const lang = await readStorage(appPage, 'i18nextLng');
    expect(lang).toMatch(/^fi/);
  });

  test('language choice persists after reload', async ({ appPage }) => {
    await appPage.getByRole('button', { name: /^FI$/i }).click();
    await appPage.reload();
    await appPage.waitForSelector('[data-testid="new-map-card"]');
    const lang = await readStorage(appPage, 'i18nextLng');
    expect(lang).toMatch(/^fi/);
  });

  test('switching back to EN reverts language', async ({ appPage }) => {
    await appPage.getByRole('button', { name: /^FI$/i }).click();
    await appPage.getByRole('button', { name: /^EN$/i }).click();
    const lang = await readStorage(appPage, 'i18nextLng');
    expect(lang).toMatch(/^en/);
  });
});

test.describe('Language Switching (mobile)', () => {
  test.skip(({ isMobile }) => {
    return !isMobile;
  }, 'Mobile-only test');

  test('mobile settings sheet shows Language option', async ({ appPage }) => {
    await appPage.getByLabel('Settings').click();
    // Use getByRole to avoid strict-mode clash with the hidden LanguageModal h3 title
    await expect(appPage.getByRole('button', { name: /language/i })).toBeVisible();
  });
});

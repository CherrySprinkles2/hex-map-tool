import type { Page } from '@playwright/test';

/** Wipe all hex-map-tool keys from localStorage. */
export async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((k) => {
        return k.startsWith('hex-map-tool') || k === 'i18nextLng';
      })
      .forEach((k) => {
        return localStorage.removeItem(k);
      });
  });
}

/** Read a raw localStorage value by key. */
export async function readStorage(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => {
    return localStorage.getItem(k);
  }, key);
}

/** Read and parse a JSON localStorage value. Returns null if absent or unparseable. */
export async function readStorageJson<T = unknown>(page: Page, key: string): Promise<T | null> {
  const raw = await readStorage(page, key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Return the list of saved map index entries. */
export async function getMapIndex(
  page: Page
): Promise<Array<{ id: string; name: string; updatedAt: string }>> {
  return (await readStorageJson(page, 'hex-map-tool-index')) ?? [];
}

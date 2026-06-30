import type { Page } from '@playwright/test';

export interface StubOpts {
  persisted?: boolean;
  unsupported?: boolean;
  /** Pre-set the "explainer seen" flag so the first-visit modal stays suppressed. */
  seen?: boolean;
  /** Seed this many bytes of the app's own localStorage so usage is deterministic. */
  seedUsageBytes?: number;
}

/**
 * Stub the StorageManager so persistence requests are countable and controllable.
 * (The browser grant itself can't be asserted directly.) Applied via addInitScript
 * so it runs before app code on the next navigation/reload. The usage shown in the
 * UI comes from the app's own `hex-map-tool-*` localStorage, which `seedUsageBytes`
 * can fill to a known size.
 */
export async function installStorageStub(page: Page, opts: StubOpts = {}): Promise<void> {
  await page.addInitScript((o: StubOpts) => {
    const w = window as unknown as { __persistCalls: number };
    w.__persistCalls = 0;
    if (o.seen) localStorage.setItem('hex-map-tool-persistence-prompt-seen', 'true');
    if (o.seedUsageBytes) {
      localStorage.setItem('hex-map-tool-data-seed', 'a'.repeat(o.seedUsageBytes));
    }
    if (o.unsupported) {
      Object.defineProperty(navigator, 'storage', { configurable: true, get: () => undefined });
      return;
    }
    let isPersisted = !!o.persisted;
    const fake = {
      persisted: () => Promise.resolve(isPersisted),
      persist: () => {
        w.__persistCalls += 1;
        isPersisted = true;
        return Promise.resolve(true);
      },
    };
    Object.defineProperty(navigator, 'storage', { configurable: true, get: () => fake });
  }, opts);
}

export function persistCalls(page: Page): Promise<number> {
  return page.evaluate(() => {
    return (window as unknown as { __persistCalls?: number }).__persistCalls ?? 0;
  });
}

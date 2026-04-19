import type { Page } from '@playwright/test';

/**
 * Canvas renderer has no per-tile DOM. A small bridge is exposed on
 * `window.__hexMapTest` by HexGrid.tsx in non-production builds — it provides
 * direct Redux access and synthetic-event helpers keyed by axial coords.
 */
interface TestBridge {
  clickTile: (q: number, r: number) => void;
  rightClickTile: (q: number, r: number) => void;
  firstGhostKey: () => string | null;
  getTileKeys: () => string[];
  tileExists: (q: number, r: number) => boolean;
}

const bridge = async (page: Page): Promise<void> => {
  // Wait until HexGrid has mounted and the bridge is attached.
  await page.waitForFunction(() => {
    return !!(window as unknown as { __hexMapTest?: unknown }).__hexMapTest;
  });
};

export class EditorPage {
  constructor(private page: Page) {}

  get toolbar() {
    return this.page.getByTestId('back-btn');
  }

  get mapNameInput() {
    return this.page.getByTestId('map-name-input');
  }

  get exportBtn() {
    return this.page.getByTestId('export-json-btn');
  }

  /** Open the settings sheet (gear icon). */
  async openSettings(): Promise<void> {
    await this.page.getByLabel('Settings').click();
  }

  async goBack(): Promise<void> {
    await this.page.getByTestId('back-btn').click();
    await this.page.waitForSelector('[data-testid="new-map-card"]');
  }

  /** Click an existing hex tile by its axial coordinate. */
  async clickTile(q: number, r: number): Promise<void> {
    await bridge(this.page);
    await this.page.evaluate(
      ({ q: _q, r: _r }) => {
        const t = (window as unknown as { __hexMapTest: TestBridge }).__hexMapTest;
        t.clickTile(_q, _r);
      },
      { q, r }
    );
  }

  /** Right-click an existing hex tile (delete). */
  async rightClickTile(q: number, r: number): Promise<void> {
    await bridge(this.page);
    await this.page.evaluate(
      ({ q: _q, r: _r }) => {
        const t = (window as unknown as { __hexMapTest: TestBridge }).__hexMapTest;
        t.rightClickTile(_q, _r);
      },
      { q, r }
    );
  }

  /** Click a ghost (unoccupied) tile to create it. */
  async clickGhost(q: number, r: number): Promise<void> {
    // Same path as clickTile — the canvas click handler routes by hit type.
    await this.clickTile(q, r);
  }

  /** Return whether a tile exists in the Redux store. */
  async tileExists(q: number, r: number): Promise<boolean> {
    await bridge(this.page);
    return this.page.evaluate(
      ({ q: _q, r: _r }) => {
        const t = (window as unknown as { __hexMapTest: TestBridge }).__hexMapTest;
        return t.tileExists(_q, _r);
      },
      { q, r }
    );
  }

  /** Return whether a ghost tile is currently rendered at (q, r). */
  async ghostExists(q: number, r: number): Promise<boolean> {
    await bridge(this.page);
    return this.page.evaluate(
      ({ q: _q, r: _r }) => {
        const t = (
          window as unknown as { __hexMapTest: TestBridge & { getGhostKeys: () => string[] } }
        ).__hexMapTest;
        return t.getGhostKeys().includes(`${_q},${_r}`);
      },
      { q, r }
    );
  }

  /** Count all tiles in the current map. */
  async tileCount(): Promise<number> {
    await bridge(this.page);
    return this.page.evaluate(() => {
      const t = (window as unknown as { __hexMapTest: TestBridge }).__hexMapTest;
      return t.getTileKeys().length;
    });
  }

  /** Returns the first ghost-tile coordinates, or null if none exist. */
  async firstGhost(): Promise<{ q: number; r: number } | null> {
    await bridge(this.page);
    const key = await this.page.evaluate(() => {
      const t = (window as unknown as { __hexMapTest: TestBridge }).__hexMapTest;
      return t.firstGhostKey();
    });
    if (!key) return null;
    const [q, r] = key.split(',').map(Number);
    return { q, r };
  }

  /** Rename the current map. */
  async renameMap(name: string): Promise<void> {
    const input = this.page.getByTestId('map-name-input');
    await input.click({ clickCount: 3 });
    await input.fill(name);
    await input.press('Enter');
  }

  /** Export and return the download. */
  async exportMap(): Promise<{ suggestedFilename: string; bodyText: string }> {
    await this.openSettings();
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByTestId('export-json-btn').click(),
    ]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return {
      suggestedFilename: download.suggestedFilename(),
      bodyText: Buffer.concat(chunks).toString('utf8'),
    };
  }
}

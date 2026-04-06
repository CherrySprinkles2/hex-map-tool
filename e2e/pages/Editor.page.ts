import type { Page } from '@playwright/test';

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

  get importBtn() {
    return this.page.getByTestId('import-json-btn');
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
    await this.page.getByTestId(`hex-tile-${q},${r}`).click();
  }

  /** Right-click an existing hex tile (delete). */
  async rightClickTile(q: number, r: number): Promise<void> {
    await this.page.getByTestId(`hex-tile-${q},${r}`).click({ button: 'right' });
  }

  /** Click a ghost (unoccupied) tile to create it. */
  async clickGhost(q: number, r: number): Promise<void> {
    await this.page.getByTestId(`ghost-tile-${q},${r}`).click();
  }

  /** Return whether a tile exists in the SVG. */
  async tileExists(q: number, r: number): Promise<boolean> {
    return this.page.getByTestId(`hex-tile-${q},${r}`).isVisible();
  }

  /** Return whether a ghost tile is visible. */
  async ghostExists(q: number, r: number): Promise<boolean> {
    return this.page.getByTestId(`ghost-tile-${q},${r}`).isVisible();
  }

  /** Count all rendered hex tiles. */
  async tileCount(): Promise<number> {
    return this.page.locator('[data-testid^="hex-tile-"]').count();
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

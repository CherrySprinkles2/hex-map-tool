import type { Page } from '@playwright/test';

export class HomeScreenPage {
  constructor(private page: Page) {}

  get newMapCard() {
    return this.page.getByTestId('new-map-card');
  }

  async createMap(): Promise<string> {
    await this.newMapCard.click();
    // Returns the map name input value from the toolbar
    await this.page.waitForSelector('[data-testid="map-name-input"]');
    return this.page.inputValue('[data-testid="map-name-input"]');
  }

  async openMapByName(name: string): Promise<void> {
    await this.page.getByText(name).first().click();
    await this.page.waitForSelector('[data-testid="back-btn"]');
  }

  /** Click an example map card by its index (0-based). */
  async openExampleByIndex(index: number): Promise<void> {
    const cards = this.page.locator('[data-testid^="example-card-"]');
    await cards.nth(index).click();
    await this.page.waitForSelector('[data-testid="back-btn"]');
  }

  /** Delete a saved map by its card testid. Handles the confirm modal. */
  async deleteMapById(mapId: string): Promise<void> {
    await this.page.getByTestId(`delete-map-${mapId}`).click({ force: true });
    await this.page.getByTestId('confirm-modal-confirm-btn').click();
  }

  /** Return whether a saved map card is visible by map id. */
  async mapCardVisible(mapId: string): Promise<boolean> {
    return this.page.getByTestId(`map-card-${mapId}`).isVisible();
  }

  async navigateBack(): Promise<void> {
    await this.page.getByTestId('back-btn').click();
    await this.page.waitForSelector('[data-testid="new-map-card"]');
  }

  /**
   * Import a JSON string as a new map on the home screen.
   * On desktop uses the header button; on mobile opens the settings sheet first.
   * Returns after the file chooser has been fulfilled.
   */
  async importMap(jsonContent: string, isMobile = false): Promise<void> {
    if (isMobile) {
      await this.page.getByLabel('Settings').click();
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.page.getByTestId('home-import-sheet-btn').click(),
      ]);
      await fileChooser.setFiles({
        name: 'import.json',
        mimeType: 'application/json',
        buffer: Buffer.from(jsonContent),
      });
    } else {
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.page.getByTestId('home-import-btn').click(),
      ]);
      await fileChooser.setFiles({
        name: 'import.json',
        mimeType: 'application/json',
        buffer: Buffer.from(jsonContent),
      });
    }
  }
}

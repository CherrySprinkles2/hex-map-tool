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

  /** Delete a saved map by its card testid. Handles the confirm dialog. */
  async deleteMapById(mapId: string): Promise<void> {
    this.page.once('dialog', (dialog) => {
      return dialog.accept();
    });
    await this.page.getByTestId(`delete-map-${mapId}`).click({ force: true });
  }

  /** Return whether a saved map card is visible by map id. */
  async mapCardVisible(mapId: string): Promise<boolean> {
    return this.page.getByTestId(`map-card-${mapId}`).isVisible();
  }

  async navigateBack(): Promise<void> {
    await this.page.getByTestId('back-btn').click();
    await this.page.waitForSelector('[data-testid="new-map-card"]');
  }
}

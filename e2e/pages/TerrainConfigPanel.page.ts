import type { Page } from '@playwright/test';

/** The "Terrain & Features" modal (terrain types + river/road styles). */
export class TerrainConfigPanel {
  constructor(private page: Page) {}

  /** Open the modal via the settings sheet. */
  async open(): Promise<void> {
    await this.page.getByLabel('Settings').click();
    await this.page.getByTestId('terrain-config-btn').click();
    await this.page.waitForSelector('[data-testid="add-river-btn"]');
  }

  /** Add a river style with the given name, returning to the list view. */
  async addRiverStyle(name: string): Promise<void> {
    await this.page.getByTestId('add-river-btn').click();
    await this.page.getByTestId('variety-name-input').fill(name);
    await this.page.getByTestId('variety-save-btn').click();
    await this.page.waitForSelector('[data-testid="add-river-btn"]');
  }

  /** Add a road style with the given name, returning to the list view. */
  async addRoadStyle(name: string): Promise<void> {
    await this.page.getByTestId('add-road-btn').click();
    await this.page.getByTestId('variety-name-input').fill(name);
    await this.page.getByTestId('variety-save-btn').click();
    await this.page.waitForSelector('[data-testid="add-road-btn"]');
  }

  /** Number of river style rows currently listed. */
  async riverRowCount(): Promise<number> {
    return this.page.locator('[data-testid^="variety-row-river"]').count();
  }

  /** Close the modal via its header close button. */
  async close(): Promise<void> {
    await this.page.getByTestId('close-terrain-config-btn').click();
  }
}

import type { Page } from '@playwright/test';

export class TileEditPanelPage {
  constructor(private page: Page) {}

  /** Wait for the panel to become visible (tile selected or paint mode). */
  async waitForPanel(): Promise<void> {
    await this.page.waitForSelector(
      '[data-testid="paint-terrain-btn"], [data-testid="delete-tile-btn"]',
      {
        timeout: 5_000,
      }
    );
  }

  /** Click a terrain button by terrain type key (e.g. 'forest', 'ocean'). */
  async selectTerrain(type: string): Promise<void> {
    await this.page.getByTestId(`terrain-btn-${type}`).click();
  }

  /** Toggle a tile feature flag (hasRiver, hasRoad, hasTown). */
  async toggleFlag(flag: 'hasRiver' | 'hasRoad' | 'hasTown'): Promise<void> {
    await this.page.getByTestId(`flag-toggle-${flag}`).click();
  }

  /** Enter terrain paint mode. */
  async enterPaintMode(): Promise<void> {
    await this.page.getByTestId('paint-terrain-btn').click();
    await this.page.waitForSelector('[data-testid="exit-paint-btn"]');
  }

  /** Exit terrain paint mode via the exit button. */
  async exitPaintMode(): Promise<void> {
    await this.page.getByTestId('exit-paint-btn').click();
  }

  /** Select a paint brush by type (terrain key or 'river-on'/'river-off'/'road-on'/'road-off'). */
  async selectBrush(brush: string): Promise<void> {
    await this.page.getByTestId(`paint-brush-${brush}`).click();
  }

  /** Add an army to the currently selected tile. */
  async addArmy(): Promise<void> {
    await this.page.getByTestId('add-army-btn').click();
  }

  /** Select the first army listed on the tile (opens ArmyPanel). */
  async selectFirstArmy(): Promise<void> {
    await this.page.locator('[data-testid^="select-army-"]').first().click();
  }

  /** Delete the currently selected tile. */
  async deleteTile(): Promise<void> {
    await this.page.getByTestId('delete-tile-btn').click();
  }

  /** Open the town edit sub-panel (requires hasTown to already be toggled on). */
  async openTownEdit(): Promise<void> {
    await this.page.getByTestId('edit-town-btn').click();
    await this.page.waitForSelector('[data-testid="town-edit-back-btn"]');
  }

  /** Type a town name into the town name input (opens town edit panel first). */
  async setTownName(name: string): Promise<void> {
    await this.openTownEdit();
    const input = this.page.getByTestId('town-edit-name-input');
    await input.fill(name);
    await input.press('Tab');
  }

  /** Fill the notes textarea. */
  async setNotes(text: string): Promise<void> {
    const ta = this.page.getByTestId('notes-textarea');
    await ta.fill(text);
  }

  async getNotes(): Promise<string> {
    return this.page.getByTestId('notes-textarea').inputValue();
  }

  /** Return whether a flag toggle is currently active (has active styling). */
  async isFlagActive(flag: string): Promise<boolean> {
    // The flag-state span inside the toggle shows 'on' or 'off'
    const toggle = this.page.getByTestId(`flag-toggle-${flag}`);
    const stateText = await toggle.locator('.flag-state').textContent();
    return stateText === 'on';
  }
}

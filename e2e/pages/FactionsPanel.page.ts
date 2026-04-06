import type { Page } from '@playwright/test';

export class FactionsPanelPage {
  constructor(private page: Page) {}

  async openPanel(): Promise<void> {
    await this.page.getByTestId('factions-btn').click();
    await this.page.waitForSelector('[data-testid="add-faction-btn"]');
  }

  async addFaction(): Promise<void> {
    await this.page.getByTestId('add-faction-btn').click();
  }

  /** Get all visible faction name input values. */
  async getFactionNames(): Promise<string[]> {
    const inputs = this.page.locator('[data-testid^="faction-name-"]');
    const count = await inputs.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(await inputs.nth(i).inputValue());
    }
    return names;
  }

  /** Set the name of the nth faction (0-based). */
  async setFactionName(index: number, name: string): Promise<void> {
    const inputs = this.page.locator('[data-testid^="faction-name-"]');
    const input = inputs.nth(index);
    await input.click({ clickCount: 3 });
    await input.fill(name);
    await input.press('Enter');
  }

  /** Delete the nth faction (0-based). */
  async deleteFaction(index: number): Promise<void> {
    const btns = this.page.locator('[data-testid^="faction-delete-"]');
    await btns.nth(index).click();
  }

  async factionCount(): Promise<number> {
    return this.page.locator('[data-testid^="faction-name-"]').count();
  }
}

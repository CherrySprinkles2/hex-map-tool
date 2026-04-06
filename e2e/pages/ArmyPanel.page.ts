import type { Page } from '@playwright/test';

export class ArmyPanelPage {
  constructor(private page: Page) {}

  async waitForPanel(): Promise<void> {
    await this.page.waitForSelector('[data-testid="move-army-btn"]', { timeout: 5_000 });
  }

  async setName(name: string): Promise<void> {
    const input = this.page.getByTestId('army-name-input');
    await input.click({ clickCount: 3 });
    await input.fill(name);
    await input.press('Tab');
  }

  async getName(): Promise<string> {
    return this.page.getByTestId('army-name-input').inputValue();
  }

  async startMove(): Promise<void> {
    await this.page.getByTestId('move-army-btn').click();
  }

  async cancelMove(): Promise<void> {
    // The same button toggles cancel when in move mode
    await this.page.getByTestId('move-army-btn').click();
  }

  async deleteArmy(): Promise<void> {
    await this.page.getByTestId('delete-army-btn').click();
  }

  async isVisible(): Promise<boolean> {
    return this.page.getByTestId('move-army-btn').isVisible();
  }
}

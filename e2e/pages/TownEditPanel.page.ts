import type { Page } from '@playwright/test';
import type { Fortification, TownSize } from '../../src/types/domain';

export class TownEditPanelPage {
  constructor(private page: Page) {}

  /** Wait for the town edit panel to be open. */
  async waitForPanel(): Promise<void> {
    await this.page.waitForSelector('[data-testid="town-edit-back-btn"]', { timeout: 5_000 });
  }

  /** Navigate back to the tile edit panel. */
  async back(): Promise<void> {
    await this.page.getByTestId('town-edit-back-btn').click();
    await this.page.waitForSelector('[data-testid="edit-town-btn"]');
  }

  /** Set the town name. */
  async setName(name: string): Promise<void> {
    const input = this.page.getByTestId('town-edit-name-input');
    await input.fill(name);
    await input.press('Tab');
  }

  /** Get the current town name value. */
  async getName(): Promise<string> {
    return this.page.getByTestId('town-edit-name-input').inputValue();
  }

  /** Click a fortification option. */
  async setFortification(level: Fortification): Promise<void> {
    await this.page.getByTestId(`fortification-${level}`).click();
  }

  /** Return whether a given fortification option is currently active. */
  async isFortificationActive(level: Fortification): Promise<boolean> {
    const btn = this.page.getByTestId(`fortification-${level}`);
    return (await btn.getAttribute('data-active')) === 'true';
  }

  /** Click a town size option. */
  async setSize(size: TownSize): Promise<void> {
    await this.page.getByTestId(`size-${size}`).click();
  }

  /** Return whether a given size option is currently active. */
  async isSizeActive(size: TownSize): Promise<boolean> {
    const btn = this.page.getByTestId(`size-${size}`);
    return (await btn.getAttribute('data-active')) === 'true';
  }
}

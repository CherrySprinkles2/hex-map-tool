import type { Page } from '@playwright/test';

export class ArmyEditPanelPage {
  constructor(private page: Page) {}

  /** Wait until the panel has rendered its contents (empty state or first army row). */
  async waitForPanel(): Promise<void> {
    await this.page.waitForSelector(
      '[data-testid="army-edit-empty"], [data-testid^="army-edit-goto-"]',
      { timeout: 5_000 }
    );
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.getByTestId('army-edit-empty').isVisible();
  }

  async isMovingHintVisible(): Promise<boolean> {
    return this.page.getByTestId('army-edit-moving-hint').isVisible();
  }

  async clickMove(armyId: string): Promise<void> {
    await this.page.getByTestId(`army-edit-move-${armyId}`).click();
  }

  async clickEdit(armyId: string): Promise<void> {
    await this.page.getByTestId(`army-edit-edit-${armyId}`).click();
  }

  async clickGoTo(armyId: string): Promise<void> {
    await this.page.getByTestId(`army-edit-goto-${armyId}`).click();
  }

  async isGroupVisible(factionIdOrUnassigned: string): Promise<boolean> {
    return this.page.getByTestId(`army-edit-group-${factionIdOrUnassigned}`).isVisible();
  }
}

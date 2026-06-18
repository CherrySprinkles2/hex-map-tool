import type { Page } from '@playwright/test';

export type OverlayId = 'terrain' | 'faction' | 'army' | 'forage' | 'notes';

/**
 * The bottom-right overlay panel. On desktop it is always expanded; on mobile it
 * collapses to a single toggle, so select() expands it first when needed.
 */
export class OverlayPanelPage {
  constructor(private page: Page) {}

  async select(id: OverlayId): Promise<void> {
    const toggle = this.page.getByTestId('overlay-panel-toggle');
    // The toggle is only visible on mobile (display:none on desktop).
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    await this.page.getByTestId(`map-mode-${id}`).click();
  }
}

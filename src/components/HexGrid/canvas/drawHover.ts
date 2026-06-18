// Hover highlight for the tile/ghost currently under the pointer. Drawn on the
// overlay canvas so that mouse-move never triggers a full main-canvas repaint
// (the expensive faction-border glow lives on the main canvas).

import { HEX_SIZE, axialToPixel, fromKey } from '../../../utils/hexUtils';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import { tracePath } from './drawTiles';

interface DrawHoverArgs {
  ctx: CanvasRenderingContext2D;
  hoveredKey: string | null;
  tiles: TilesState;
  ghostKeys: Set<string>;
  theme: AppTheme;
}

export const drawHover = ({ ctx, hoveredKey, tiles, ghostKeys, theme }: DrawHoverArgs): void => {
  if (!hoveredKey) return;
  const isGhost = !tiles[hoveredKey] && ghostKeys.has(hoveredKey);
  if (!tiles[hoveredKey] && !isGhost) return;

  const { q, r } = fromKey(hoveredKey);
  const { x: cx, y: cy } = axialToPixel(q, r);

  ctx.save();
  tracePath(ctx, cx, cy, HEX_SIZE);
  ctx.fillStyle = `rgba(255,255,255,${theme.selection.hoverAlpha})`;
  ctx.fill();
  if (isGhost) {
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
};

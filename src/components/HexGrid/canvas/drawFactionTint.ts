// Faction overlay tint. Painted after the shared greyscale pass, so the tint
// sits over a desaturated base (mirrors the Forage heatmap). Every faction-owned
// tile gets a hex fill of its faction colour at a fixed alpha; unowned tiles are
// left greyscale. Territory border outlines are drawn separately, on top.

import { axialToPixel, HEX_SIZE } from '../../../utils/hexUtils';
import { tracePath } from './drawTiles';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';

interface DrawFactionTintArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  visibleKeys: Set<string>;
  factionColorMap: Record<string, string>;
  theme: AppTheme;
}

export const drawFactionTint = ({
  ctx,
  tiles,
  visibleKeys,
  factionColorMap,
  theme,
}: DrawFactionTintArgs): void => {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = theme.faction.tintAlpha;

  visibleKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.factionId) return;
    const color = factionColorMap[tile.factionId];
    if (!color) return;
    const { x: cx, y: cy } = axialToPixel(tile.q, tile.r);
    tracePath(ctx, cx, cy, HEX_SIZE);
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.globalAlpha = prevAlpha;
};

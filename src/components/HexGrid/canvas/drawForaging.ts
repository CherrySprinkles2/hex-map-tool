// Forage overlay heatmap. Painted after the shared greyscale pass, so the tint
// sits over a desaturated base. Each foraged tile (forageLevel > 0) gets a hex
// fill of the theme tint at an alpha that deepens with the level, plus a haloed
// count label (e.g. "2x") at the tile centre; level-0 tiles are left untinted
// (greyscale).

import { axialToPixel, HEX_SIZE } from '../../../utils/hexUtils';
import { tracePath } from './drawTiles';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';

interface DrawForagingArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  visibleKeys: Set<string>;
  theme: AppTheme;
}

export const drawForaging = ({ ctx, tiles, visibleKeys, theme }: DrawForagingArgs): void => {
  const { tint, alphaByLevel, labelColor, labelShadow } = theme.foraging;
  const prevAlpha = ctx.globalAlpha;

  // Pass 1: tint fills (alpha varies per level).
  ctx.fillStyle = tint;
  visibleKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile) return;
    const level = tile.forageLevel ?? 0;
    if (level <= 0) return;
    const idx = Math.min(level, alphaByLevel.length) - 1;
    const { x: cx, y: cy } = axialToPixel(tile.q, tile.r);
    tracePath(ctx, cx, cy, HEX_SIZE);
    ctx.globalAlpha = alphaByLevel[idx];
    ctx.fill();
  });

  // Pass 2: count labels at full opacity, so the text stays legible regardless
  // of tint depth.
  ctx.globalAlpha = 1;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  visibleKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile) return;
    const level = tile.forageLevel ?? 0;
    if (level <= 0) return;
    const { x: cx, y: cy } = axialToPixel(tile.q, tile.r);
    const text = `${level}x`;
    ctx.strokeStyle = labelShadow;
    ctx.strokeText(text, cx, cy);
    ctx.fillStyle = labelColor;
    ctx.fillText(text, cx, cy);
  });

  ctx.globalAlpha = prevAlpha;
};

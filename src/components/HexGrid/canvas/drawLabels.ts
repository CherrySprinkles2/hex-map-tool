// Town name below the icon, drawn with a stroke halo via strokeText-before-fillText.

import { axialToPixel } from '../../../utils/hexUtils';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';

interface DrawLabelsArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  theme: AppTheme;
}

const drawHaloedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontPx: number,
  fill: string,
  shadow: string
): void => {
  ctx.font = `bold ${fontPx}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = shadow;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
};

export const drawLabels = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  theme,
}: DrawLabelsArgs): void => {
  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasTown) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const { q, r, townName } = tile;
    const { x: cx, y: cy } = axialToPixel(q, r);

    const fortification = tile.fortification ?? 'none';
    const wallW = fortification === 'none' ? 0 : theme.town.fortification[fortification].wallWidth;
    const radius = theme.town.size[tile.townSize ?? 'town'].radius;
    const outerR = radius + wallW / 2;

    if (townName) {
      drawHaloedText(
        ctx,
        townName,
        cx,
        cy + outerR + 9,
        10,
        theme.town.labelColor,
        theme.town.labelShadow
      );
    }
  });
};

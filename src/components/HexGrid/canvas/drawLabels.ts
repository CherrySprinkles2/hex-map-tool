// Town name below the icon + single-garrisoned-army name above, both drawn
// with a stroke halo via strokeText-before-fillText.

import { axialToPixel, toKey } from '../../../utils/hexUtils';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { Army } from '../../../types/domain';

interface DrawLabelsArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  armiesByTile: Record<string, Army[]>;
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
  armiesByTile,
  theme,
}: DrawLabelsArgs): void => {
  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasTown) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const { q, r, townName } = tile;
    const tileKey = toKey(q, r);
    const { x: cx, y: cy } = axialToPixel(q, r);

    const armies = armiesByTile[tileKey] ?? [];
    const fortification = tile.fortification ?? 'none';
    const wallW = fortification === 'none' ? 0 : theme.town.fortification[fortification].wallWidth;
    const radius = theme.town.size[tile.townSize ?? 'town'].radius;
    const outerR = radius + wallW / 2;

    if (armies.length === 1 && armies[0].name) {
      drawHaloedText(
        ctx,
        armies[0].name,
        cx,
        cy - outerR - 8,
        9,
        theme.garrison.nameColor,
        theme.garrison.nameShadow
      );
    }

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

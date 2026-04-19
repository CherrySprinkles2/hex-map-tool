// Draws rivers for each tile with hasRiver, connecting to neighbours with the
// same flag via bezier curves from `pathGenerator`. Path strings are wrapped
// in Path2D for stroking.

import { axialToPixel, toKey } from '../../../utils/hexUtils';
import { computeConnectedDirs, buildFeaturePaths } from '../../../utils/pathGenerator';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { CubicBezier } from '../../../utils/pathGenerator';

interface DrawRiversArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  theme: AppTheme;
}

// Also returns river curves keyed by tile, so drawRoads can reuse them for
// 90° crossing geometry without recomputing.
export const drawRivers = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  theme,
}: DrawRiversArgs): Map<string, CubicBezier[]> => {
  const style = theme.river;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.width;
  ctx.lineCap = style.linecap as CanvasLineCap;
  ctx.lineJoin = 'round';
  ctx.fillStyle = style.color;

  const curvesByKey = new Map<string, CubicBezier[]>();

  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasRiver) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const { q, r } = tile;
    const { x: cx, y: cy } = axialToPixel(q, r);
    const connectedDirs = computeConnectedDirs(tiles, q, r, 'hasRiver');

    if (connectedDirs.length === 0) {
      // Pool dot
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, style.poolRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      return;
    }

    const paths = buildFeaturePaths(cx, cy, connectedDirs, 'river');
    const curves: CubicBezier[] = [];
    paths.forEach(({ svgPath, curve }) => {
      const p = new Path2D(svgPath);
      ctx.stroke(p);
      if (curve) curves.push(curve);
    });
    if (curves.length > 0) curvesByKey.set(toKey(q, r), curves);
  });

  ctx.restore();
  return curvesByKey;
};

// Draws roads for each tile with hasRoad. `buildRoadPaths` handles 90°
// river-crossing geometry so roads don't overlap river curves.

import { axialToPixel, toKey } from '../../../utils/hexUtils';
import { computeConnectedDirs, buildRoadPaths } from '../../../utils/pathGenerator';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { CubicBezier } from '../../../utils/pathGenerator';

interface DrawRoadsArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  riverCurvesByTile: Map<string, CubicBezier[]>;
  theme: AppTheme;
}

export const drawRoads = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  riverCurvesByTile,
  theme,
}: DrawRoadsArgs): void => {
  const style = theme.road;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.width;
  ctx.lineCap = style.linecap as CanvasLineCap;
  ctx.lineJoin = 'miter';
  ctx.fillStyle = style.color;

  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasRoad) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const { q, r, hasTown } = tile;
    const { x: cx, y: cy } = axialToPixel(q, r);
    const connectedDirs = computeConnectedDirs(tiles, q, r, 'hasRoad');

    if (connectedDirs.length === 0) {
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, style.poolRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      return;
    }

    const riverCurves = riverCurvesByTile.get(toKey(q, r)) ?? [];
    const svgPaths = buildRoadPaths(cx, cy, connectedDirs, riverCurves, hasTown);
    svgPaths.forEach((d) => {
      ctx.stroke(new Path2D(d));
    });
  });

  ctx.restore();
};

// Draws roads for each tile with hasRoad. `buildRoadPaths` handles 90°
// river-crossing geometry so roads don't overlap river curves.

import { axialToPixel, toKey } from '../../../utils/hexUtils';
import { computeConnectedDirs, buildRoadPaths } from '../../../utils/pathGenerator';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { CubicBezier } from '../../../utils/pathGenerator';
import type { VarietyStyle } from './drawRivers';

interface DrawRoadsArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  riverCurvesByTile: Map<string, CubicBezier[]>;
  theme: AppTheme;
  /** id → { color, width }. Tiles resolve via their roadTypeId. */
  varieties: Map<string, VarietyStyle>;
  defaultId: string;
}

export const drawRoads = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  riverCurvesByTile,
  theme,
  varieties,
  defaultId,
}: DrawRoadsArgs): void => {
  const style = theme.road;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.lineCap = style.linecap as CanvasLineCap;
  ctx.lineJoin = 'miter';

  const fallback: VarietyStyle = { color: style.color, width: style.width };
  let currentId: string | null = null;

  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasRoad) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const varietyId = tile.roadTypeId ?? defaultId;
    if (varietyId !== currentId) {
      currentId = varietyId;
      const v = varieties.get(varietyId) ?? varieties.get(defaultId) ?? fallback;
      ctx.strokeStyle = v.color;
      ctx.lineWidth = v.width;
      ctx.fillStyle = v.color;
    }

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

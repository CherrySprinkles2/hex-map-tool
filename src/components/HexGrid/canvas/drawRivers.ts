// Draws rivers for each tile with hasRiver, connecting to neighbours with the
// same flag via bezier curves from `pathGenerator`. Path strings are wrapped
// in Path2D for stroking.

import { axialToPixel, toKey } from '../../../utils/hexUtils';
import { computeConnectedDirs, buildFeaturePaths } from '../../../utils/pathGenerator';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { CubicBezier } from '../../../utils/pathGenerator';

/** Per-tile resolved stroke style for a river/road variety. */
export interface VarietyStyle {
  color: string;
  width: number;
}

interface DrawRiversArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  theme: AppTheme;
  /** id → { color, width }. Tiles resolve via their riverTypeId. */
  varieties: Map<string, VarietyStyle>;
  defaultId: string;
}

// Also returns river curves keyed by tile, so drawRoads can reuse them for
// 90° crossing geometry without recomputing.
export const drawRivers = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  theme,
  varieties,
  defaultId,
}: DrawRiversArgs): Map<string, CubicBezier[]> => {
  const style = theme.river;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.lineCap = style.linecap as CanvasLineCap;
  ctx.lineJoin = 'round';

  // Fallback used when a tile references an unknown/dangling variety id.
  const fallback: VarietyStyle = { color: style.color, width: style.width };
  let currentId: string | null = null;

  const curvesByKey = new Map<string, CubicBezier[]>();

  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasRiver) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const varietyId = tile.riverTypeId ?? defaultId;
    if (varietyId !== currentId) {
      currentId = varietyId;
      const v = varieties.get(varietyId) ?? varieties.get(defaultId) ?? fallback;
      ctx.strokeStyle = v.color;
      ctx.lineWidth = v.width;
      ctx.fillStyle = v.color;
    }

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

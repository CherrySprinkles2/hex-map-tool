// Roads that pass through deep-water tiles: a wider brown embankment with
// perpendicular river-blue notches at each connected edge to suggest water
// channels flowing beneath.

import { axialToPixel } from '../../../utils/hexUtils';
import {
  computeConnectedDirs,
  buildRoadPaths,
  getFeatureAnchor,
  getInwardNormal,
} from '../../../utils/pathGenerator';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';

const NOTCH_HALF = 6;

interface DrawCausewaysArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  theme: AppTheme;
}

export const drawCauseways = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  theme,
}: DrawCausewaysArgs): void => {
  const style = theme.causeway;
  const roadStyle = theme.road;

  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasRoad) return;
    if (!deepWaterSet.has(tile.terrain)) return;

    const { q, r } = tile;
    const { x: cx, y: cy } = axialToPixel(q, r);
    const connectedDirs = computeConnectedDirs(tiles, q, r, 'hasRoad');

    if (connectedDirs.length === 0) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(cx, cy, roadStyle.poolRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Embankment — wider brown road
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = style.linecap as CanvasLineCap;
    const svgPaths = buildRoadPaths(cx, cy, connectedDirs, [], false);
    svgPaths.forEach((d) => {
      ctx.stroke(new Path2D(d));
    });
    ctx.restore();

    // Perpendicular notches: short blue lines centred on each edge anchor.
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = style.notchColor;
    ctx.lineWidth = style.notchWidth;
    ctx.lineCap = 'round';
    connectedDirs.forEach((dirIndex) => {
      const anchor = getFeatureAnchor(cx, cy, dirIndex, 'road');
      const normal = getInwardNormal(cx, cy, dirIndex);
      const tx = -normal.y;
      const ty = normal.x;
      ctx.beginPath();
      ctx.moveTo(anchor.x + tx * NOTCH_HALF, anchor.y + ty * NOTCH_HALF);
      ctx.lineTo(anchor.x - tx * NOTCH_HALF, anchor.y - ty * NOTCH_HALF);
      ctx.stroke();
    });
    ctx.restore();
  });
};

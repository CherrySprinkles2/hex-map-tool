// A port is drawn on each deep-water tile edge that borders a town tile:
// three pilings sticking outward toward the water tile's centre, plus a plank
// laid along the shared edge.

import {
  axialToPixel,
  hexCorners,
  NEIGHBOR_DIRS,
  toKey,
  DIR_TO_EDGE_CORNER,
} from '../../../utils/hexUtils';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';

interface DrawPortsArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  theme: AppTheme;
}

export const drawPorts = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  theme,
}: DrawPortsArgs): void => {
  const { color, plankWidth, pilingWidth, plankHalf, pilingLen } = theme.port;
  const pilingOffsets = [-plankHalf * 0.65, 0, plankHalf * 0.65];

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';

  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile) return;
    if (!deepWaterSet.has(tile.terrain)) return;

    const { q, r } = tile;
    const myKey = toKey(q, r);
    const { x: cx, y: cy } = axialToPixel(q, r);
    const corners = hexCorners(cx, cy);

    NEIGHBOR_DIRS.forEach((dir, i) => {
      const neighbor = tiles[toKey(q + dir.q, r + dir.r)];
      if (!neighbor?.hasTown) return;
      if ((neighbor.portBlocked || []).includes(myKey)) return;

      const ci = DIR_TO_EDGE_CORNER[i];
      const a = corners[ci];
      const b = corners[(ci + 1) % 6];
      const em = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

      const dx = cx - em.x;
      const dy = cy - em.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const px = -ny;
      const py = nx;

      // Pilings
      ctx.lineWidth = pilingWidth;
      pilingOffsets.forEach((offset) => {
        ctx.beginPath();
        ctx.moveTo(em.x + px * offset, em.y + py * offset);
        ctx.lineTo(em.x + px * offset + nx * pilingLen, em.y + py * offset + ny * pilingLen);
        ctx.stroke();
      });

      // Plank
      ctx.lineWidth = plankWidth;
      ctx.beginPath();
      ctx.moveTo(em.x + px * plankHalf, em.y + py * plankHalf);
      ctx.lineTo(em.x - px * plankHalf, em.y - py * plankHalf);
      ctx.stroke();
    });
  });

  ctx.restore();
};

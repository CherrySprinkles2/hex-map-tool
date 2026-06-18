// Dashed outlines for "ghost" tiles — neighbours of visible tiles that are not
// yet placed. Mirrors the SVG polygon used by GhostTile.tsx. The hover
// highlight is drawn separately on the overlay canvas (see drawHover).

import { HEX_SIZE, axialToPixel } from '../../../utils/hexUtils';
import type { AppTheme } from '../../../types/theme';
import { tracePath } from './drawTiles';

interface DrawGhostsArgs {
  ctx: CanvasRenderingContext2D;
  ghostKeys: Set<string>;
  theme: AppTheme;
}

export const drawGhosts = ({ ctx, ghostKeys, theme }: DrawGhostsArgs): void => {
  ctx.save();
  ctx.setLineDash([6, 4]);
  ghostKeys.forEach((key) => {
    const [qStr, rStr] = key.split(',');
    const q = Number(qStr);
    const r = Number(rStr);
    const { x: cx, y: cy } = axialToPixel(q, r);

    tracePath(ctx, cx, cy, HEX_SIZE);
    ctx.fillStyle = theme.ghostFill;
    ctx.fill();
    ctx.strokeStyle = theme.ghostStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();
};

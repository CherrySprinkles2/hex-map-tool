// Dashed outlines for "ghost" tiles — neighbours of visible tiles that are not
// yet placed. Mirrors the SVG polygon used by GhostTile.tsx, including the
// hover colour swap.

import { HEX_SIZE } from '../../../utils/hexUtils';
import type { AppTheme } from '../../../types/theme';
import { tracePath } from './drawTiles';

interface DrawGhostsArgs {
  ctx: CanvasRenderingContext2D;
  ghostKeys: Set<string>;
  theme: AppTheme;
  hoveredKey: string | null;
}

export const drawGhosts = ({ ctx, ghostKeys, theme, hoveredKey }: DrawGhostsArgs): void => {
  ctx.save();
  ctx.setLineDash([6, 4]);
  ghostKeys.forEach((key) => {
    const [qStr, rStr] = key.split(',');
    const q = Number(qStr);
    const r = Number(rStr);
    // axial -> pixel inline to avoid another util import; mirror axialToPixel
    const cx = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const cy = HEX_SIZE * 1.5 * r;

    const isHovered = hoveredKey === key;
    tracePath(ctx, cx, cy, HEX_SIZE);
    ctx.fillStyle = isHovered ? 'rgba(255,255,255,0.15)' : theme.ghostFill;
    ctx.fill();
    ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.6)' : theme.ghostStroke;
    ctx.lineWidth = isHovered ? 2 : 1.5;
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();
};

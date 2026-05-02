// Dashed outlines for "ghost" tiles — neighbours of visible tiles that are not
// yet placed. Mirrors the SVG polygon used by GhostTile.tsx, including the
// hover colour swap.

import { HEX_SIZE, axialToPixel } from '../../../utils/hexUtils';
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
  console.time('drawGhosts');
  ghostKeys.forEach((key) => {
    const [qStr, rStr] = key.split(',');
    const q = Number(qStr);
    const r = Number(rStr);
    const { x: cx, y: cy } = axialToPixel(q, r);

    const isHovered = hoveredKey === key;
    tracePath(ctx, cx, cy, HEX_SIZE);
    ctx.fillStyle = isHovered ? `rgba(255,255,255,${theme.selection.hoverAlpha})` : theme.ghostFill;
    ctx.fill();
    ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.6)' : theme.ghostStroke;
    ctx.lineWidth = isHovered ? 2 : 1.5;
    ctx.stroke();
  });
  console.timeEnd('drawGhosts');
  ctx.setLineDash([]);
  ctx.restore();
};

// Animated overlay canvas — tile selection ring + army selection/movement ring.
// Lives on a second <canvas> above the main layer so the main layer does not
// repaint every frame just for the marching-ants animation.
//
// The dash pattern and period mirror the SVG animation:
//   @keyframes marchingAnts { to { stroke-dashoffset: -9; } }  @ 1s linear
// so we use dash=[6,3] (len 9) and advance lineDashOffset from 0 to -9 once per
// second based on performance.now().

import { axialToPixel, hexCorners, HEX_SIZE } from '../../../utils/hexUtils';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { Army } from '../../../types/domain';

interface DrawOverlayArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  armiesByTile: Record<string, Army[]>;
  selectedTile: string | null;
  selectedArmyId: string | null;
  movingArmyId: string | null;
  nowMs: number;
  theme: AppTheme;
}

const traceHex = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void => {
  const corners = hexCorners(cx, cy, radius);
  ctx.beginPath();
  corners.forEach((c, i) => {
    if (i === 0) ctx.moveTo(c.x, c.y);
    else ctx.lineTo(c.x, c.y);
  });
  ctx.closePath();
};

const findArmy = (
  armiesByTile: Record<string, Army[]>,
  id: string
): {
  army: Army;
  tileKey: string;
  tileIndex: number;
  total: number;
} | null => {
  for (const tileKey of Object.keys(armiesByTile)) {
    const list = armiesByTile[tileKey];
    const idx = list.findIndex((a) => {
      return a.id === id;
    });
    if (idx >= 0) return { army: list[idx], tileKey, tileIndex: idx, total: list.length };
  }
  return null;
};

export const drawOverlay = ({
  ctx,
  tiles,
  armiesByTile,
  selectedTile,
  selectedArmyId,
  movingArmyId,
  nowMs,
  theme,
}: DrawOverlayArgs): void => {
  // Marching-ants phase: one dash-cycle (9px) per second, moving negatively.
  const phase = ((nowMs % 1000) / 1000) * 9;

  // Tile selection ring
  if (selectedTile) {
    const [qStr, rStr] = selectedTile.split(',');
    const q = Number(qStr);
    const r = Number(rStr);
    const { x, y } = axialToPixel(q, r);
    ctx.save();
    ctx.setLineDash([6, 3]);
    ctx.lineDashOffset = -phase;
    ctx.lineCap = 'round';
    ctx.strokeStyle = theme.selectedStroke;
    ctx.lineWidth = 2.5;
    traceHex(ctx, x, y, HEX_SIZE - 5);
    ctx.stroke();
    ctx.restore();
  }

  // Army ring: one for selected, one for moving (may be the same army).
  const drawArmyRing = (armyId: string, color: string): void => {
    const entry = findArmy(armiesByTile, armyId);
    if (!entry) return;
    const { army, tileKey, tileIndex, total } = entry;

    // Towns swallow army tokens — don't draw ring when army is in a town tile.
    const tile = tiles[tileKey];
    if (tile?.hasTown) return;

    const { x: baseX, y: baseY } = axialToPixel(army.q, army.r);
    const offsetX = (tileIndex - (total - 1) / 2) * theme.army.stackSpacing;
    const cx = baseX + offsetX;
    const cy = baseY - 8;

    ctx.save();
    ctx.setLineDash([5, 3]);
    ctx.lineDashOffset = -phase;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, theme.army.ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  // Moving state takes precedence on the same army.
  if (movingArmyId) {
    drawArmyRing(movingArmyId, theme.army.movingColor);
    if (selectedArmyId && selectedArmyId !== movingArmyId) {
      drawArmyRing(selectedArmyId, theme.army.selectedColor);
    }
  } else if (selectedArmyId) {
    drawArmyRing(selectedArmyId, theme.army.selectedColor);
  }
};

// Animated overlay canvas — pulsing white fill on selected/active tiles.
// Runs on a dedicated rAF loop so the main canvas does not repaint every frame.

import { axialToPixel, hexCorners, HEX_SIZE, toKey } from '../../../utils/hexUtils';
import type { ArmiesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';

interface DrawOverlayArgs {
  ctx: CanvasRenderingContext2D;
  armies: ArmiesState;
  selectedTile: string | null;
  selectedArmyId: string | null;
  movingArmyId: string | null;
  flashingArmyId: string | null;
  nowMs: number;
  theme: AppTheme;
}

const traceTile = (ctx: CanvasRenderingContext2D, q: number, r: number): void => {
  const { x: cx, y: cy } = axialToPixel(q, r);
  const corners = hexCorners(cx, cy, HEX_SIZE);
  ctx.beginPath();
  corners.forEach((c, i) => {
    if (i === 0) ctx.moveTo(c.x, c.y);
    else ctx.lineTo(c.x, c.y);
  });
  ctx.closePath();
};

export const drawOverlay = ({
  ctx,
  armies,
  selectedTile,
  selectedArmyId,
  movingArmyId,
  flashingArmyId,
  nowMs,
  theme,
}: DrawOverlayArgs): void => {
  const { fillColor, pulseMaxAlpha, pulsePeriodMs } = theme.selection;

  // Ease-in-out sine pulse: 0 → pulseMaxAlpha → 0 over pulsePeriodMs.
  const t = (nowMs % pulsePeriodMs) / pulsePeriodMs;
  const alpha = pulseMaxAlpha * 0.5 * (1 - Math.cos(t * Math.PI * 2));

  // Collect unique tile keys to pulse.
  const pulseTiles = new Set<string>();
  if (selectedTile) pulseTiles.add(selectedTile);
  if (selectedArmyId) {
    const a = armies[selectedArmyId];
    if (a) pulseTiles.add(toKey(a.q, a.r));
  }
  if (movingArmyId) {
    const a = armies[movingArmyId];
    if (a) pulseTiles.add(toKey(a.q, a.r));
  }
  if (flashingArmyId) {
    const a = armies[flashingArmyId];
    if (a) pulseTiles.add(toKey(a.q, a.r));
  }

  if (pulseTiles.size === 0) return;

  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = alpha;

  pulseTiles.forEach((key) => {
    const [qStr, rStr] = key.split(',');
    traceTile(ctx, Number(qStr), Number(rStr));
    ctx.fill();
  });

  ctx.restore();
};

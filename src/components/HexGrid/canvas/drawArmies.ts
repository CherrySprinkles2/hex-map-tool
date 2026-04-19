// Renders the static parts of each army token (ring animations live on the
// overlay canvas). Each army gets:
//   - circle background
//   - land or naval icon (drawn from src/assets/army/*.svg at 85% opacity)
//   - faction dot in the lower-right
//   - optional haloed name below
//
// Icon appearance comes from src/assets/army/{land,naval}.svg — edit those
// files directly. Naval is used when the tile's terrain is deep water.

import { axialToPixel, DEEP_WATER } from '../../../utils/hexUtils';
import { getSvgCanvas } from '../../../utils/svgCache';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { Army } from '../../../types/domain';
import landUrl from '../../../assets/army/land.svg';
import navalUrl from '../../../assets/army/naval.svg';

interface DrawArmiesArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  armiesByTile: Record<string, Army[]>;
  factionColorMap: Record<string, string>;
  theme: AppTheme;
  selectedArmyId: string | null;
  movingArmyId: string | null;
}

const ARMY_SVG_SIZE = 24;

export const drawArmies = ({
  ctx,
  tiles,
  iterateKeys,
  armiesByTile,
  factionColorMap,
  theme,
  selectedArmyId,
  movingArmyId,
}: DrawArmiesArgs): void => {
  const armyCfg = theme.army;
  const iconSize = armyCfg.tokenRadius * 1.1;

  iterateKeys.forEach((tileKey) => {
    const tileArmies = armiesByTile[tileKey];
    if (!tileArmies || tileArmies.length === 0) return;

    // Skip armies inside town tiles — the kite shield stands in for them.
    const tile = tiles[tileKey];
    if (tile?.hasTown) return;

    const terrain = tile?.terrain ?? 'grass';
    const isNaval = DEEP_WATER.has(terrain);
    const iconCanvas = getSvgCanvas(isNaval ? navalUrl : landUrl, ARMY_SVG_SIZE, ARMY_SVG_SIZE);

    const [q, r] = tileKey.split(',').map(Number);
    const { x: baseX, y: baseY } = axialToPixel(q, r);

    tileArmies.forEach((army, idx) => {
      const offsetX = (idx - (tileArmies.length - 1) / 2) * armyCfg.stackSpacing;
      const cx = baseX + offsetX;
      const cy = baseY - 8;

      const isSelected = army.id === selectedArmyId;
      const isMoving = army.id === movingArmyId;
      const activeColor = isMoving ? armyCfg.movingColor : armyCfg.selectedColor;
      const strokeColor = isSelected || isMoving ? activeColor : armyCfg.tokenStroke;

      // Token
      ctx.beginPath();
      ctx.arc(cx, cy, armyCfg.tokenRadius, 0, Math.PI * 2);
      ctx.fillStyle = armyCfg.tokenFill;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon (drawn from the SVG at 85% opacity)
      if (iconCanvas) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(iconCanvas, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize);
        ctx.restore();
      }

      // Faction dot
      const factionId = army.factionId ?? null;
      if (factionId) {
        const color = factionColorMap[factionId];
        if (color) {
          const dx = cx + armyCfg.tokenRadius * 0.65;
          const dy = cy + armyCfg.tokenRadius * 0.65;
          ctx.beginPath();
          ctx.arc(dx, dy, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = armyCfg.tokenFill;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Label
      if (army.name) {
        const labelY = cy + armyCfg.tokenRadius + 14;
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = armyCfg.labelStrokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = armyCfg.labelStroke;
        ctx.strokeText(army.name, cx, labelY);
        ctx.fillStyle = armyCfg.labelFill;
        ctx.fillText(army.name, cx, labelY);
      }
    });
  });
};

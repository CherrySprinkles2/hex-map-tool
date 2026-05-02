// Renders the static parts of each army token (ring animations live on the
// overlay canvas). Each army gets:
//   - circle background
//   - land or naval icon (drawn from src/assets/army/*.svg at 85% opacity)
//   - faction dot in the lower-right
//   - dashed garrison ring when insideTown is true
//   - name label below (only when this is the sole army on the tile)
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
}

const ARMY_SVG_SIZE = 24;

export const drawArmies = ({
  ctx,
  tiles,
  iterateKeys,
  armiesByTile,
  factionColorMap,
  theme,
}: DrawArmiesArgs): void => {
  const armyCfg = theme.army;
  const iconSize = armyCfg.tokenRadius * 1.1;

  iterateKeys.forEach((tileKey) => {
    const tileArmies = armiesByTile[tileKey];
    if (!tileArmies || tileArmies.length === 0) return;

    const tile = tiles[tileKey];
    const terrain = tile?.terrain ?? 'grass';
    const isNaval = DEEP_WATER.has(terrain);
    const iconCanvas = getSvgCanvas(isNaval ? navalUrl : landUrl, ARMY_SVG_SIZE, ARMY_SVG_SIZE);

    const [q, r] = tileKey.split(',').map(Number);
    const { x: baseX, y: baseY } = axialToPixel(q, r);

    tileArmies.forEach((army, idx) => {
      const offsetX = (idx - (tileArmies.length - 1) / 2) * armyCfg.stackSpacing;
      const cx = baseX + offsetX;
      const cy = baseY - 8;

      // Token
      ctx.beginPath();
      ctx.arc(cx, cy, armyCfg.tokenRadius, 0, Math.PI * 2);
      ctx.fillStyle = armyCfg.tokenFill;
      ctx.fill();
      ctx.strokeStyle = armyCfg.tokenStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dashed garrison ring for armies inside a town
      if (army.insideTown && tile?.hasTown) {
        ctx.save();
        ctx.strokeStyle = theme.garrison.borderColor;
        ctx.lineWidth = theme.garrison.borderWidth;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(cx, cy, armyCfg.tokenRadius + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

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

      // Name label only for the lone army on a tile
      if (tileArmies.length === 1 && army.name) {
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

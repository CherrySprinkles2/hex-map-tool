// Draws for each town tile:
//   - ground-fill circle with the town SVG (buildings + streets) clipped to the circle
//   - fortification ring + wall marks (palisade or stone)
//
// The village/town/city appearance comes from src/assets/town/*.svg — edit
// those files directly to change the look. SVGs use a 60×60 viewBox and are
// scaled to `radius * 2` at draw time.

import { axialToPixel } from '../../../utils/hexUtils';
import { getSvgCanvas } from '../../../utils/svgCache';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import villageUrl from '../../../assets/town/village.svg';
import townUrl from '../../../assets/town/town.svg';
import cityUrl from '../../../assets/town/city.svg';

interface DrawTownsArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  theme: AppTheme;
}

const TOWN_SVG_SIZE = 60;
const TOWN_URLS: Record<'village' | 'town' | 'city', string> = {
  village: villageUrl,
  town: townUrl,
  city: cityUrl,
};

export const drawTowns = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  theme,
}: DrawTownsArgs): void => {
  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasTown) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const { q, r } = tile;
    const { x: cx, y: cy } = axialToPixel(q, r);

    const fortification = tile.fortification ?? 'none';
    const fortConfig = fortification === 'none' ? null : theme.town.fortification[fortification];
    const townSize = tile.townSize ?? 'town';
    const radius = theme.town.size[townSize].radius;

    // Ground circle, clipped for the town SVG
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = theme.town.groundColor;
    ctx.fill();
    ctx.clip();

    const townCanvas = getSvgCanvas(TOWN_URLS[townSize], TOWN_SVG_SIZE, TOWN_SVG_SIZE);
    if (townCanvas) {
      ctx.drawImage(townCanvas, cx - radius, cy - radius, radius * 2, radius * 2);
    }
    ctx.restore();

    // Fortification ring
    if (fortConfig) {
      ctx.save();
      ctx.strokeStyle = fortConfig.wallColor;
      ctx.lineWidth = fortConfig.wallWidth;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Wall marks
      ctx.strokeStyle = fortConfig.markColor;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < fortConfig.markCount; i++) {
        const angle = (i / fortConfig.markCount) * 2 * Math.PI;
        const inner = radius - 1.5;
        const outer = radius + 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
        ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle));
        ctx.stroke();
      }
      ctx.restore();
    }
  });
};

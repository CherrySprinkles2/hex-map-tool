// Draws for each town tile:
//   - ground-fill circle with the town SVG (buildings + streets) clipped to the circle
//   - fortification ring + wall marks (palisade or stone)
//   - kite shield when a faction army is garrisoned
//
// The village/town/city appearance comes from src/assets/town/*.svg — edit
// those files directly to change the look. SVGs use a 60×60 viewBox and are
// scaled to `radius * 2` at draw time.

import { axialToPixel, toKey } from '../../../utils/hexUtils';
import { getSvgCanvas } from '../../../utils/svgCache';
import type { TilesState } from '../../../types/state';
import type { AppTheme } from '../../../types/theme';
import type { Army } from '../../../types/domain';
import villageUrl from '../../../assets/town/village.svg';
import townUrl from '../../../assets/town/town.svg';
import cityUrl from '../../../assets/town/city.svg';

interface DrawTownsArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  iterateKeys: Set<string>;
  deepWaterSet: Set<string>;
  armiesByTile: Record<string, Army[]>;
  factionColorMap: Record<string, string>;
  theme: AppTheme;
}

const TOWN_SVG_SIZE = 60;
const TOWN_URLS: Record<'village' | 'town' | 'city', string> = {
  village: villageUrl,
  town: townUrl,
  city: cityUrl,
};

const drawKiteShield = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  factionColor: string | null
): void => {
  const h = radius * 1.5;
  const w = h * (20 / 28);
  const fill = factionColor ?? '#3a3a6a';
  const sw = Math.max(1, radius * 0.055);

  const l = cx - w / 2;
  const r = cx + w / 2;
  const t = cy - h / 2;
  const b = cy + h / 2;
  const ym = t + h * 0.625;

  const bossCy = t + h * 0.45;
  const bossR = w * 0.12;
  const crossY = t + h * 0.4;

  const bodyPath = new Path2D();
  bodyPath.moveTo(l, t);
  bodyPath.lineTo(r, t);
  bodyPath.lineTo(r, ym);
  bodyPath.quadraticCurveTo(r, b, cx, b);
  bodyPath.quadraticCurveTo(l, b, l, ym);
  bodyPath.closePath();

  ctx.save();
  // Drop shadow (offset by +0.8, +1.2)
  ctx.translate(0.8, 1.2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill(bodyPath);
  ctx.translate(-0.8, -1.2);

  // Body
  ctx.fillStyle = fill;
  ctx.fill(bodyPath);
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = sw;
  ctx.stroke(bodyPath);

  // Top-left highlight
  const hl = new Path2D();
  hl.moveTo(l + sw, t + sw);
  hl.lineTo(cx - 1, t + sw);
  hl.lineTo(cx - 1, t + h * 0.38);
  hl.lineTo(l + sw, t + h * 0.52);
  hl.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill(hl);

  // Spine
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = sw * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, t + sw);
  ctx.lineTo(cx, b - sw * 2);
  ctx.stroke();

  // Crossbar
  ctx.beginPath();
  ctx.moveTo(l + sw, crossY);
  ctx.lineTo(r - sw, crossY);
  ctx.stroke();

  // Boss
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.arc(cx, bossCy, bossR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = sw * 0.4;
  ctx.stroke();
  ctx.restore();
};

export const drawTowns = ({
  ctx,
  tiles,
  iterateKeys,
  deepWaterSet,
  armiesByTile,
  factionColorMap,
  theme,
}: DrawTownsArgs): void => {
  iterateKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.hasTown) return;
    if (deepWaterSet.has(tile.terrain)) return;

    const { q, r } = tile;
    const tileKey = toKey(q, r);
    const { x: cx, y: cy } = axialToPixel(q, r);
    const armies = armiesByTile[tileKey] ?? [];
    const garrisoned = armies.length > 0;

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

    // Garrison shield
    if (garrisoned) {
      const factionId = armies[0]?.factionId ?? null;
      const factionColor = factionId ? (factionColorMap[factionId] ?? null) : null;
      drawKiteShield(ctx, cx, cy, radius, factionColor);
    }
  });
};

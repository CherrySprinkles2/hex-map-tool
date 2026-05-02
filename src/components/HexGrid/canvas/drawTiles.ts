// Canvas rendering for the base-tile layer.
// Mirrors the output of HexTile.tsx: base fill color + pattern overlay + tile
// stroke, plus optional faction-mode inner ring and hover highlight.

import { hexCorners, HEX_SIZE, axialToPixel } from '../../../utils/hexUtils';
import type { TilesState } from '../../../types/state';
import type { CustomTerrainType, Faction } from '../../../types/domain';
import type { AppTheme } from '../../../types/theme';
import type { PatternCache } from './patternCache';

interface DrawTilesArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  visibleKeys: Set<string>;
  customTerrains: CustomTerrainType[];
  factions: Faction[];
  theme: AppTheme;
  patternCache: PatternCache;
  mapMode: 'terrain' | 'faction' | 'terrain-paint';
  hoveredKey: string | null;
}

const tracePath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void => {
  const corners = hexCorners(cx, cy, radius);
  ctx.beginPath();
  corners.forEach((c, i) => {
    if (i === 0) ctx.moveTo(c.x, c.y);
    else ctx.lineTo(c.x, c.y);
  });
  ctx.closePath();
};

const resolveBaseColor = (
  terrainId: string,
  customTerrains: CustomTerrainType[],
  theme: AppTheme
): string => {
  const builtIn = theme.terrain[terrainId as keyof typeof theme.terrain];
  if (builtIn) return builtIn.color.trim();
  const custom = customTerrains.find((ct) => {
    return ct.id === terrainId;
  });
  if (custom) return custom.color.trim();
  return theme.terrain.grass.color.trim();
};

export const drawTiles = ({
  ctx,
  tiles,
  visibleKeys,
  customTerrains,
  factions,
  theme,
  patternCache,
  mapMode,
  hoveredKey,
}: DrawTilesArgs): void => {
  const factionColorMap: Record<string, string> = {};
  factions.forEach((f) => {
    factionColorMap[f.id] = f.color;
  });

  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';

  visibleKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile) return;
    const { x: cx, y: cy } = axialToPixel(tile.q, tile.r);

    // Base fill
    tracePath(ctx, cx, cy, HEX_SIZE);
    ctx.fillStyle = resolveBaseColor(tile.terrain, customTerrains, theme);
    ctx.fill();

    // Pattern overlay (same path)
    const pattern = patternCache.get(tile.terrain);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fill();
    }

    // Tile stroke
    ctx.strokeStyle = theme.tileStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Faction overlay (only in faction mode)
    if (mapMode === 'faction' && tile.factionId) {
      const color = factionColorMap[tile.factionId];
      if (color) {
        tracePath(ctx, cx, cy, HEX_SIZE - 5);
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.stroke();
      }
    }

    // Hover highlight
    if (hoveredKey === key) {
      tracePath(ctx, cx, cy, HEX_SIZE);
      ctx.fillStyle = `rgba(255,255,255,${theme.selection.hoverAlpha})`;
      ctx.fill();
    }
  });

  // Avoid leaking pattern fillStyle into later paint passes.
  ctx.fillStyle = '#000';
};

export { resolveBaseColor, tracePath };

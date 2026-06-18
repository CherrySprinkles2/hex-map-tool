// Canvas rendering for the base-tile layer.
// Mirrors the output of HexTile.tsx: base fill color + pattern overlay + tile
// stroke. The faction overlay is drawn separately (greyscale + faction tint +
// territory borders); the hover highlight lives on the overlay canvas.

import {
  hexCorners,
  HEX_SIZE,
  axialToPixel,
  NEIGHBOR_DIRS,
  DIR_TO_EDGE_CORNER,
  toKey,
} from '../../../utils/hexUtils';
import type { PixelCoord } from '../../../utils/hexUtils';
import type { TilesState } from '../../../types/state';
import type { CustomTerrainType } from '../../../types/domain';
import type { AppTheme } from '../../../types/theme';
import type { PatternCache } from './patternCache';

interface DrawTilesArgs {
  ctx: CanvasRenderingContext2D;
  tiles: TilesState;
  visibleKeys: Set<string>;
  customTerrains: CustomTerrainType[];
  theme: AppTheme;
  patternCache: PatternCache;
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

// Adds a hex outline as a subpath without resetting the current path — used to
// build a multi-hex clip region (tracePath calls beginPath, so it can't).
const traceSubpath = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): void => {
  const corners = hexCorners(cx, cy, radius);
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

// Draws each faction's territory as a single crisp outline.
//
// Border edges (edges whose neighbour belongs to a different or no faction) are
// grouped per faction and stroked once, clipped to the union of the faction's
// tiles. The clip keeps the inner half of the stroke inside the territory — two
// factions sharing an edge each keep their own colour on their own side.
export const drawTerritoryBorders = (
  ctx: CanvasRenderingContext2D,
  tiles: TilesState,
  visibleKeys: Set<string>,
  factionColorMap: Record<string, string>,
  theme: AppTheme
): void => {
  interface BorderGroup {
    color: string;
    // Tiles forming the clip region: every border tile plus its same-faction
    // neighbours, so the glow never gets cut off at the viewport edge.
    clipKeys: Set<string>;
    edges: Array<[PixelCoord, PixelCoord]>;
  }
  const groups = new Map<string, BorderGroup>();

  visibleKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile || !tile.factionId) return;
    const color = factionColorMap[tile.factionId];
    if (!color) return;

    const borderDirs: number[] = [];
    const sameFactionNeighbors: string[] = [];
    NEIGHBOR_DIRS.forEach((d, i) => {
      const neighborKey = toKey(tile.q + d.q, tile.r + d.r);
      const neighbor = tiles[neighborKey];
      if (neighbor && neighbor.factionId === tile.factionId) {
        sameFactionNeighbors.push(neighborKey);
      } else {
        borderDirs.push(i);
      }
    });
    if (borderDirs.length === 0) return;

    let group = groups.get(tile.factionId);
    if (!group) {
      group = { color, clipKeys: new Set(), edges: [] };
      groups.set(tile.factionId, group);
    }
    group.clipKeys.add(key);
    sameFactionNeighbors.forEach((neighborKey) => {
      group!.clipKeys.add(neighborKey);
    });

    const { x: cx, y: cy } = axialToPixel(tile.q, tile.r);
    const corners = hexCorners(cx, cy, HEX_SIZE);
    borderDirs.forEach((i) => {
      const ci = DIR_TO_EDGE_CORNER[i];
      group!.edges.push([corners[ci], corners[(ci + 1) % 6]]);
    });
  });

  groups.forEach((group) => {
    ctx.save();

    ctx.beginPath();
    group.clipKeys.forEach((key) => {
      const tile = tiles[key];
      if (!tile) return;
      const { x, y } = axialToPixel(tile.q, tile.r);
      traceSubpath(ctx, x, y, HEX_SIZE);
    });
    ctx.clip();

    ctx.beginPath();
    group.edges.forEach(([a, b]) => {
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = group.color;
    ctx.lineWidth = theme.factionBorder.width * 2;
    ctx.stroke();

    ctx.restore();
  });
};

export const drawTiles = ({
  ctx,
  tiles,
  visibleKeys,
  customTerrains,
  theme,
  patternCache,
}: DrawTilesArgs): void => {
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
  });

  // Avoid leaking pattern fillStyle into later paint passes.
  ctx.fillStyle = '#000';
};

export { resolveBaseColor, tracePath };

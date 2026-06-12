// Renders the map to an offscreen canvas and downloads it as a PNG.
//
// Reuses the same draw modules as HexRenderer, with three deliberate
// differences: no ghost tiles, no hover/selection overlays, and no background
// fill (the PNG keeps a transparent backdrop). Faction colouring, when
// requested, always uses the territory-border style rather than per-tile rings.

import { createPatternCache } from '../components/HexGrid/canvas/patternCache';
import { drawTiles } from '../components/HexGrid/canvas/drawTiles';
import { drawRivers } from '../components/HexGrid/canvas/drawRivers';
import { drawRoads } from '../components/HexGrid/canvas/drawRoads';
import { drawCauseways } from '../components/HexGrid/canvas/drawCauseways';
import { drawTowns } from '../components/HexGrid/canvas/drawTowns';
import { drawPorts } from '../components/HexGrid/canvas/drawPorts';
import { drawLabels } from '../components/HexGrid/canvas/drawLabels';
import { drawArmies } from '../components/HexGrid/canvas/drawArmies';
import { axialToPixel, buildDeepWaterSet, toKey, HEX_SIZE } from './hexUtils';
import { getMapViewMetrics } from './mapViewMetrics';
import { theme } from '../styles/theme';
import type { TilesState, ArmiesState, FactionsState } from '../types/state';
import type { Army, CustomTerrainType } from '../types/domain';

// Browsers cap canvas dimensions — keep the longest side safely below the
// limit and scale the whole render down to fit when a map is larger.
const MAX_SIDE = 8192;

export type PngExportArea = 'full' | 'viewport';

export interface ExportMapPngOptions {
  tiles: TilesState;
  armies: ArmiesState;
  factions: FactionsState;
  customTerrains: CustomTerrainType[];
  area: PngExportArea;
  includeFactionBorders: boolean;
  fileName: string;
}

const renderMapToCanvas = ({
  tiles,
  armies,
  factions,
  customTerrains,
  area,
  includeFactionBorders,
}: Omit<ExportMapPngOptions, 'fileName'>): HTMLCanvasElement | null => {
  const tileValues = Object.values(tiles);
  if (tileValues.length === 0) return null;

  let width: number;
  let height: number;
  let scale: number;
  let tx: number;
  let ty: number;

  if (area === 'viewport') {
    const view = getMapViewMetrics();
    if (!view || view.width <= 0 || view.height <= 0) return null;
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      MAX_SIDE / view.width,
      MAX_SIDE / view.height
    );
    width = Math.round(view.width * dpr);
    height = Math.round(view.height * dpr);
    scale = dpr * view.viewport.scale;
    tx = dpr * (view.width / 2 + view.viewport.x);
    ty = dpr * (view.height / 2 + view.viewport.y);
  } else {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    tileValues.forEach(({ q, r }) => {
      const { x, y } = axialToPixel(q, r);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
    const contentW = maxX - minX + HEX_SIZE * 2;
    const contentH = maxY - minY + HEX_SIZE * 2;
    scale = Math.min(1, MAX_SIDE / contentW, MAX_SIDE / contentH);
    width = Math.ceil(contentW * scale);
    height = Math.ceil(contentH * scale);
    tx = width / 2 - ((minX + maxX) / 2) * scale;
    ty = height / 2 - ((minY + maxY) / 2) * scale;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const patternCache = createPatternCache(ctx);
  patternCache.syncCustom(customTerrains);

  ctx.setTransform(scale, 0, 0, scale, tx, ty);

  const allKeys = new Set(Object.keys(tiles));
  const deepWaterSet = buildDeepWaterSet(customTerrains);

  drawTiles({
    ctx,
    tiles,
    visibleKeys: allKeys,
    customTerrains,
    factions,
    theme,
    patternCache,
    mapMode: includeFactionBorders ? 'faction' : 'terrain',
    hoveredKey: null,
    factionBordersOnly: true,
  });

  const riverCurvesByTile = drawRivers({ ctx, tiles, iterateKeys: allKeys, deepWaterSet, theme });
  drawRoads({ ctx, tiles, iterateKeys: allKeys, deepWaterSet, riverCurvesByTile, theme });
  drawCauseways({ ctx, tiles, iterateKeys: allKeys, deepWaterSet, theme });
  drawTowns({ ctx, tiles, iterateKeys: allKeys, deepWaterSet, theme });
  drawPorts({ ctx, tiles, iterateKeys: allKeys, deepWaterSet, theme });
  drawLabels({ ctx, tiles, iterateKeys: allKeys, deepWaterSet, theme });

  const armiesByTile: Record<string, Army[]> = {};
  Object.values(armies).forEach((army) => {
    const key = toKey(army.q, army.r);
    if (!armiesByTile[key]) armiesByTile[key] = [];
    armiesByTile[key].push(army);
  });
  const factionColorMap: Record<string, string> = {};
  factions.forEach((f) => {
    factionColorMap[f.id] = f.color;
  });
  drawArmies({ ctx, tiles, iterateKeys: allKeys, armiesByTile, factionColorMap, theme });

  return canvas;
};

/** Renders and downloads the PNG. Returns false when there is nothing to export. */
export const exportMapPng = ({ fileName, ...renderOptions }: ExportMapPngOptions): boolean => {
  const canvas = renderMapToCanvas(renderOptions);
  if (!canvas) return false;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
  return true;
};

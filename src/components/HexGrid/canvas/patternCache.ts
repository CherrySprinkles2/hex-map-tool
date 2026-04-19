// Offscreen-canvas cache for terrain fill patterns.
//
// Each built-in pattern is sourced from an SVG file in src/assets/patterns.
// The SVG is rasterised into an offscreen canvas the size of the pattern's
// repeat tile, then wrapped as a `CanvasPattern` via
// `ctx.createPattern(tile, 'repeat')`. Designers can edit the SVGs directly —
// no code changes needed.
//
// Custom terrains reuse the same SVG but recolour every mark into a single
// tint derived from the terrain's base color (via `source-in` composition).
//
// SVGs load asynchronously. Until an SVG is ready the getter returns `null`
// and the caller falls back to a flat fill. HexRenderer registers a repaint
// callback with `svgCache` so the map redraws as soon as assets arrive.
import type { CustomTerrainType, PatternKey } from '../../../types/domain';
import { patternMarkColor } from '../../../utils/patternColor';
import { getSvgCanvas, getTintedSvgCanvas, preloadSvgs } from '../../../utils/svgCache';
import grassUrl from '../../../assets/patterns/grass.svg';
import farmUrl from '../../../assets/patterns/farm.svg';
import forestUrl from '../../../assets/patterns/forest.svg';
import mountainUrl from '../../../assets/patterns/mountain.svg';
import lakeUrl from '../../../assets/patterns/lake.svg';
import oceanUrl from '../../../assets/patterns/ocean.svg';
import desertUrl from '../../../assets/patterns/desert.svg';
import swampUrl from '../../../assets/patterns/swamp.svg';
import jungleUrl from '../../../assets/patterns/jungle.svg';
import hillsUrl from '../../../assets/patterns/hills.svg';
import badlandsUrl from '../../../assets/patterns/badlands.svg';

interface PatternSpec {
  url: string;
  w: number;
  h: number;
}

// Sizes match each SVG's viewBox — the tile is rasterised at native size so
// `createPattern` repeats it at 1 CSS pixel per SVG unit.
const PATTERNS: Record<Exclude<PatternKey, 'none'>, PatternSpec> = {
  grass: { url: grassUrl, w: 14, h: 14 },
  farm: { url: farmUrl, w: 20, h: 7 },
  forest: { url: forestUrl, w: 15, h: 15 },
  mountain: { url: mountainUrl, w: 22, h: 13 },
  lake: { url: lakeUrl, w: 30, h: 10 },
  ocean: { url: oceanUrl, w: 50, h: 18 },
  desert: { url: desertUrl, w: 16, h: 16 },
  swamp: { url: swampUrl, w: 18, h: 16 },
  jungle: { url: jungleUrl, w: 12, h: 12 },
  hills: { url: hillsUrl, w: 24, h: 14 },
  badlands: { url: badlandsUrl, w: 20, h: 20 },
};

preloadSvgs(
  Object.values(PATTERNS).map((p) => {
    return p.url;
  })
);

// Terrain IDs that are built-in (present in theme.terrain) map 1:1 to a PatternKey.
const BUILTIN_TERRAIN_PATTERN: Record<string, Exclude<PatternKey, 'none'>> = {
  grass: 'grass',
  farm: 'farm',
  forest: 'forest',
  mountain: 'mountain',
  lake: 'lake',
  ocean: 'ocean',
};

export interface PatternCache {
  /** Returns a CanvasPattern for the given terrain id, or null if unavailable. */
  get(terrainId: string): CanvasPattern | null;
  /** Rebuilds the cached entries for the given custom-terrain set. */
  syncCustom(customTerrains: CustomTerrainType[]): void;
  /** Clears builtin patterns so the next get() re-reads from svgCache. Used after async SVG load. */
  refresh(): void;
}

export const createPatternCache = (hostCtx: CanvasRenderingContext2D): PatternCache => {
  const cache = new Map<string, CanvasPattern | null>();
  const customFingerprints = new Map<string, string>();

  const buildBuiltin = (terrainId: string, spec: PatternSpec): CanvasPattern | null => {
    const tile = getSvgCanvas(spec.url, spec.w, spec.h);
    if (!tile) return null;
    const pattern = hostCtx.createPattern(tile, 'repeat');
    if (pattern) cache.set(terrainId, pattern);
    return pattern;
  };

  const buildCustom = (id: string, spec: PatternSpec, tint: string): CanvasPattern | null => {
    const tile = getTintedSvgCanvas(spec.url, spec.w, spec.h, tint);
    if (!tile) return null;
    const pattern = hostCtx.createPattern(tile, 'repeat');
    if (pattern) cache.set(id, pattern);
    return pattern;
  };

  const syncCustom = (customTerrains: CustomTerrainType[]): void => {
    const seen = new Set<string>();
    customTerrains.forEach((ct) => {
      const fingerprint = `${ct.patternKey}::${ct.color}`;
      seen.add(ct.id);
      if (customFingerprints.get(ct.id) === fingerprint && cache.has(ct.id)) return;
      customFingerprints.set(ct.id, fingerprint);
      if (ct.patternKey === 'none') {
        cache.set(ct.id, null);
        return;
      }
      const mark = patternMarkColor(ct.color);
      buildCustom(ct.id, PATTERNS[ct.patternKey], mark);
    });
    // Drop cache entries for removed custom terrains.
    for (const id of [...customFingerprints.keys()]) {
      if (!seen.has(id)) {
        customFingerprints.delete(id);
        cache.delete(id);
      }
    }
  };

  return {
    get: (terrainId) => {
      if (cache.has(terrainId)) return cache.get(terrainId) ?? null;
      // Lazy build for builtins — handles the case where the SVG loaded after
      // initial construction. `refresh()` clears the entries so we fall here.
      const key = BUILTIN_TERRAIN_PATTERN[terrainId];
      if (!key) return null;
      return buildBuiltin(terrainId, PATTERNS[key]);
    },
    syncCustom,
    refresh: () => {
      cache.clear();
      customFingerprints.clear();
    },
  };
};

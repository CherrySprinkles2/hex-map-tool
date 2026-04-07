// Causeway path resolution using the legacy bitmask/canonical-path system.
//
// River and road paths have been migrated to the programmatic generator in
// pathGenerator.ts. This file is retained for causeway rendering only (roads
// through deep-water tiles), which still uses precomputed SVG path data.
//
// TODO: migrate causeways to pathGenerator and delete this file.

import { ROAD_CANONICAL_PATHS, CAUSEWAY_CANONICAL_PATHS } from '../data/routePaths';

// ── Bitmask primitives ────────────────────────────────────────────────────────

// Rotate bitmask: each active bit i becomes (i + steps) % 6.
export const rotateBitmask = (bitmask: number, steps: number): number => {
  const s = ((steps % 6) + 6) % 6;
  if (s === 0) return bitmask & 0x3f;
  return ((bitmask << s) | (bitmask >> (6 - s))) & 0x3f;
};

// Reflect bitmask across the E–W axis: bit i → bit (6 − i) % 6.
export const reflectBitmask = (bitmask: number): number => {
  return (
    (bitmask & 0b001001) |
    ((bitmask & 0b000010) << 4) |
    ((bitmask & 0b000100) << 2) |
    ((bitmask & 0b010000) >> 2) |
    ((bitmask & 0b100000) >> 4)
  );
};

// ── Normalisation ─────────────────────────────────────────────────────────────

export interface NormalisedBitmask {
  canonical: number;
  rotation: number;
  reflected: boolean;
}

export const normaliseBitmask = (bitmask: number): NormalisedBitmask => {
  let canonical = bitmask;
  for (let k = 0; k < 6; k++) {
    canonical = Math.min(canonical, rotateBitmask(bitmask, k));
    canonical = Math.min(canonical, rotateBitmask(reflectBitmask(bitmask), k));
  }

  for (let k = 0; k < 6; k++) {
    if (rotateBitmask(canonical, k) === bitmask) {
      return { canonical, rotation: k, reflected: false };
    }
    if (rotateBitmask(reflectBitmask(canonical), k) === bitmask) {
      return { canonical, rotation: k, reflected: true };
    }
  }

  return { canonical, rotation: 0, reflected: false };
};

// ── SVG transform string ──────────────────────────────────────────────────────

export const pathTransform = (rotation: number, reflected: boolean): string => {
  const angle = -rotation * 60;
  if (reflected && angle !== 0) return `rotate(${angle}) scale(1,-1)`;
  if (reflected) return 'scale(1,-1)';
  if (angle !== 0) return `rotate(${angle})`;
  return '';
};

// ── Causeway path resolution ──────────────────────────────────────────────────

export interface ResolvedCausewayPaths {
  paths: Array<{ d: string; transform: string }>;
  notches: Array<{ d: string; transform: string }>;
}

// Resolve paths for a deep-water road tile (causeway).
// Returns the embankment path from ROAD_CANONICAL_PATHS and, if a causeway entry
// exists, the perpendicular channel notch lines. Falls back to road paths only
// when no causeway entry is defined for the canonical bitmask.
export const resolveCausewayPaths = (bitmask: number): ResolvedCausewayPaths => {
  const { canonical, rotation, reflected } = normaliseBitmask(bitmask);
  const t = pathTransform(rotation, reflected);

  const roadEntry = ROAD_CANONICAL_PATHS[canonical];
  const causewayEntry = CAUSEWAY_CANONICAL_PATHS[canonical];

  return {
    paths: roadEntry
      ? roadEntry.paths.map((d) => {
          return { d, transform: t };
        })
      : [],
    notches: causewayEntry
      ? causewayEntry.notches.map((d) => {
          return { d, transform: t };
        })
      : [],
  };
};

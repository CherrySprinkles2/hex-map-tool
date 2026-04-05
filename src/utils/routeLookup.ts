// Route lookup: bitmask normalisation, connection computation, and path resolution.
//
// The dihedral group of the hexagon (6 rotations × 2 reflections = 12 transforms)
// is used to map any connection bitmask to its canonical (minimum-value) form.
// The canonical paths are defined in src/data/routePaths.ts; at render time an
// SVG rotate() + optional scale(1,-1) transform is applied to orient them correctly.
//
// Bitmask bit layout (matches NEIGHBOR_DIRS index in hexUtils.ts):
//   bit 0 = E   bit 1 = NE   bit 2 = NW
//   bit 3 = W   bit 4 = SW   bit 5 = SE

import {
  ROAD_CANONICAL_PATHS,
  RIVER_CANONICAL_PATHS,
  COMBINED_CANONICAL_PATHS,
  CAUSEWAY_CANONICAL_PATHS,
} from '../data/routePaths';
import { NEIGHBOR_DIRS, toKey, DEEP_WATER } from './hexUtils';
import type { TilesState } from '../types/state';

type FlagKey = 'hasRiver' | 'hasRoad';
type BlockedKey = 'riverBlocked' | 'roadBlocked';

const FLAG_BLOCKED: Record<FlagKey, BlockedKey> = {
  hasRiver: 'riverBlocked',
  hasRoad: 'roadBlocked',
};

// ── Bitmask primitives ────────────────────────────────────────────────────────

// Rotate bitmask: each active bit i becomes (i + steps) % 6.
export const rotateBitmask = (bitmask: number, steps: number): number => {
  const s = ((steps % 6) + 6) % 6;
  if (s === 0) return bitmask & 0x3f;
  return ((bitmask << s) | (bitmask >> (6 - s))) & 0x3f;
};

// Reflect bitmask across the E–W axis: bit i → bit (6 − i) % 6.
// Maps NE(1)↔SE(5) and NW(2)↔SW(4); E(0) and W(3) are fixed.
export const reflectBitmask = (bitmask: number): number => {
  return (
    (bitmask & 0b001001) | // bits 0, 3 unchanged
    ((bitmask & 0b000010) << 4) | // bit 1 → bit 5
    ((bitmask & 0b000100) << 2) | // bit 2 → bit 4
    ((bitmask & 0b010000) >> 2) | // bit 4 → bit 2
    ((bitmask & 0b100000) >> 4) // bit 5 → bit 1
  );
};

const popcount = (n: number): number => {
  let x = n & 0x3f;
  let count = 0;
  while (x) {
    count += x & 1;
    x >>= 1;
  }
  return count;
};

// Cap to at most 4 active bits, keeping the lowest-index ones.
const capAt4 = (bitmask: number): number => {
  if (popcount(bitmask) <= 4) return bitmask;
  let result = 0;
  let count = 0;
  for (let i = 0; i < 6 && count < 4; i++) {
    if (bitmask & (1 << i)) {
      result |= 1 << i;
      count++;
    }
  }
  return result;
};

// ── Normalisation ─────────────────────────────────────────────────────────────

export interface NormalisedBitmask {
  canonical: number;
  rotation: number; // steps (0–5): rotate canonical path by −rotation × 60°
  reflected: boolean; // if true, reflect path before rotating
}

// Returns the canonical form and the transform (reflected, rotation) such that:
//   rotateBitmask(reflected ? reflectBitmask(canonical) : canonical, rotation) === bitmask
export const normaliseBitmask = (bitmask: number): NormalisedBitmask => {
  // Find minimum bitmask value across all 12 dihedral transforms
  let canonical = bitmask;
  for (let k = 0; k < 6; k++) {
    canonical = Math.min(canonical, rotateBitmask(bitmask, k));
    canonical = Math.min(canonical, rotateBitmask(reflectBitmask(bitmask), k));
  }

  // Find the forward transform: transform(reflected, rotation)(canonical) === bitmask
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

export interface NormalisedPair {
  canonicalRoad: number;
  canonicalRiver: number;
  rotation: number;
  reflected: boolean;
}

// Jointly normalise a (road, river) bitmask pair using lexicographic ordering.
export const normalisePair = (roadBitmask: number, riverBitmask: number): NormalisedPair => {
  let minRoad = roadBitmask;
  let minRiver = riverBitmask;

  for (const reflected of [false, true]) {
    const rb = reflected ? reflectBitmask(roadBitmask) : roadBitmask;
    const vb = reflected ? reflectBitmask(riverBitmask) : riverBitmask;
    for (let k = 0; k < 6; k++) {
      const cr = rotateBitmask(rb, k);
      const cv = rotateBitmask(vb, k);
      if (cr < minRoad || (cr === minRoad && cv < minRiver)) {
        minRoad = cr;
        minRiver = cv;
      }
    }
  }

  // Find the forward transform that maps (minRoad, minRiver) → (roadBitmask, riverBitmask)
  for (let k = 0; k < 6; k++) {
    if (rotateBitmask(minRoad, k) === roadBitmask && rotateBitmask(minRiver, k) === riverBitmask) {
      return { canonicalRoad: minRoad, canonicalRiver: minRiver, rotation: k, reflected: false };
    }
    if (
      rotateBitmask(reflectBitmask(minRoad), k) === roadBitmask &&
      rotateBitmask(reflectBitmask(minRiver), k) === riverBitmask
    ) {
      return { canonicalRoad: minRoad, canonicalRiver: minRiver, rotation: k, reflected: true };
    }
  }

  return { canonicalRoad: minRoad, canonicalRiver: minRiver, rotation: 0, reflected: false };
};

// ── Connection bitmask computation ────────────────────────────────────────────

export const computeBitmask = (tiles: TilesState, q: number, r: number, flag: FlagKey): number => {
  const myKey = toKey(q, r);
  const tile = tiles[myKey];
  if (!tile?.[flag]) return 0;

  const blockedKey = FLAG_BLOCKED[flag];
  const blocked: string[] = tile[blockedKey] ?? [];

  let bitmask = 0;
  NEIGHBOR_DIRS.forEach((dir, i) => {
    const nk = toKey(q + dir.q, r + dir.r);
    const neighbor = tiles[nk];
    if (!neighbor?.[flag]) return;
    if (blocked.includes(nk)) return;
    if ((neighbor[blockedKey] ?? []).includes(myKey)) return;
    bitmask |= 1 << i;
  });

  return capAt4(bitmask);
};

// ── SVG transform string ──────────────────────────────────────────────────────

// Returns the SVG transform to apply to a canonical path to orient it correctly.
// In SVG, "A B" applies B first then A — so "rotate scale" means scale then rotate.
export const pathTransform = (rotation: number, reflected: boolean): string => {
  const angle = -rotation * 60;
  if (reflected && angle !== 0) return `rotate(${angle}) scale(1,-1)`;
  if (reflected) return 'scale(1,-1)';
  if (angle !== 0) return `rotate(${angle})`;
  return '';
};

// ── Path resolution ───────────────────────────────────────────────────────────

export interface ResolvedPaths {
  road: Array<{ d: string; transform: string }>;
  river: Array<{ d: string; transform: string }>;
  bridge: Array<{ d: string; transform: string }>;
}

// Resolve all paths for a tile that has both road and river.
// Checks the combined canonical table first; falls back to independent lookup.
export const resolveRoadRiverPaths = (roadBitmask: number, riverBitmask: number): ResolvedPaths => {
  const { canonicalRoad, canonicalRiver, rotation, reflected } = normalisePair(
    roadBitmask,
    riverBitmask
  );

  const combinedKey = `${canonicalRoad}|${canonicalRiver}`;
  const combined = COMBINED_CANONICAL_PATHS[combinedKey];
  const t = pathTransform(rotation, reflected);

  // Always resolve road and river independently — used as fallback when the
  // combined entry omits road/river paths (bridge-only entries).
  const { canonical: cRoad, rotation: rRoad, reflected: rfRoad } = normaliseBitmask(roadBitmask);
  const {
    canonical: cRiver,
    rotation: rRiver,
    reflected: rfRiver,
  } = normaliseBitmask(riverBitmask);
  const roadEntry = ROAD_CANONICAL_PATHS[cRoad];
  const riverEntry = RIVER_CANONICAL_PATHS[cRiver];
  const indRoad = roadEntry
    ? roadEntry.paths.map((d) => {
        return { d, transform: pathTransform(rRoad, rfRoad) };
      })
    : [];
  const indRiver = riverEntry
    ? riverEntry.paths.map((d) => {
        return { d, transform: pathTransform(rRiver, rfRiver) };
      })
    : [];

  if (combined) {
    return {
      // Use combined road/river paths if provided, otherwise fall back to independent lookup.
      road:
        combined.road.length > 0
          ? combined.road.map((d) => {
              return { d, transform: t };
            })
          : indRoad,
      river:
        combined.river.length > 0
          ? combined.river.map((d) => {
              return { d, transform: t };
            })
          : indRiver,
      bridge: combined.bridge.map((d) => {
        return { d, transform: t };
      }),
    };
  }

  return { road: indRoad, river: indRiver, bridge: [] };
};

// Resolve paths for a tile with only one feature (road or river).
export const resolveSinglePaths = (
  bitmask: number,
  flag: FlagKey
): Array<{ d: string; transform: string }> => {
  const { canonical, rotation, reflected } = normaliseBitmask(bitmask);
  const table = flag === 'hasRiver' ? RIVER_CANONICAL_PATHS : ROAD_CANONICAL_PATHS;
  const entry = table[canonical];
  if (!entry) return [];
  const t = pathTransform(rotation, reflected);
  return entry.paths.map((d) => {
    return { d, transform: t };
  });
};

// Re-export DEEP_WATER for use in overlayHelpers without an extra import
export { DEEP_WATER };

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

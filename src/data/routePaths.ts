// Canonical SVG path data for road and river rendering.
//
// All paths are defined relative to the tile centre (0, 0) with HEX_SIZE = 50.
// Direction indices match NEIGHBOR_DIRS in hexUtils.ts:
//   0 = E  (43.3, 0)       1 = NE (21.7, -37.5)   2 = NW (-21.7, -37.5)
//   3 = W  (-43.3, 0)      4 = SW (-21.7, 37.5)    5 = SE (21.7, 37.5)
//
// Keys are the canonical bitmask value (minimum bitmask in the dihedral orbit).
// At render time routeLookup.ts applies a rotate() and optional scale(1,-1) transform
// to orient the canonical path to match the actual connection directions.
//
// Canonical bitmasks and their active directions:
//   k=1:  1  → {0}         E stub
//   k=2:  3  → {0,1}       E–NE  60°
//         5  → {0,2}       E–NW  120°
//         9  → {0,3}       E–W   180°
//   k=3:  7  → {0,1,2}     E–NE–NW  (three consecutive)
//         11 → {0,1,3}     E–NE–W   (adjacent pair + opposite)
//         21 → {0,2,4}     E–NW–SW  (alternating, hub)
//   k=4:  15 → {0,1,2,3}   E–NE–NW–W  (four consecutive)
//         23 → {0,1,2,4}   E–NE–NW–SW (skip-one pair)
//         27 → {0,1,3,4}   E–NE–W–SW  (two opposite pairs / X-crossing)

export interface SegmentPaths {
  paths: string[];
}

// ── Roads ────────────────────────────────────────────────────────────────────
// Smooth, intentional curves — roads are engineered, not natural.
export const ROAD_CANONICAL_PATHS: Record<number, SegmentPaths> = {
  // k=1 ── stub
  1: {
    paths: ['M 43.3,0 C 22,0 11,0 0,0'],
  },

  // k=2 ── two-connection chords
  3: {
    // E–NE (60° — tight turn)
    paths: ['M 43.3,0 C 32,0 26,-14 21.7,-37.5'],
  },
  5: {
    // E–NW (120° — moderate curve)
    paths: ['M 43.3,0 C 22,0 2,-20 -21.7,-37.5'],
  },
  9: {
    // E–W (180° — nearly straight)
    paths: ['M 43.3,0 C 22,0 -22,0 -43.3,0'],
  },

  // k=3 ── three connections: primary chord (widest pair) + stub to centre
  7: {
    // E–NE–NW: primary E→NW (120°), stub NE→centre
    paths: ['M 43.3,0 C 22,0 2,-20 -21.7,-37.5', 'M 21.7,-37.5 C 15,-25 8,-12 0,0'],
  },
  11: {
    // E–NE–W: primary E→W (180°), stub NE→centre
    paths: ['M 43.3,0 C 22,0 -22,0 -43.3,0', 'M 21.7,-37.5 C 15,-25 8,-12 0,0'],
  },
  21: {
    // E–NW–SW: all 120° apart — hub-and-spoke to centre
    paths: [
      'M 43.3,0 C 22,0 11,0 0,0',
      'M -21.7,-37.5 C -11,-19 -5,-9 0,0',
      'M -21.7,37.5 C -11,19 -5,9 0,0',
    ],
  },

  // k=4 ── four connections: two non-overlapping chords
  15: {
    // E–NE–NW–W: primary E→W (180°), secondary NE→NW (60°)
    paths: ['M 43.3,0 C 22,0 -22,0 -43.3,0', 'M 21.7,-37.5 C 10,-26 -10,-26 -21.7,-37.5'],
  },
  23: {
    // E–NE–NW–SW: primary NE→SW (180°), secondary E→NW (120°)
    paths: ['M 21.7,-37.5 C 11,-19 -11,19 -21.7,37.5', 'M 43.3,0 C 22,0 2,-20 -21.7,-37.5'],
  },
  27: {
    // E–NE–W–SW: two opposite pairs — X-crossing
    paths: ['M 43.3,0 C 22,0 -22,0 -43.3,0', 'M 21.7,-37.5 C 11,-19 -11,19 -21.7,37.5'],
  },
};

// ── Rivers ───────────────────────────────────────────────────────────────────
// Organic, meandering curves — rivers are natural, not engineered.
// Control points are intentionally asymmetric so paths feel hand-drawn.
export const RIVER_CANONICAL_PATHS: Record<number, SegmentPaths> = {
  // k=1 ── stub
  1: {
    paths: ['M 43.3,0 C 22,0 11,0 0,0'],
  },

  // k=2 ── two-connection chords
  3: {
    // E–NE (60°) — tight meander hugging the outer edge
    paths: ['M 43.3,0 C 32,-2 8,-26 21.7,-37.5'],
  },
  5: {
    // E–NW (120°) — gentle asymmetric sweep
    paths: ['M 43.3,0 C 30,8 2,-22 -21.7,-37.5'],
  },
  9: {
    // E–W (180°) — organic S-curve meander
    paths: ['M 43.3,0 C 22,-14 -18,10 -43.3,0'],
  },

  // k=3
  7: {
    // E–NE–NW: primary E→NW, stub NE→centre
    paths: ['M 43.3,0 C 30,-3 6,-22 -21.7,-37.5', 'M 21.7,-37.5 C 16,-28 8,-14 0,0'],
  },
  11: {
    // E–NE–W: primary E→W meander, stub NE→centre
    paths: ['M 43.3,0 C 22,-14 -18,10 -43.3,0', 'M 21.7,-37.5 C 16,-28 8,-14 0,0'],
  },
  21: {
    // E–NW–SW: hub-and-spoke to centre
    paths: [
      'M 43.3,0 C 22,0 11,0 0,0',
      'M -21.7,-37.5 C -11,-19 -5,-9 0,0',
      'M -21.7,37.5 C -11,19 -5,9 0,0',
    ],
  },

  // k=4
  15: {
    // E–NE–NW–W: primary E→W meander, secondary NE→NW
    paths: ['M 43.3,0 C 22,-14 -18,10 -43.3,0', 'M 21.7,-37.5 C 10,-26 -10,-26 -21.7,-37.5'],
  },
  23: {
    // E–NE–NW–SW: primary NE→SW, secondary E→NW
    paths: ['M 21.7,-37.5 C 11,-19 -11,19 -21.7,37.5', 'M 43.3,0 C 30,-3 6,-22 -21.7,-37.5'],
  },
  27: {
    // E–NE–W–SW: X-crossing meanders
    paths: ['M 43.3,0 C 22,-14 -18,10 -43.3,0', 'M 21.7,-37.5 C 11,-19 -11,19 -21.7,37.5'],
  },
};

// ── Combined road + river ─────────────────────────────────────────────────────
// Used when road and river interact on the same tile (bridge or parallel offset).
// Key: "<canonicalRoadBitmask>|<canonicalRiverBitmask>"
// Both bitmasks are in their jointly-normalised canonical orientation.
// bridge[] is non-empty only for crossing (bridge) cases.
// Empty for now — will be populated when bridge/offset paths are authored.
export const COMBINED_CANONICAL_PATHS: Record<
  string,
  { road: string[]; river: string[]; bridge: string[] }
> = {};

// ── Causeways ─────────────────────────────────────────────────────────────────
// Notch paths for road-through-deep-water (causeway) rendering.
// Keys are canonical road bitmask values. Each entry defines only the perpendicular
// channel notch lines — the embankment path comes from ROAD_CANONICAL_PATHS.
// Notch positions are derived from the midpoint(s) of each canonical road curve,
// perpendicular to the tangent direction at that point, half-length 6 units.
// Only k=1 and k=2 canonical shapes are defined; k=3/k=4 fall back to road paths
// without notches.
export const CAUSEWAY_CANONICAL_PATHS: Record<number, { notches: string[] }> = {
  // k=1 ── stub (E → centre): two notches evenly spaced along the path
  1: {
    notches: ['M 32,-6 L 32,6', 'M 16,-6 L 16,6'],
  },

  // k=2 ── E–NE (60°): one notch at path midpoint ≈ (30, −10)
  3: {
    notches: ['M 35,-13 L 25,-7'],
  },

  // k=2 ── E–NW (120°): two notches at t≈0.33 and t≈0.67
  5: {
    notches: ['M 25,-11 L 20,0', 'M 4,-25 L -3,-15'],
  },

  // k=2 ── E–W (180°): three evenly-spaced vertical notches
  9: {
    notches: ['M -22,-6 L -22,6', 'M 0,-6 L 0,6', 'M 22,-6 L 22,6'],
  },
};

// Axial hex coordinate utilities — supports pointy-top and flat-top orientations.

import type { CustomTerrainType, HexOrientation } from '../types/domain';

export const HEX_SIZE = 50; // radius in pixels (center to corner)

// Pre-computed constants to avoid repeated Math.sqrt calls
const SQRT3 = Math.sqrt(3);
const SQRT3_OVER_2 = SQRT3 / 2;

// Pre-computed unit corner cosines and sines
// Pointy-top: corners at -30°, 30°, 90°, 150°, 210°, 270°
const POINTY_CORNER_COS = Array.from({ length: 6 }, (_, i) => {
  return Math.cos((Math.PI / 180) * (60 * i - 30));
});
const POINTY_CORNER_SIN = Array.from({ length: 6 }, (_, i) => {
  return Math.sin((Math.PI / 180) * (60 * i - 30));
});
// Flat-top: corners at 0°, 60°, 120°, 180°, 240°, 300°
const FLAT_CORNER_COS = Array.from({ length: 6 }, (_, i) => {
  return Math.cos((Math.PI / 180) * (60 * i));
});
const FLAT_CORNER_SIN = Array.from({ length: 6 }, (_, i) => {
  return Math.sin((Math.PI / 180) * (60 * i));
});

// Module-level orientation. All geometry functions read this so call sites need
// no changes when the map's orientation is toggled. Set it via setHexOrientation
// whenever the Redux store's currentMap.orientation changes.
let _orientation: HexOrientation = 'pointy-top';

export const setHexOrientation = (o: HexOrientation): void => {
  _orientation = o;
};

export const getHexOrientation = (): HexOrientation => {
  return _orientation;
};

export interface HexCoord {
  q: number;
  r: number;
}

export interface PixelCoord {
  x: number;
  y: number;
}

// Encode/decode axial coords to/from a string key
export const toKey = (q: number, r: number): string => {
  return `${q},${r}`;
};
export const fromKey = (key: string): HexCoord => {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
};

// The 6 neighbour direction vectors for axial coordinates (pointy-top)
export const NEIGHBOR_DIRS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

// Maps NEIGHBOR_DIRS index → starting corner index of the shared edge.
// Exported so WaterOverlay can use the same mapping without duplicating it.
export const DIR_TO_EDGE_CORNER: number[] = [0, 5, 4, 3, 2, 1];

// Returns the 6 neighbour axial coords for a given tile
export const getNeighbors = (q: number, r: number): HexCoord[] => {
  return NEIGHBOR_DIRS.map((d) => {
    return { q: q + d.q, r: r + d.r };
  });
};

// Returns all hex tiles on the straight line between two axial coords (inclusive).
// Uses linear interpolation across cube coordinates, rounding each step.
export const hexLine = (q1: number, r1: number, q2: number, r2: number): HexCoord[] => {
  const s1 = -q1 - r1;
  const s2 = -q2 - r2;
  const N = Math.max(Math.abs(q2 - q1), Math.abs(r2 - r1), Math.abs(s2 - s1));
  if (N === 0) return [{ q: q1, r: r1 }];
  const results: HexCoord[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    results.push(hexRound(q1 + (q2 - q1) * t, r1 + (r2 - r1) * t));
  }
  return results;
};

// Axial → pixel, returns { x, y } for the hex center.
// Uses the module-level orientation set by setHexOrientation().
export const axialToPixel = (q: number, r: number, size = HEX_SIZE): PixelCoord => {
  if (_orientation === 'flat-top') {
    return {
      x: size * (3 / 2) * q,
      y: size * (SQRT3_OVER_2 * q + SQRT3 * r),
    };
  }
  return {
    x: size * (SQRT3 * q + SQRT3_OVER_2 * r),
    y: size * (3 / 2) * r,
  };
};

// Pixel → axial, returns { q, r } rounded to nearest hex.
// Uses the module-level orientation set by setHexOrientation().
export const pixelToAxial = (x: number, y: number, size = HEX_SIZE): HexCoord => {
  if (_orientation === 'flat-top') {
    const q = ((2 / 3) * x) / size;
    const r = ((-1 / 3) * x + (SQRT3 / 3) * y) / size;
    return hexRound(q, r);
  }
  const q = ((SQRT3 / 3) * x - (1 / 3) * y) / size;
  const r = ((2 / 3) * y) / size;
  return hexRound(q, r);
};

// Round fractional axial coords to nearest hex
export const hexRound = (q: number, r: number): HexCoord => {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);

  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;

  return { q: rq, r: rr };
};

// Returns the 6 corner pixel positions for a hex centered at (cx, cy).
// Uses the module-level orientation set by setHexOrientation().
export const hexCorners = (cx: number, cy: number, size = HEX_SIZE): PixelCoord[] => {
  const cosArr = _orientation === 'flat-top' ? FLAT_CORNER_COS : POINTY_CORNER_COS;
  const sinArr = _orientation === 'flat-top' ? FLAT_CORNER_SIN : POINTY_CORNER_SIN;
  return Array.from({ length: 6 }, (_, i) => {
    return {
      x: cx + size * cosArr[i],
      y: cy + size * sinArr[i],
    };
  });
};

// Returns a SVG points string for a hex centered at (cx, cy)
export const hexPointsString = (cx: number, cy: number, size = HEX_SIZE): string => {
  return hexCorners(cx, cy, size)
    .map(({ x, y }) => {
      return `${x},${y}`;
    })
    .join(' ');
};

// Returns the midpoint pixel of the edge between a tile and one of its neighbours
// dirIndex: 0–5 corresponding to NEIGHBOR_DIRS
export const edgeMidpoint = (
  cx: number,
  cy: number,
  dirIndex: number,
  size = HEX_SIZE
): PixelCoord => {
  const corners = hexCorners(cx, cy, size);
  const ci = DIR_TO_EDGE_CORNER[dirIndex];
  const a = corners[ci];
  const b = corners[(ci + 1) % 6];
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
};

// Terrain types that behave like deep water:
// - rivers/roads terminate at their edge
// - water fill covers them on top
// - shared edges with neighbours are merged (no border drawn)
// - ports appear on adjacent land tiles
export const DEEP_WATER = new Set(['lake', 'ocean']);

export const buildDeepWaterSet = (customTerrains: CustomTerrainType[]): Set<string> => {
  const base = new Set(DEEP_WATER);
  customTerrains.forEach((t) => {
    if (t.isDeepWater) base.add(t.id);
  });
  return base;
};

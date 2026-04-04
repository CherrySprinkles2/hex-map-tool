// Pointy-top axial hex coordinate utilities

export const HEX_SIZE = 50; // radius in pixels (center to corner)

// Pre-computed constants to avoid repeated Math.sqrt calls
const SQRT3 = Math.sqrt(3);
const SQRT3_OVER_2 = SQRT3 / 2;

// Pre-computed unit corner cosines and sines (pointy-top, angles 30°, 90°, 150°, 210°, 270°, 330°)
const UNIT_CORNER_COS = Array.from({ length: 6 }, (_, i) => {
  return Math.cos((Math.PI / 180) * (60 * i - 30));
});
const UNIT_CORNER_SIN = Array.from({ length: 6 }, (_, i) => {
  return Math.sin((Math.PI / 180) * (60 * i - 30));
});

// Encode/decode axial coords to/from a string key
export const toKey = (q, r) => {
  return `${q},${r}`;
};
export const fromKey = (key) => {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
};

// The 6 neighbour direction vectors for axial coordinates (pointy-top)
export const NEIGHBOR_DIRS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

// Maps NEIGHBOR_DIRS index → starting corner index of the shared edge.
// Exported so WaterOverlay can use the same mapping without duplicating it.
export const DIR_TO_EDGE_CORNER = [0, 5, 4, 3, 2, 1];

// Returns the 6 neighbour axial coords for a given tile
export const getNeighbors = (q, r) => {
  return NEIGHBOR_DIRS.map((d) => {
    return { q: q + d.q, r: r + d.r };
  });
};

// Axial → pixel (pointy-top), returns { x, y } for the hex center
export const axialToPixel = (q, r, size = HEX_SIZE) => {
  return {
    x: size * (SQRT3 * q + SQRT3_OVER_2 * r),
    y: size * (3 / 2) * r,
  };
};

// Pixel → axial (pointy-top), returns { q, r } (fractional)
export const pixelToAxial = (x, y, size = HEX_SIZE) => {
  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
  const r = ((2 / 3) * y) / size;
  return hexRound(q, r);
};

// Round fractional axial coords to nearest hex
export const hexRound = (q, r) => {
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

// Returns the 6 corner pixel positions for a pointy-top hex centered at (cx, cy)
export const hexCorners = (cx, cy, size = HEX_SIZE) => {
  return Array.from({ length: 6 }, (_, i) => {
    return {
      x: cx + size * UNIT_CORNER_COS[i],
      y: cy + size * UNIT_CORNER_SIN[i],
    };
  });
};

// Returns a SVG points string for a hex centered at (cx, cy)
export const hexPointsString = (cx, cy, size = HEX_SIZE) => {
  return hexCorners(cx, cy, size)
    .map(({ x, y }) => {
      return `${x},${y}`;
    })
    .join(' ');
};

// Returns the midpoint pixel of the edge between a tile and one of its neighbours
// dirIndex: 0–5 corresponding to NEIGHBOR_DIRS
export const edgeMidpoint = (cx, cy, dirIndex, size = HEX_SIZE) => {
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

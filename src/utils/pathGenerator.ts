// Programmatic bezier path generator for rivers and roads.
//
// Replaces the bitmask → fixed-path lookup in routeLookup.ts with geometry
// computed at render time. Both features use offset edge anchors so they never
// overlap even when sharing the same tile edges.
//
// Edge anchor offset convention:
//   river → offset toward corners[ci]         (first corner of the edge)
//   road  → offset toward corners[(ci+1)%6]   (second corner of the edge)
//
// Tunable constants (adjust to taste):
//   ANCHOR_OFFSET   — how far the anchor moves from the edge midpoint (0 = centre, 1 = corner)
//   CONTROL_TENSION — how strongly the bezier curves away from the edge (fraction of HEX_SIZE)

import {
  HEX_SIZE,
  hexCorners,
  edgeMidpoint,
  NEIGHBOR_DIRS,
  toKey,
  DIR_TO_EDGE_CORNER,
} from './hexUtils';
import type { PixelCoord } from './hexUtils';
import type { TilesState } from '../types/state';
import { intersectCubics, evalCubicTangent } from './bezierIntersect';

export const ANCHOR_OFFSET = 0.25;
export const CONTROL_TENSION = 0.4;

export type FeatureType = 'river' | 'road';

export interface CubicBezier {
  p0: PixelCoord;
  p1: PixelCoord;
  p2: PixelCoord;
  p3: PixelCoord;
}

export interface FeaturePath {
  svgPath: string;
  curve: CubicBezier | null; // null for stub-to-centre paths
}

// ── Bitmask helpers ───────────────────────────────────────────────────────────

type FlagKey = 'hasRiver' | 'hasRoad';
type BlockedKey = 'riverBlocked' | 'roadBlocked';

const FLAG_BLOCKED: Record<FlagKey, BlockedKey> = {
  hasRiver: 'riverBlocked',
  hasRoad: 'roadBlocked',
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

// Returns the raw connection bitmask for a feature flag on a tile.
// Exported for use by causeway rendering in overlayHelpers.tsx.
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

// Returns the connected neighbour direction indices (0–5) for a feature flag.
export const computeConnectedDirs = (
  tiles: TilesState,
  q: number,
  r: number,
  flag: FlagKey
): number[] => {
  const bitmask = computeBitmask(tiles, q, r, flag);
  const dirs: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (bitmask & (1 << i)) dirs.push(i);
  }
  return dirs;
};

// ── Geometry helpers ──────────────────────────────────────────────────────────

// Returns the offset anchor point on a tile edge for a given feature type.
// The anchor is shifted from the edge midpoint toward one of the edge's two
// corners, keeping river and road anchors on opposite sides of every edge.
//
// Corners are sorted by absolute position (y then x) so that both tiles sharing
// an edge pick the same physical corner for a given feature — without this,
// the local corner-index ordering reverses across the shared edge and the two
// tiles' anchors land on opposite ends of the edge, causing a visible gap.
export const getFeatureAnchor = (
  cx: number,
  cy: number,
  dirIndex: number,
  feature: FeatureType,
  size = HEX_SIZE
): PixelCoord => {
  const mid = edgeMidpoint(cx, cy, dirIndex, size);
  const corners = hexCorners(cx, cy, size);
  const ci = DIR_TO_EDGE_CORNER[dirIndex];
  const cA = corners[ci];
  const cB = corners[(ci + 1) % 6];

  // Canonical "first" corner: lower y (or lower x if y is equal).
  // This ordering is the same whether computed from tile A or tile B,
  // so both tiles agree on which physical point is the river/road anchor.
  const firstIsA = cA.y < cB.y || (cA.y === cB.y && cA.x < cB.x);
  const riverCorner = firstIsA ? cA : cB;
  const roadCorner = firstIsA ? cB : cA;
  const corner = feature === 'river' ? riverCorner : roadCorner;

  return {
    x: mid.x + ANCHOR_OFFSET * (corner.x - mid.x),
    y: mid.y + ANCHOR_OFFSET * (corner.y - mid.y),
  };
};

// Returns the inward unit normal for a tile edge (from midpoint toward tile centre).
// Used as the bezier control-point tangent direction at each edge anchor.
export const getInwardNormal = (
  cx: number,
  cy: number,
  dirIndex: number,
  size = HEX_SIZE
): PixelCoord => {
  const mid = edgeMidpoint(cx, cy, dirIndex, size);
  const dx = cx - mid.x;
  const dy = cy - mid.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
};

// ── Curve building ────────────────────────────────────────────────────────────

const fmt = (n: number): string => {
  return n.toFixed(2);
};

const cubicPathString = (
  p0: PixelCoord,
  p1: PixelCoord,
  p2: PixelCoord,
  p3: PixelCoord
): string => {
  return `M ${fmt(p0.x)},${fmt(p0.y)} C ${fmt(p1.x)},${fmt(p1.y)} ${fmt(p2.x)},${fmt(p2.y)} ${fmt(p3.x)},${fmt(p3.y)}`;
};

// Builds a smooth cubic bezier from anchorA to anchorB.
// Control points are placed along each edge's inward normal, producing a curve
// that enters and exits perpendicular to the tile edge — no tile-centre pass-through.
export const buildSimpleCurve = (
  anchorA: PixelCoord,
  normalA: PixelCoord,
  anchorB: PixelCoord,
  normalB: PixelCoord,
  size = HEX_SIZE
): { svgPath: string; curve: CubicBezier } => {
  const tension = CONTROL_TENSION * size;
  const p0 = anchorA;
  const p1 = { x: anchorA.x + normalA.x * tension, y: anchorA.y + normalA.y * tension };
  const p2 = { x: anchorB.x + normalB.x * tension, y: anchorB.y + normalB.y * tension };
  const p3 = anchorB;
  return {
    svgPath: cubicPathString(p0, p1, p2, p3),
    curve: { p0, p1, p2, p3 },
  };
};

// ── Direction pairing ─────────────────────────────────────────────────────────

// Pairs connected directions to minimise in-tile bezier crossings.
// At each step the pair with the largest angular separation (most "opposite") is
// chosen and connected with a chord bezier. Any odd leftover direction becomes a
// stub [dir, null] drawn from the edge anchor to the tile centre.
//
// Special case — exactly 3 connections: route all three as stubs to the tile
// centre instead of pairing two and stubbing one. Pairing produces a through-curve
// that doesn't meet the stub endpoint at the same point, causing messy crossings.
// Routing all three to the centre creates a natural Y/T junction.
const pairDirections = (dirs: number[]): Array<[number, number | null]> => {
  if (dirs.length === 3) {
    return dirs.map((d): [number, null] => {
      return [d, null];
    });
  }

  const pairs: Array<[number, number | null]> = [];
  const remaining = [...dirs];

  while (remaining.length >= 2) {
    let bestI = 0;
    let bestJ = 1;
    let bestDiff = -1;

    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        const raw = Math.abs(remaining[i] - remaining[j]);
        const diff = Math.min(raw, 6 - raw);
        if (diff > bestDiff) {
          bestDiff = diff;
          bestI = i;
          bestJ = j;
        }
      }
    }

    pairs.push([remaining[bestI], remaining[bestJ]]);
    // Remove in descending index order to keep indices stable
    remaining.splice(bestJ, 1);
    remaining.splice(bestI, 1);
  }

  if (remaining.length === 1) {
    pairs.push([remaining[0], null]);
  }

  return pairs;
};

// ── High-level path building ──────────────────────────────────────────────────

// Builds all SVG paths for a feature on a tile from its connected direction indices.
// Returns an empty array for isolated tiles — the caller is responsible for
// rendering a pool dot at the tile centre in that case.
export const buildFeaturePaths = (
  cx: number,
  cy: number,
  connectedDirs: number[],
  feature: FeatureType,
  size = HEX_SIZE
): FeaturePath[] => {
  if (connectedDirs.length === 0) return [];

  const pairs = pairDirections(connectedDirs);

  return pairs.map(([dirA, dirB]) => {
    const anchorA = getFeatureAnchor(cx, cy, dirA, feature, size);
    const normalA = getInwardNormal(cx, cy, dirA, size);

    if (dirB === null) {
      // Stub: draw from the edge anchor to the tile centre with a half-tension curve.
      const tension = CONTROL_TENSION * size * 0.5;
      const p0 = anchorA;
      const p1 = { x: anchorA.x + normalA.x * tension, y: anchorA.y + normalA.y * tension };
      const centre: PixelCoord = { x: cx, y: cy };
      return {
        svgPath: cubicPathString(p0, p1, centre, centre),
        curve: null,
      };
    }

    const anchorB = getFeatureAnchor(cx, cy, dirB, feature, size);
    const normalB = getInwardNormal(cx, cy, dirB, size);
    return buildSimpleCurve(anchorA, normalA, anchorB, normalB, size);
  });
};

// ── River-aware road routing ──────────────────────────────────────────────────

// Builds a single road bezier path from anchorA to anchorB, routed to minimise
// river crossings. When a crossing is unavoidable, the road is reconstructed
// using Hermite interpolation so it crosses the river at exactly 90°.
//
// If townCentre is provided, it is used as the endpoint instead of anchorB
// (normalB is ignored in that case). This handles roads that terminate at a
// town icon on the tile.
//
// riverCurves: CubicBezier descriptors for all river paths on this tile.
// Returns an SVG path string (may be a compound M…C…C… for crossing paths).
export const buildRoadCurve = (
  anchorA: PixelCoord,
  normalA: PixelCoord,
  anchorB: PixelCoord | null,
  normalB: PixelCoord | null,
  riverCurves: CubicBezier[],
  townCentre: PixelCoord | null = null,
  size = HEX_SIZE
): string => {
  const endPoint = townCentre ?? anchorB!;
  const tension = CONTROL_TENSION * size;

  // Control point at the destination end.
  // For town centre: arrive naturally with no outward push (degenerate CP).
  // For edge endpoint: use the inward normal (same as buildSimpleCurve).
  const cpEnd: PixelCoord =
    townCentre !== null || normalB === null
      ? endPoint
      : { x: endPoint.x + normalB.x * tension, y: endPoint.y + normalB.y * tension };

  // Naive curve control points
  const cpA: PixelCoord = {
    x: anchorA.x + normalA.x * tension,
    y: anchorA.y + normalA.y * tension,
  };
  const naiveCurve: CubicBezier = { p0: anchorA, p1: cpA, p2: cpEnd, p3: endPoint };

  if (riverCurves.length === 0) {
    return cubicPathString(naiveCurve.p0, naiveCurve.p1, naiveCurve.p2, naiveCurve.p3);
  }

  // Find all intersections with river curves and pick the best crossing candidate:
  // the one whose naive road tangent is closest to perpendicular with the river
  // (smallest |cos θ| ≡ smallest |dot product|).
  interface Candidate {
    t_road: number;
    point: PixelCoord;
    riverTangentUnit: PixelCoord;
    score: number; // |cos θ| — lower means more perpendicular
  }

  const candidates: Candidate[] = [];

  for (const river of riverCurves) {
    const intersections = intersectCubics(naiveCurve, river);
    for (const ix of intersections) {
      const roadTan = evalCubicTangent(naiveCurve, ix.t1);
      const riverTan = evalCubicTangent(river, ix.t2);

      const roadLen = Math.sqrt(roadTan.x * roadTan.x + roadTan.y * roadTan.y) || 1;
      const riverLen = Math.sqrt(riverTan.x * riverTan.x + riverTan.y * riverTan.y) || 1;
      const roadUnit: PixelCoord = { x: roadTan.x / roadLen, y: roadTan.y / roadLen };
      const riverUnit: PixelCoord = { x: riverTan.x / riverLen, y: riverTan.y / riverLen };

      const dot = Math.abs(roadUnit.x * riverUnit.x + roadUnit.y * riverUnit.y);
      candidates.push({ t_road: ix.t1, point: ix.point, riverTangentUnit: riverUnit, score: dot });
    }
  }

  if (candidates.length === 0) {
    return cubicPathString(naiveCurve.p0, naiveCurve.p1, naiveCurve.p2, naiveCurve.p3);
  }

  // Sort by score ascending (most perpendicular first), then by t_road for stability.
  candidates.sort((a, b) => {
    return a.score !== b.score ? a.score - b.score : a.t_road - b.t_road;
  });
  const best = candidates[0];
  const P = best.point;
  const riverTanUnit = best.riverTangentUnit;

  // Perpendicular to river tangent, oriented toward endPoint from anchorA.
  let T_road: PixelCoord = { x: -riverTanUnit.y, y: riverTanUnit.x };
  const ab: PixelCoord = { x: endPoint.x - anchorA.x, y: endPoint.y - anchorA.y };
  if (T_road.x * ab.x + T_road.y * ab.y < 0) {
    T_road = { x: -T_road.x, y: -T_road.y };
  }

  // Hermite segment 1: anchorA → P (arriving at P perpendicular to river)
  const s1p1: PixelCoord = cpA;
  const s1p2: PixelCoord = { x: P.x - T_road.x * tension, y: P.y - T_road.y * tension };

  // Hermite segment 2: P → endPoint (departing P perpendicular to river)
  const s2p1: PixelCoord = { x: P.x + T_road.x * tension, y: P.y + T_road.y * tension };
  const s2p2: PixelCoord = cpEnd;

  return (
    `M ${fmt(anchorA.x)},${fmt(anchorA.y)} ` +
    `C ${fmt(s1p1.x)},${fmt(s1p1.y)} ${fmt(s1p2.x)},${fmt(s1p2.y)} ${fmt(P.x)},${fmt(P.y)} ` +
    `C ${fmt(s2p1.x)},${fmt(s2p1.y)} ${fmt(s2p2.x)},${fmt(s2p2.y)} ${fmt(endPoint.x)},${fmt(endPoint.y)}`
  );
};

// Builds all river-aware road paths for a tile.
// Mirrors buildFeaturePaths but routes each segment through buildRoadCurve,
// passing the tile's pre-computed river curve descriptors.
export const buildRoadPaths = (
  cx: number,
  cy: number,
  connectedDirs: number[],
  riverCurves: CubicBezier[],
  hasTown: boolean,
  size = HEX_SIZE
): string[] => {
  if (connectedDirs.length === 0) return [];

  const pairs = pairDirections(connectedDirs);
  const centre: PixelCoord = { x: cx, y: cy };

  return pairs.map(([dirA, dirB]) => {
    const anchorA = getFeatureAnchor(cx, cy, dirA, 'road', size);
    const normalA = getInwardNormal(cx, cy, dirA, size);

    if (dirB === null) {
      // Stub: connect to tile centre; if there's a town, the centre IS the town endpoint.
      return buildRoadCurve(anchorA, normalA, null, null, riverCurves, centre, size);
    }

    const anchorB = getFeatureAnchor(cx, cy, dirB, 'road', size);
    const normalB = getInwardNormal(cx, cy, dirB, size);

    if (hasTown) {
      // When a town is present, route each road segment through the town centre
      // as an intermediate point. Draw two sub-segments: edge→centre and centre→edge.
      // This ensures roads in town tiles always meet at the centre icon.
      const seg1 = buildRoadCurve(anchorA, normalA, null, null, riverCurves, centre, size);
      const seg2 = buildRoadCurve(anchorB, normalB, null, null, riverCurves, centre, size);
      return `${seg1} ${seg2}`;
    }

    return buildRoadCurve(anchorA, normalA, anchorB, normalB, riverCurves, null, size);
  });
};

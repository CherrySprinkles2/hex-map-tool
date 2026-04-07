// Cubic bezier intersection detection using iterative de Casteljau subdivision.
//
// Algorithm:
//   1. Compute bounding boxes for both curves.
//   2. If bounding boxes don't overlap, there is no intersection — prune.
//   3. If both bounding boxes are smaller than TOLERANCE, record the result.
//   4. Otherwise, subdivide both curves at t = 0.5 and recurse on all four pairs.
//
// This is a pure geometry module with no React or Redux dependencies.

import type { PixelCoord } from './hexUtils';
import type { CubicBezier } from './pathGenerator';

export const INTERSECT_TOLERANCE = 1.0; // pixels — subdivision stops below this size

export interface Intersection {
  t1: number; // parameter on curve 1 (0–1)
  t2: number; // parameter on curve 2 (0–1)
  point: PixelCoord; // approximate world-space intersection point
}

// ── Bezier evaluation ─────────────────────────────────────────────────────────

// Evaluate a cubic bezier at parameter t.
export const evalCubic = (b: CubicBezier, t: number): PixelCoord => {
  const mt = 1 - t;
  return {
    x:
      mt * mt * mt * b.p0.x +
      3 * mt * mt * t * b.p1.x +
      3 * mt * t * t * b.p2.x +
      t * t * t * b.p3.x,
    y:
      mt * mt * mt * b.p0.y +
      3 * mt * mt * t * b.p1.y +
      3 * mt * t * t * b.p2.y +
      t * t * t * b.p3.y,
  };
};

// Evaluate the tangent (first derivative, unnormalised) of a cubic bezier at t.
export const evalCubicTangent = (b: CubicBezier, t: number): PixelCoord => {
  const mt = 1 - t;
  return {
    x:
      3 * mt * mt * (b.p1.x - b.p0.x) +
      6 * mt * t * (b.p2.x - b.p1.x) +
      3 * t * t * (b.p3.x - b.p2.x),
    y:
      3 * mt * mt * (b.p1.y - b.p0.y) +
      6 * mt * t * (b.p2.y - b.p1.y) +
      3 * t * t * (b.p3.y - b.p2.y),
  };
};

// ── de Casteljau subdivision ──────────────────────────────────────────────────

interface SubCurve {
  curve: CubicBezier;
  t0: number; // start parameter in the original curve's domain
  t1: number; // end parameter in the original curve's domain
}

// Split a cubic bezier at t = 0.5 using de Casteljau's algorithm.
const splitAt05 = (b: CubicBezier): [CubicBezier, CubicBezier] => {
  const m01x = (b.p0.x + b.p1.x) / 2;
  const m01y = (b.p0.y + b.p1.y) / 2;
  const m12x = (b.p1.x + b.p2.x) / 2;
  const m12y = (b.p1.y + b.p2.y) / 2;
  const m23x = (b.p2.x + b.p3.x) / 2;
  const m23y = (b.p2.y + b.p3.y) / 2;

  const m012x = (m01x + m12x) / 2;
  const m012y = (m01y + m12y) / 2;
  const m123x = (m12x + m23x) / 2;
  const m123y = (m12y + m23y) / 2;

  const midx = (m012x + m123x) / 2;
  const midy = (m012y + m123y) / 2;

  const left: CubicBezier = {
    p0: b.p0,
    p1: { x: m01x, y: m01y },
    p2: { x: m012x, y: m012y },
    p3: { x: midx, y: midy },
  };
  const right: CubicBezier = {
    p0: { x: midx, y: midy },
    p1: { x: m123x, y: m123y },
    p2: { x: m23x, y: m23y },
    p3: b.p3,
  };
  return [left, right];
};

// ── Bounding box ──────────────────────────────────────────────────────────────

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const curveBBox = (b: CubicBezier): BBox => {
  const xs = [b.p0.x, b.p1.x, b.p2.x, b.p3.x];
  const ys = [b.p0.y, b.p1.y, b.p2.y, b.p3.y];
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};

const bboxSize = (bb: BBox): number => {
  return Math.max(bb.maxX - bb.minX, bb.maxY - bb.minY);
};

const bboxOverlap = (a: BBox, b: BBox): boolean => {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
};

// ── Core intersection detection ───────────────────────────────────────────────

const MAX_DEPTH = 50; // guard against infinite recursion on degenerate curves

const subdivideAndIntersect = (
  s1: SubCurve,
  s2: SubCurve,
  results: Intersection[],
  depth: number,
  tolerance: number
): void => {
  if (depth > MAX_DEPTH) return;

  const bb1 = curveBBox(s1.curve);
  const bb2 = curveBBox(s2.curve);

  if (!bboxOverlap(bb1, bb2)) return;

  const small1 = bboxSize(bb1) < tolerance;
  const small2 = bboxSize(bb2) < tolerance;

  if (small1 && small2) {
    // Both sub-curves are below tolerance — record the midpoint as an intersection.
    const tMid1 = (s1.t0 + s1.t1) / 2;
    const tMid2 = (s2.t0 + s2.t1) / 2;

    // Deduplicate: skip if a very similar t1/t2 was already recorded.
    for (const existing of results) {
      if (Math.abs(existing.t1 - tMid1) < 0.01 && Math.abs(existing.t2 - tMid2) < 0.01) return;
    }

    const point = evalCubic(s1.curve, 0.5);
    results.push({ t1: tMid1, t2: tMid2, point });
    return;
  }

  // Subdivide the larger curve (or both if similar size) and recurse.
  if (!small1 && (small2 || bboxSize(bb1) >= bboxSize(bb2))) {
    const [left1, right1] = splitAt05(s1.curve);
    const tMid1 = (s1.t0 + s1.t1) / 2;
    subdivideAndIntersect(
      { curve: left1, t0: s1.t0, t1: tMid1 },
      s2,
      results,
      depth + 1,
      tolerance
    );
    subdivideAndIntersect(
      { curve: right1, t0: tMid1, t1: s1.t1 },
      s2,
      results,
      depth + 1,
      tolerance
    );
  } else {
    const [left2, right2] = splitAt05(s2.curve);
    const tMid2 = (s2.t0 + s2.t1) / 2;
    subdivideAndIntersect(
      s1,
      { curve: left2, t0: s2.t0, t1: tMid2 },
      results,
      depth + 1,
      tolerance
    );
    subdivideAndIntersect(
      s1,
      { curve: right2, t0: tMid2, t1: s2.t1 },
      results,
      depth + 1,
      tolerance
    );
  }
};

// Find all intersections between two cubic bezier curves.
// Returns an array of Intersection objects sorted by t1 (parameter on curve1).
export const intersectCubics = (
  curve1: CubicBezier,
  curve2: CubicBezier,
  tolerance = INTERSECT_TOLERANCE
): Intersection[] => {
  const results: Intersection[] = [];
  subdivideAndIntersect(
    { curve: curve1, t0: 0, t1: 1 },
    { curve: curve2, t0: 0, t1: 1 },
    results,
    0,
    tolerance
  );
  results.sort((a, b) => {
    return a.t1 - b.t1;
  });
  return results;
};

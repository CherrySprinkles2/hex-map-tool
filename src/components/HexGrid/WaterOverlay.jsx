import React from 'react';
import { useSelector } from 'react-redux';
import { axialToPixel, edgeMidpoint, hexCorners, hexPointsString, HEX_SIZE, NEIGHBOR_DIRS, toKey } from './HexUtils';
import { theme } from '../../styles/theme';

// Terrain types that behave like deep water: rivers terminate at their edge,
// their fill renders on top of river/road paths, and shared edges are suppressed.
const DEEP_WATER = new Set(['lake', 'ocean']);

// How far toward center to draw stubs on deep-water tiles (so fill "covers" the interior)
const WATER_STUB_RATIO = 0.38;

// Smooth cubic bezier from A through center to B.
// Control points are pulled from each endpoint toward the center by `tension` (0=straight, 1=all the way to center).
const smoothPath = (ax, ay, bx, by, cx, cy, tension) => {
  const cp1x = ax + (cx - ax) * tension;
  const cp1y = ay + (cy - ay) * tension;
  const cp2x = bx + (cx - bx) * tension;
  const cp2y = by + (cy - by) * tension;
  return `M ${ax},${ay} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${bx},${by}`;
};

// Gently curved quadratic from A toward target (center or stub end).
// Adds a small perpendicular bend for a natural feel.
const curvedStub = (ax, ay, tx, ty, tension) => {
  const dx = tx - ax;
  const dy = ty - ay;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector
  const px = -dy / len;
  const py = dx / len;
  const bend = len * 0.18 * (1 - tension); // reduce bend for straighter (road) tension
  const cpx = (ax + tx) / 2 + px * bend;
  const cpy = (ay + ty) / 2 + py * bend;
  return `M ${ax},${ay} Q ${cpx},${cpy} ${tx},${ty}`;
};

// Renders all paths for a single flag (hasRiver or hasRoad) across all tiles
const renderFlagPaths = (tiles, flag, style) =>
  Object.values(tiles).flatMap((tile) => {
    if (!tile[flag]) return [];

    const { q, r, terrain } = tile;
    const isDeepWater = DEEP_WATER.has(terrain);
    const { x: cx, y: cy } = axialToPixel(q, r);

    // Connected edge indices: neighbours that share the same flag
    const connectedEdges = NEIGHBOR_DIRS
      .map((dir, i) => {
        const neighbor = tiles[toKey(q + dir.q, r + dir.r)];
        return neighbor?.[flag] ? i : null;
      })
      .filter((i) => i !== null);

    const midpoints = connectedEdges.map((i) => edgeMidpoint(cx, cy, i));

    // Isolated tile: show pool dot (suppressed on deep water tiles)
    if (connectedEdges.length === 0) {
      if (isDeepWater) return [];
      return [
        <circle
          key={`${flag}-pool-${toKey(q, r)}`}
          cx={cx} cy={cy}
          r={style.poolRadius}
          fill={style.color}
          opacity={0.85}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    }

    const paths = [];

    if (connectedEdges.length === 2 && !isDeepWater) {
      // Ideal case: one smooth curve from edge A to edge B through center
      const [a, b] = midpoints;
      paths.push(smoothPath(a.x, a.y, b.x, b.y, cx, cy, style.tension));
    } else {
      // 1 connection, 3+ connections, or deep water tile: draw individual stubs
      midpoints.forEach((em) => {
        const targetX = isDeepWater ? em.x + (cx - em.x) * WATER_STUB_RATIO : cx;
        const targetY = isDeepWater ? em.y + (cy - em.y) * WATER_STUB_RATIO : cy;
        paths.push(curvedStub(em.x, em.y, targetX, targetY, style.tension));
      });
    }

    return paths.map((d, i) => (
      <path
        key={`${flag}-${toKey(q, r)}-${i}`}
        d={d}
        fill="none"
        stroke={style.color}
        strokeWidth={style.width}
        strokeLinecap={style.linecap}
        opacity={0.9}
        style={{ pointerEvents: 'none' }}
      />
    ));
  });

// Maps NEIGHBOR_DIRS index → starting corner of the shared edge (same logic as HexUtils DIR_TO_EDGE_CORNER)
const DIR_TO_EDGE_CORNER = [0, 5, 4, 3, 2, 1];

// Renders merged edge outlines for a given terrain type.
// Draws a border on each edge where the neighbour is NOT the same terrain type.
const renderWaterEdges = (tiles, terrainType) =>
  Object.values(tiles).flatMap(({ q, r, terrain }) => {
    if (terrain !== terrainType) return [];
    const { x: cx, y: cy } = axialToPixel(q, r);
    const corners = hexCorners(cx, cy);
    return NEIGHBOR_DIRS.flatMap((dir, i) => {
      const neighbor = tiles[toKey(q + dir.q, r + dir.r)];
      if (neighbor?.terrain === terrainType) return [];
      const ci = DIR_TO_EDGE_CORNER[i];
      const a = corners[ci];
      const b = corners[(ci + 1) % 6];
      return [
        <line
          key={`${terrainType}-edge-${toKey(q, r)}-${i}`}
          x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={theme.terrain[terrainType].color}
          strokeWidth={terrainType === 'ocean' ? 4 : 3}
          strokeLinecap="round"
          opacity={0.9}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    });
  });

const WaterOverlay = ({ tiles }) => {
  const selectedTile = useSelector((state) => state.ui.selectedTile);
  const [hoveredTile, setHoveredTile] = React.useState(null);
  return (
  <g>
    {renderWaterEdges(tiles, 'lake')}
    {renderWaterEdges(tiles, 'ocean')}
    {renderFlagPaths(tiles, 'hasRiver', theme.river)}
    {renderFlagPaths(tiles, 'hasRoad', theme.road)}
    {/* Water caps: re-draw lake/ocean fill on top of rivers/roads so water texture covers them */}
    {Object.values(tiles).map(({ q, r, terrain }) => {
      if (!DEEP_WATER.has(terrain)) return null;
      const { x, y } = axialToPixel(q, r);
      const pts = hexPointsString(x, y);
      const key = toKey(q, r);
      const isSelected = selectedTile === key;
      const isHovered = hoveredTile === key;
      return (
        <g
          key={`water-cap-${key}`}
          onMouseEnter={() => setHoveredTile(key)}
          onMouseLeave={() => setHoveredTile(null)}
          style={{ cursor: 'pointer' }}
        >
          <polygon points={pts} fill={theme.terrain[terrain].color} stroke="none" />
          <polygon points={pts} fill={`url(#pattern-${terrain})`} stroke="none" style={{ pointerEvents: 'none' }} />
          {isHovered && (
            <polygon points={pts} fill="white" opacity={0.12} stroke="none" style={{ pointerEvents: 'none' }} />
          )}
          {isSelected && (
            <polygon
              points={hexPointsString(x, y, HEX_SIZE - 5)}
              fill="none"
              stroke={theme.selectedStroke}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              strokeLinecap="round"
              style={{ animation: 'marchingAnts 1s linear infinite', pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    })}
  </g>
  );
};

export default WaterOverlay;
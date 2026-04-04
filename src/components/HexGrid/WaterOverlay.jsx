import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { axialToPixel, hexCorners, hexPointsString, HEX_SIZE, NEIGHBOR_DIRS, toKey, DIR_TO_EDGE_CORNER } from './HexUtils';
import { theme } from '../../styles/theme';
import { selectTile, deselectTile } from '../../features/ui/uiSlice';
import { deleteTile } from '../../features/tiles/tilesSlice';

// Terrain types that behave like deep water: rivers terminate at their edge,
// their fill renders on top of river/road paths, and shared edges are suppressed.
export const DEEP_WATER = new Set(['lake', 'ocean']);

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

// Maps feature flag → the tile property storing manually blocked neighbor keys
const FLAG_BLOCKED_KEY = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked' };

// Renders all paths for a single flag (hasRiver or hasRoad) across all tiles
const renderFlagPaths = (tiles, flag, style) =>
  Object.values(tiles).flatMap((tile) => {
    if (!tile[flag]) return [];

    const { q, r, terrain } = tile;
    const myKey = toKey(q, r);
    const isDeepWater = DEEP_WATER.has(terrain);
    const { x: cx, y: cy } = axialToPixel(q, r);
    const blockedKey = FLAG_BLOCKED_KEY[flag];
    const blocked = tile[blockedKey] || [];

    // Connected edge indices: neighbours that share the same flag and aren't blocked
    const connectedEdges = NEIGHBOR_DIRS
      .map((dir, i) => {
        const nk = toKey(q + dir.q, r + dir.r);
        const neighbor = tiles[nk];
        if (!neighbor?.[flag]) return null;
        if (blocked.includes(nk)) return null;
        if ((neighbor[blockedKey] || []).includes(myKey)) return null;
        return i;
      })
      .filter((i) => i !== null);

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

    // Compute corners once for this tile, then derive all needed edge midpoints
    const corners = hexCorners(cx, cy);
    const midpoints = connectedEdges.map((i) => {
      const ci = DIR_TO_EDGE_CORNER[i];
      const a = corners[ci];
      const b = corners[(ci + 1) % 6];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    });

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
          strokeWidth={terrainType === 'ocean' ? theme.waterEdge.oceanWidth : theme.waterEdge.lakeWidth}
          strokeLinecap="round"
          opacity={theme.waterEdge.opacity}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    });
  });

// Renders a town icon. When garrisoned (armies present), shows castle battlements +
// a gold garrison ring. Single army: shows army name above. Multiple armies: ring only.
const renderTowns = (tiles, armiesByTile = {}) =>
  Object.values(tiles).flatMap((tile) => {
    if (!tile.hasTown) return [];
    const { q, r, terrain, townName } = tile;
    if (DEEP_WATER.has(terrain)) return [];
    const { x: cx, y: cy } = axialToPixel(q, r);
    const key = toKey(q, r);
    const armies = armiesByTile[key] ?? [];
    const garrisoned = armies.length > 0;

    const bx = cx - 9, by = cy - 3;
    const bw = 18,      bh = 13;

    return [
      <g key={`town-${key}`} style={{ pointerEvents: 'none' }}>
        {garrisoned ? (
          <>
            {/* Garrison ring */}
            <circle
              cx={cx} cy={cy - 3} r={21}
              fill="none"
              stroke={theme.garrison.ringColor}
              strokeWidth={theme.garrison.ringWidth}
              strokeDasharray={theme.garrison.ringDash}
              opacity={0.85}
            />
            {/* Castle body */}
            <rect x={bx} y={by} width={bw} height={bh} fill={theme.town.color} opacity={0.92} />
            {/* Battlement wall */}
            <rect x={cx - 11} y={cy - 8} width={22} height={5} fill={theme.town.color} opacity={0.92} />
            {/* Merlons (crenellations) */}
            <rect x={cx - 10} y={cy - 14} width={5} height={6} fill={theme.town.color} opacity={0.92} />
            <rect x={cx - 3}  y={cy - 14} width={5} height={6} fill={theme.town.color} opacity={0.92} />
            <rect x={cx + 4}  y={cy - 14} width={5} height={6} fill={theme.town.color} opacity={0.92} />
            {/* Door */}
            <rect x={cx - 3} y={by + bh - 7} width={6} height={7} fill={theme.town.door} />
            {/* Windows */}
            <rect x={cx + 3} y={by + 2} width={4} height={4} fill={theme.town.window} />
            <rect x={cx - 7} y={by + 2} width={4} height={4} fill={theme.town.window} />
            {/* Army name above — only when exactly 1 army */}
            {armies.length === 1 && armies[0].name && (
              <text
                x={cx} y={cy - 24}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
                stroke={theme.garrison.nameShadow}
                strokeWidth={3}
                strokeLinejoin="round"
                paintOrder="stroke"
                fill={theme.garrison.nameColor}
              >
                {armies[0].name}
              </text>
            )}
          </>
        ) : (
          <>
            {/* Standard house — roof */}
            <polygon
              points={`${cx},${cy - 16} ${cx - 12},${cy - 3} ${cx + 12},${cy - 3}`}
              fill={theme.town.color}
              opacity={0.92}
            />
            {/* Body */}
            <rect x={bx} y={by} width={bw} height={bh} fill={theme.town.color} opacity={0.92} />
            {/* Door */}
            <rect x={cx - 3} y={by + bh - 7} width={6} height={7} fill={theme.town.door} />
            {/* Windows */}
            <rect x={cx + 3} y={by + 2} width={4} height={4} fill={theme.town.window} />
            <rect x={cx - 7} y={by + 2} width={4} height={4} fill={theme.town.window} />
          </>
        )}
        {/* Town name below */}
        {townName && (
          <text
            x={cx} y={cy + 16}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
            stroke={theme.town.labelShadow}
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            fill={theme.town.labelColor}
          >
            {townName}
          </text>
        )}
      </g>,
    ];
  });


// Renders a dock symbol on each water tile edge that faces an adjacent town tile.
// The dock: a plank along the edge + 3 pilings extending inward toward the tile center.
const renderPorts = (tiles) =>
  Object.values(tiles).flatMap((tile) => {
    if (!DEEP_WATER.has(tile.terrain)) return [];
    const { q, r } = tile;
    const myKey = toKey(q, r);
    const { x: cx, y: cy } = axialToPixel(q, r);
    // Compute corners once so each edgeMidpoint below reuses them
    const corners = hexCorners(cx, cy);

    return NEIGHBOR_DIRS.flatMap((dir, i) => {
      const neighbor = tiles[toKey(q + dir.q, r + dir.r)];
      if (!neighbor?.hasTown) return [];
      // Skip if the town tile has blocked the port on this water tile
      if ((neighbor.portBlocked || []).includes(myKey)) return [];

      const ci = DIR_TO_EDGE_CORNER[i];
      const a = corners[ci];
      const b = corners[(ci + 1) % 6];
      const em = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

      // Unit vector pointing inward (edge → tile center)
      const dx = cx - em.x, dy = cy - em.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / len, ny = dy / len;
      // Perpendicular unit vector (along the plank)
      const px = -ny, py = nx;

      const plankHalf = theme.port.plankHalf;
      const pilingLen = theme.port.pilingLen;
      const color = theme.port.color;

      const pilingOffsets = [-plankHalf * 0.65, 0, plankHalf * 0.65];

      return [
        <g key={`port-${toKey(q, r)}-${i}`} style={{ pointerEvents: 'none' }}>
          {pilingOffsets.map((offset, j) => (
            <line
              key={j}
              x1={em.x + px * offset}
              y1={em.y + py * offset}
              x2={em.x + px * offset + nx * pilingLen}
              y2={em.y + py * offset + ny * pilingLen}
              stroke={color}
              strokeWidth={theme.port.pilingWidth}
              strokeLinecap="round"
            />
          ))}
          {/* Plank on top of pilings */}
          <line
            x1={em.x + px * plankHalf}
            y1={em.y + py * plankHalf}
            x2={em.x - px * plankHalf}
            y2={em.y - py * plankHalf}
            stroke={color}
            strokeWidth={theme.port.plankWidth}
            strokeLinecap="round"
          />
        </g>,
      ];
    });
  });


// WaterCap: renders the fill for a single water tile on top of river/road paths.
// Extracted as its own component so selection and hover state are local — only this
// tile re-renders on selection change rather than the entire WaterOverlay.
const WaterCap = React.memo(({ q, r, terrain }) => {
  const dispatch = useDispatch();
  const key = useMemo(() => toKey(q, r), [q, r]);
  const isSelected = useSelector((state) => state.ui.selectedTile === key);
  const [hovered, setHovered] = useState(false);

  const { x, y } = useMemo(() => axialToPixel(q, r), [q, r]);
  const pts = useMemo(() => hexPointsString(x, y), [x, y]);
  const selectionPts = useMemo(() => hexPointsString(x, y, HEX_SIZE - 5), [x, y]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (isSelected) dispatch(deselectTile());
    else dispatch(selectTile(key));
  }, [isSelected, dispatch, key]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) dispatch(deselectTile());
    dispatch(deleteTile({ q, r }));
  }, [isSelected, dispatch, q, r]);

  return (
    <g
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <polygon points={pts} fill={theme.terrain[terrain].color} stroke="none" />
      <polygon points={pts} fill={`url(#pattern-${terrain})`} stroke="none" style={{ pointerEvents: 'none' }} />
      {hovered && (
        <polygon points={pts} fill="white" opacity={0.12} stroke="none" style={{ pointerEvents: 'none' }} />
      )}
      {isSelected && (
        <polygon
          points={selectionPts}
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
});


const WaterOverlay = React.memo(({ tiles, armiesByTile }) => {
  const waterEdgesLake  = useMemo(() => renderWaterEdges(tiles, 'lake'),                 [tiles]);
  const waterEdgesOcean = useMemo(() => renderWaterEdges(tiles, 'ocean'),                [tiles]);
  const riverPaths      = useMemo(() => renderFlagPaths(tiles, 'hasRiver', theme.river), [tiles]);
  const roadPaths       = useMemo(() => renderFlagPaths(tiles, 'hasRoad',  theme.road),  [tiles]);
  const towns           = useMemo(() => renderTowns(tiles, armiesByTile ?? {}),          [tiles, armiesByTile]);
  const ports           = useMemo(() => renderPorts(tiles),                              [tiles]);
  const waterTiles      = useMemo(
    () => Object.values(tiles).filter(({ terrain }) => DEEP_WATER.has(terrain)),
    [tiles],
  );

  return (
    <g>
      {waterEdgesLake}
      {waterEdgesOcean}
      {riverPaths}
      {roadPaths}
      {towns}
      {/* Water caps: re-draw lake/ocean fill on top of rivers/roads so water texture covers them */}
      {waterTiles.map(({ q, r, terrain }) => (
        <WaterCap key={`water-cap-${toKey(q, r)}`} q={q} r={r} terrain={terrain} />
      ))}
      {ports}
    </g>
  );
});

export default WaterOverlay;
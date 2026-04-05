import React from 'react';
import { axialToPixel, hexCorners, NEIGHBOR_DIRS, toKey, DIR_TO_EDGE_CORNER } from './hexUtils';
import {
  computeBitmask,
  resolveSinglePaths,
  resolveRoadRiverPaths,
  resolveCausewayPaths,
  DEEP_WATER,
} from './routeLookup';
import { theme } from '../styles/theme';
import type { TilesState } from '../types/state';
import type { Army } from '../types/domain';

interface PathStyle {
  color: string;
  width: number;
  linecap: string;
  poolRadius: number;
}

type FlagKey = 'hasRiver' | 'hasRoad';

// Renders road and river paths for all tiles.
// For tiles that have both features the combined lookup table is checked first
// (enabling bridge and parallel-offset visuals); otherwise each feature is
// resolved independently via the canonical path tables.
export const renderFlagPaths = (
  tiles: TilesState,
  flag: FlagKey,
  style: PathStyle
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile[flag]) return [];

    const { q, r, terrain } = tile;
    const key = toKey(q, r);

    if (DEEP_WATER.has(terrain)) return [];

    const { x: cx, y: cy } = axialToPixel(q, r);
    const bitmask = computeBitmask(tiles, q, r, flag);

    // Isolated tile — render a pool dot
    if (bitmask === 0) {
      return [
        <circle
          key={`${flag}-pool-${key}`}
          cx={cx}
          cy={cy}
          r={style.poolRadius}
          fill={style.color}
          opacity={0.85}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    }

    const otherFlag: FlagKey = flag === 'hasRiver' ? 'hasRoad' : 'hasRiver';
    const hasOther = !!tile[otherFlag];

    let segments: Array<{ d: string; transform: string }>;

    if (hasOther) {
      // Both road and river present — use combined lookup
      const roadBitmask = computeBitmask(tiles, q, r, 'hasRoad');
      const riverBitmask = computeBitmask(tiles, q, r, 'hasRiver');
      const resolved = resolveRoadRiverPaths(roadBitmask, riverBitmask);
      segments = flag === 'hasRoad' ? resolved.road : resolved.river;
    } else {
      segments = resolveSinglePaths(bitmask, flag);
    }

    return segments.map(({ d, transform }, i) => {
      return (
        <g
          key={`${flag}-${key}-${i}`}
          transform={`translate(${cx},${cy})`}
          style={{ pointerEvents: 'none' }}
        >
          <path
            d={d}
            transform={transform || undefined}
            fill="none"
            stroke={style.color}
            strokeWidth={style.width}
            strokeLinecap={style.linecap as React.SVGAttributes<SVGPathElement>['strokeLinecap']}
            opacity={0.9}
          />
        </g>
      );
    });
  });
};

interface CausewayStyle {
  color: string;
  width: number;
  linecap: string;
  notchColor: string;
  notchWidth: number;
}

// Renders causeways: roads passing through deep-water tiles.
// Draws the road embankment (same path as road) plus short perpendicular notch
// lines to suggest water channels flowing beneath the raised structure.
export const renderCausewayPaths = (
  tiles: TilesState,
  style: CausewayStyle
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile.hasRoad) return [];
    if (!DEEP_WATER.has(tile.terrain)) return [];

    const { q, r } = tile;
    const key = toKey(q, r);
    const { x: cx, y: cy } = axialToPixel(q, r);
    const bitmask = computeBitmask(tiles, q, r, 'hasRoad');

    if (bitmask === 0) {
      return [
        <circle
          key={`causeway-pool-${key}`}
          cx={cx}
          cy={cy}
          r={theme.road.poolRadius}
          fill={style.color}
          opacity={0.85}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    }

    const { paths, notches } = resolveCausewayPaths(bitmask);

    const embankment = paths.map(({ d, transform }, i) => {
      return (
        <g
          key={`causeway-emb-${key}-${i}`}
          transform={`translate(${cx},${cy})`}
          style={{ pointerEvents: 'none' }}
        >
          <path
            d={d}
            transform={transform || undefined}
            fill="none"
            stroke={style.color}
            strokeWidth={style.width}
            strokeLinecap={style.linecap as React.SVGAttributes<SVGPathElement>['strokeLinecap']}
            opacity={0.9}
          />
        </g>
      );
    });

    const channels = notches.map(({ d, transform }, i) => {
      return (
        <g
          key={`causeway-notch-${key}-${i}`}
          transform={`translate(${cx},${cy})`}
          style={{ pointerEvents: 'none' }}
        >
          <path
            d={d}
            transform={transform || undefined}
            fill="none"
            stroke={style.notchColor}
            strokeWidth={style.notchWidth}
            strokeLinecap="round"
            opacity={0.8}
          />
        </g>
      );
    });

    return [...embankment, ...channels];
  });
};

export const renderWaterEdges = (tiles: TilesState, terrainType: string): React.ReactElement[] => {
  return Object.values(tiles).flatMap(({ q, r, terrain }) => {
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
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={theme.terrain[terrainType].color}
          strokeWidth={
            terrainType === 'ocean' ? theme.waterEdge.oceanWidth : theme.waterEdge.lakeWidth
          }
          strokeLinecap="round"
          opacity={theme.waterEdge.opacity}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    });
  });
};

export const renderTowns = (
  tiles: TilesState,
  armiesByTile: Record<string, Army[]> = {}
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile.hasTown) return [];
    const { q, r, terrain, townName } = tile;
    if (DEEP_WATER.has(terrain)) return [];
    const { x: cx, y: cy } = axialToPixel(q, r);
    const key = toKey(q, r);
    const armies = armiesByTile[key] ?? [];
    const garrisoned = armies.length > 0;

    const bx = cx - 9,
      by = cy - 3;
    const bw = 18,
      bh = 13;

    return [
      <g key={`town-${key}`} style={{ pointerEvents: 'none' }}>
        {garrisoned ? (
          <>
            <circle
              cx={cx}
              cy={cy - 3}
              r={21}
              fill="none"
              stroke={theme.garrison.ringColor}
              strokeWidth={theme.garrison.ringWidth}
              strokeDasharray={theme.garrison.ringDash}
              opacity={0.85}
            />
            <rect x={bx} y={by} width={bw} height={bh} fill={theme.town.color} opacity={0.92} />
            <rect
              x={cx - 11}
              y={cy - 8}
              width={22}
              height={5}
              fill={theme.town.color}
              opacity={0.92}
            />
            <rect
              x={cx - 10}
              y={cy - 14}
              width={5}
              height={6}
              fill={theme.town.color}
              opacity={0.92}
            />
            <rect
              x={cx - 3}
              y={cy - 14}
              width={5}
              height={6}
              fill={theme.town.color}
              opacity={0.92}
            />
            <rect
              x={cx + 4}
              y={cy - 14}
              width={5}
              height={6}
              fill={theme.town.color}
              opacity={0.92}
            />
            <rect x={cx - 3} y={by + bh - 7} width={6} height={7} fill={theme.town.door} />
            <rect x={cx + 3} y={by + 2} width={4} height={4} fill={theme.town.window} />
            <rect x={cx - 7} y={by + 2} width={4} height={4} fill={theme.town.window} />
            {armies.length === 1 && armies[0].name && (
              <text
                x={cx}
                y={cy - 24}
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
            <polygon
              points={`${cx},${cy - 16} ${cx - 12},${cy - 3} ${cx + 12},${cy - 3}`}
              fill={theme.town.color}
              opacity={0.92}
            />
            <rect x={bx} y={by} width={bw} height={bh} fill={theme.town.color} opacity={0.92} />
            <rect x={cx - 3} y={by + bh - 7} width={6} height={7} fill={theme.town.door} />
            <rect x={cx + 3} y={by + 2} width={4} height={4} fill={theme.town.window} />
            <rect x={cx - 7} y={by + 2} width={4} height={4} fill={theme.town.window} />
          </>
        )}
        {townName && (
          <text
            x={cx}
            y={cy + 16}
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
};

export const renderPorts = (tiles: TilesState): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!DEEP_WATER.has(tile.terrain)) return [];
    const { q, r } = tile;
    const myKey = toKey(q, r);
    const { x: cx, y: cy } = axialToPixel(q, r);
    const corners = hexCorners(cx, cy);

    return NEIGHBOR_DIRS.flatMap((dir, i) => {
      const neighbor = tiles[toKey(q + dir.q, r + dir.r)];
      if (!neighbor?.hasTown) return [];
      if ((neighbor.portBlocked || []).includes(myKey)) return [];

      const ci = DIR_TO_EDGE_CORNER[i];
      const a = corners[ci];
      const b = corners[(ci + 1) % 6];
      const em = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

      const dx = cx - em.x,
        dy = cy - em.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / len,
        ny = dy / len;
      const px = -ny,
        py = nx;

      const plankHalf = theme.port.plankHalf;
      const pilingLen = theme.port.pilingLen;
      const color = theme.port.color;
      const pilingOffsets = [-plankHalf * 0.65, 0, plankHalf * 0.65];

      return [
        <g key={`port-${toKey(q, r)}-${i}`} style={{ pointerEvents: 'none' }}>
          {pilingOffsets.map((offset, j) => {
            return (
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
            );
          })}
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
};

// Pure helper functions that render SVG path/shape elements for the map overlay.
// These reference theme values directly (no React hooks) since they are plain
// functions, not components.

import React from 'react';
import {
  axialToPixel,
  hexCorners,
  NEIGHBOR_DIRS,
  toKey,
  DIR_TO_EDGE_CORNER,
  DEEP_WATER,
} from './hexUtils';
import { theme } from '../styles/theme';

const WATER_STUB_RATIO = 0.38;

const smoothPath = (ax, ay, bx, by, cx, cy, tension) => {
  const cp1x = ax + (cx - ax) * tension;
  const cp1y = ay + (cy - ay) * tension;
  const cp2x = bx + (cx - bx) * tension;
  const cp2y = by + (cy - by) * tension;
  return `M ${ax},${ay} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${bx},${by}`;
};

const curvedStub = (ax, ay, tx, ty, tension) => {
  const dx = tx - ax;
  const dy = ty - ay;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const bend = len * 0.18 * (1 - tension);
  const cpx = (ax + tx) / 2 + px * bend;
  const cpy = (ay + ty) / 2 + py * bend;
  return `M ${ax},${ay} Q ${cpx},${cpy} ${tx},${ty}`;
};

const FLAG_BLOCKED_KEY = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked' };

export const renderFlagPaths = (tiles, flag, style) => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile[flag]) return [];

    const { q, r, terrain } = tile;
    const myKey = toKey(q, r);
    const isDeepWater = DEEP_WATER.has(terrain);
    const { x: cx, y: cy } = axialToPixel(q, r);
    const blockedKey = FLAG_BLOCKED_KEY[flag];
    const blocked = tile[blockedKey] || [];

    const connectedEdges = NEIGHBOR_DIRS.map((dir, i) => {
      const nk = toKey(q + dir.q, r + dir.r);
      const neighbor = tiles[nk];
      if (!neighbor?.[flag]) return null;
      if (blocked.includes(nk)) return null;
      if ((neighbor[blockedKey] || []).includes(myKey)) return null;
      return i;
    }).filter((i) => {
      return i !== null;
    });

    if (connectedEdges.length === 0) {
      if (isDeepWater) return [];
      return [
        <circle
          key={`${flag}-pool-${toKey(q, r)}`}
          cx={cx}
          cy={cy}
          r={style.poolRadius}
          fill={style.color}
          opacity={0.85}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    }

    const corners = hexCorners(cx, cy);
    const midpoints = connectedEdges.map((i) => {
      const ci = DIR_TO_EDGE_CORNER[i];
      const a = corners[ci];
      const b = corners[(ci + 1) % 6];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    });

    const paths = [];

    if (connectedEdges.length === 2 && !isDeepWater) {
      const [a, b] = midpoints;
      paths.push(smoothPath(a.x, a.y, b.x, b.y, cx, cy, style.tension));
    } else {
      midpoints.forEach((em) => {
        const targetX = isDeepWater ? em.x + (cx - em.x) * WATER_STUB_RATIO : cx;
        const targetY = isDeepWater ? em.y + (cy - em.y) * WATER_STUB_RATIO : cy;
        paths.push(curvedStub(em.x, em.y, targetX, targetY, style.tension));
      });
    }

    return paths.map((d, i) => {
      return (
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
      );
    });
  });
};

export const renderWaterEdges = (tiles, terrainType) => {
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

export const renderTowns = (tiles, armiesByTile = {}) => {
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

export const renderPorts = (tiles) => {
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

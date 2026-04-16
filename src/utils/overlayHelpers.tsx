import React from 'react';
import { VillageIcon, TownIcon, CityIcon } from '../assets/icons/town';
import {
  axialToPixel,
  hexCorners,
  NEIGHBOR_DIRS,
  toKey,
  DIR_TO_EDGE_CORNER,
  DEEP_WATER,
} from './hexUtils';
import {
  computeConnectedDirs,
  buildFeaturePaths,
  buildRoadPaths,
  getFeatureAnchor,
  getInwardNormal,
} from './pathGenerator';
import type { CubicBezier } from './pathGenerator';
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

// Renders road and river paths for all tiles using the programmatic path generator.
// Rivers and roads each use offset edge anchors so they never overlap even when
// sharing the same tile edges. Each feature is rendered independently — no
// combined lookup table is required.
export const renderFlagPaths = (
  tiles: TilesState,
  flag: FlagKey,
  style: PathStyle,
  deepWaterSet: Set<string> = DEEP_WATER
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile[flag]) return [];

    const { q, r, terrain } = tile;
    const key = toKey(q, r);

    if (deepWaterSet.has(terrain)) return [];

    const { x: cx, y: cy } = axialToPixel(q, r);
    const connectedDirs = computeConnectedDirs(tiles, q, r, flag);

    // Isolated tile — render a pool dot at the tile centre
    if (connectedDirs.length === 0) {
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

    const feature = flag === 'hasRiver' ? 'river' : 'road';
    const paths = buildFeaturePaths(cx, cy, connectedDirs, feature);

    return paths.map(({ svgPath }, i) => {
      return (
        <g key={`${flag}-${key}-${i}`} style={{ pointerEvents: 'none' }}>
          <path
            d={svgPath}
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

// Collects all river CubicBezier descriptors for every tile, keyed by "q,r".
// Called once per render cycle in WaterOverlay so road rendering can use the
// same river geometry for intersection detection without recomputing it.
export const computeAllRiverCurves = (
  tiles: TilesState,
  deepWaterSet: Set<string> = DEEP_WATER
): Map<string, CubicBezier[]> => {
  const result = new Map<string, CubicBezier[]>();
  Object.values(tiles).forEach((tile) => {
    if (!tile.hasRiver || deepWaterSet.has(tile.terrain)) return;
    const { q, r } = tile;
    const { x: cx, y: cy } = axialToPixel(q, r);
    const connectedDirs = computeConnectedDirs(tiles, q, r, 'hasRiver');
    if (connectedDirs.length === 0) return;
    const paths = buildFeaturePaths(cx, cy, connectedDirs, 'river');
    const curves = paths.flatMap((p) => {
      return p.curve !== null ? [p.curve] : [];
    });
    if (curves.length > 0) result.set(toKey(q, r), curves);
  });
  return result;
};

// Renders river-aware road paths for all tiles.
// Roads are routed around rivers when possible; unavoidable crossings are
// reconstructed to cross at 90°. Receives pre-computed river curves from
// WaterOverlay so geometry is not duplicated.
export const renderRoadPaths = (
  tiles: TilesState,
  style: PathStyle,
  riverCurvesByTile: Map<string, CubicBezier[]>,
  deepWaterSet: Set<string> = DEEP_WATER
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile.hasRoad) return [];

    const { q, r, terrain, hasTown } = tile;
    const key = toKey(q, r);

    if (deepWaterSet.has(terrain)) return [];

    const { x: cx, y: cy } = axialToPixel(q, r);
    const connectedDirs = computeConnectedDirs(tiles, q, r, 'hasRoad');

    if (connectedDirs.length === 0) {
      return [
        <circle
          key={`hasRoad-pool-${key}`}
          cx={cx}
          cy={cy}
          r={style.poolRadius}
          fill={style.color}
          opacity={0.85}
          style={{ pointerEvents: 'none' }}
        />,
      ];
    }

    const riverCurves = riverCurvesByTile.get(key) ?? [];
    const svgPaths = buildRoadPaths(cx, cy, connectedDirs, riverCurves, hasTown);

    return svgPaths.map((svgPath, i) => {
      return (
        <g key={`hasRoad-${key}-${i}`} style={{ pointerEvents: 'none' }}>
          <path
            d={svgPath}
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
// Draws the road embankment using the same programmatic path generator as roads
// so edge anchors align perfectly at tile boundaries. Also draws short perpendicular
// notch lines at each connected edge to suggest water channels beneath the structure.
export const renderCausewayPaths = (
  tiles: TilesState,
  style: CausewayStyle,
  deepWaterSet: Set<string> = DEEP_WATER
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile.hasRoad) return [];
    if (!deepWaterSet.has(tile.terrain)) return [];

    const { q, r } = tile;
    const key = toKey(q, r);
    const { x: cx, y: cy } = axialToPixel(q, r);
    const connectedDirs = computeConnectedDirs(tiles, q, r, 'hasRoad');

    if (connectedDirs.length === 0) {
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

    // Use the same path generation as land roads — no river curves on water tiles.
    const svgPaths = buildRoadPaths(cx, cy, connectedDirs, [], false);

    const embankment = svgPaths.map((svgPath, i) => {
      return (
        <g key={`causeway-emb-${key}-${i}`} style={{ pointerEvents: 'none' }}>
          <path
            d={svgPath}
            fill="none"
            stroke={style.color}
            strokeWidth={style.width}
            strokeLinecap={style.linecap as React.SVGAttributes<SVGPathElement>['strokeLinecap']}
            opacity={0.9}
          />
        </g>
      );
    });

    // Place a perpendicular notch at each connected edge anchor to suggest water
    // channels flowing beneath the raised causeway.
    const NOTCH_HALF = 6;
    const channels = connectedDirs.map((dirIndex, i) => {
      const anchor = getFeatureAnchor(cx, cy, dirIndex, 'road');
      const normal = getInwardNormal(cx, cy, dirIndex);
      // Tangent along the edge = 90° rotation of the inward normal
      const tx = -normal.y;
      const ty = normal.x;
      const d =
        `M ${(anchor.x + tx * NOTCH_HALF).toFixed(2)},${(anchor.y + ty * NOTCH_HALF).toFixed(2)} ` +
        `L ${(anchor.x - tx * NOTCH_HALF).toFixed(2)},${(anchor.y - ty * NOTCH_HALF).toFixed(2)}`;
      return (
        <g key={`causeway-notch-${key}-${i}`} style={{ pointerEvents: 'none' }}>
          <path
            d={d}
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

const townLayout = (radius: number, wallW: number) => {
  const outerR = radius + wallW / 2;
  return { outerR };
};

// Renders a kite shield inline (so faction color can be applied dynamically).
// Centered on (cx, cy), sized relative to the town radius.
function renderKiteShield(
  cx: number,
  cy: number,
  radius: number,
  factionColor: string | null
): React.ReactElement {
  const h = radius * 1.5;
  const w = h * (20 / 28); // fixed kite-shield aspect ratio from the SVG asset
  const fill = factionColor ?? '#3a3a6a';
  const sw = Math.max(1, radius * 0.055); // stroke width scales with size

  const l = cx - w / 2;
  const r = cx + w / 2;
  const t = cy - h / 2;
  const b = cy + h / 2;
  const ym = t + h * 0.625; // latitude where the sides start curving to the tip

  // Kite shield outline: flat top, straight sides down to ~62%, then quadratic curves to bottom tip
  const bodyPath = `M${l},${t} L${r},${t} L${r},${ym} Q${r},${b} ${cx},${b} Q${l},${b} ${l},${ym} Z`;

  // Boss position
  const bossCy = t + h * 0.45;
  const bossR = w * 0.12;

  // Horizontal crossbar and spine
  const crossY = t + h * 0.4;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Drop shadow */}
      <path d={bodyPath} fill="rgba(0,0,0,0.3)" transform="translate(0.8,1.2)" />
      {/* Shield body */}
      <path d={bodyPath} fill={fill} stroke="rgba(0,0,0,0.7)" strokeWidth={sw} />
      {/* Top-left highlight for depth */}
      <path
        d={`M${l + sw},${t + sw} L${cx - 1},${t + sw} L${cx - 1},${t + h * 0.38} L${l + sw},${t + h * 0.52} Z`}
        fill="rgba(255,255,255,0.15)"
      />
      {/* Central spine */}
      <line
        x1={cx}
        y1={t + sw}
        x2={cx}
        y2={b - sw * 2}
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={sw * 0.5}
      />
      {/* Horizontal crossbar */}
      <line
        x1={l + sw}
        y1={crossY}
        x2={r - sw}
        y2={crossY}
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={sw * 0.5}
      />
      {/* Shield boss */}
      <circle
        cx={cx}
        cy={bossCy}
        r={bossR}
        fill="rgba(255,255,255,0.22)"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={sw * 0.4}
      />
    </g>
  );
}

export const renderTownIcons = (
  tiles: TilesState,
  armiesByTile: Record<string, Army[]> = {},
  factionColorMap: Record<string, string> = {},
  deepWaterSet: Set<string> = DEEP_WATER
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile.hasTown) return [];
    const { q, r, terrain } = tile;
    if (deepWaterSet.has(terrain)) return [];
    const { x: cx, y: cy } = axialToPixel(q, r);
    const key = toKey(q, r);
    const armies = armiesByTile[key] ?? [];
    const garrisoned = armies.length > 0;

    const fortification = tile.fortification ?? 'none';
    const fortConfig = fortification === 'none' ? null : theme.town.fortification[fortification];

    const townSize = tile.townSize ?? 'town';
    const radius = theme.town.size[townSize].radius;

    const wallMarks = fortConfig
      ? Array.from({ length: fortConfig.markCount }, (_, i) => {
          const angle = (i / fortConfig.markCount) * 2 * Math.PI;
          const inner = radius - 1.5;
          const outer = radius + 1.5;
          return (
            <line
              key={i}
              x1={cx + inner * Math.cos(angle)}
              y1={cy + inner * Math.sin(angle)}
              x2={cx + outer * Math.cos(angle)}
              y2={cy + outer * Math.sin(angle)}
              stroke={fortConfig.markColor}
              strokeWidth={1.5}
            />
          );
        })
      : [];

    // Resolve faction color from the first garrisoned army
    const factionId = armies[0]?.factionId ?? null;
    const factionColor = factionId ? (factionColorMap[factionId] ?? null) : null;

    return [
      <g key={`town-${key}`} style={{ pointerEvents: 'none' }}>
        {/* Town icon: ground fill + buildings for this town size */}
        {townSize === 'village' && (
          <VillageIcon
            x={cx - radius}
            y={cy - radius}
            width={radius * 2}
            height={radius * 2}
            groundColor={theme.town.groundColor}
            buildingColor={theme.town.buildingColor}
            streetColor={theme.town.streetColor}
          />
        )}
        {townSize === 'town' && (
          <TownIcon
            x={cx - radius}
            y={cy - radius}
            width={radius * 2}
            height={radius * 2}
            groundColor={theme.town.groundColor}
            buildingColor={theme.town.buildingColor}
            streetColor={theme.town.streetColor}
          />
        )}
        {townSize === 'city' && (
          <CityIcon
            x={cx - radius}
            y={cy - radius}
            width={radius * 2}
            height={radius * 2}
            groundColor={theme.town.groundColor}
            buildingColor={theme.town.buildingColor}
            streetColor={theme.town.streetColor}
            courtyardColor={theme.town.courtyardColor}
          />
        )}
        {fortConfig && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={fortConfig.wallColor}
            strokeWidth={fortConfig.wallWidth}
          />
        )}
        {wallMarks}
        {garrisoned && renderKiteShield(cx, cy, radius, factionColor)}
      </g>,
    ];
  });
};

export const renderTownLabels = (
  tiles: TilesState,
  armiesByTile: Record<string, Army[]> = {},
  deepWaterSet: Set<string> = DEEP_WATER
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!tile.hasTown) return [];
    const { q, r, terrain, townName } = tile;
    if (deepWaterSet.has(terrain)) return [];
    const { x: cx, y: cy } = axialToPixel(q, r);
    const key = toKey(q, r);
    const armies = armiesByTile[key] ?? [];
    const garrisoned = armies.length > 0;
    const fortification = tile.fortification ?? 'none';
    const wallW = fortification === 'none' ? 0 : theme.town.fortification[fortification].wallWidth;
    const radius = theme.town.size[tile.townSize ?? 'town'].radius;
    const { outerR } = townLayout(radius, wallW);

    const labels: React.ReactElement[] = [];

    if (garrisoned && armies.length === 1 && armies[0].name) {
      labels.push(
        <text
          key={`army-label-${key}`}
          x={cx}
          y={cy - outerR - 8}
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
          style={{ pointerEvents: 'none' }}
        >
          {armies[0].name}
        </text>
      );
    }

    if (townName) {
      labels.push(
        <text
          key={`town-label-${key}`}
          x={cx}
          y={cy + outerR + 9}
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
          style={{ pointerEvents: 'none' }}
        >
          {townName}
        </text>
      );
    }

    return labels;
  });
};

export const renderPorts = (
  tiles: TilesState,
  deepWaterSet: Set<string> = DEEP_WATER
): React.ReactElement[] => {
  return Object.values(tiles).flatMap((tile) => {
    if (!deepWaterSet.has(tile.terrain)) return [];
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

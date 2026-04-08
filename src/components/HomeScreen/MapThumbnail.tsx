import React, { useMemo } from 'react';
import { axialToPixel, hexPointsString, HEX_SIZE } from '../../utils/hexUtils';
import { theme } from '../../styles/theme';
import type { TilesState } from '../../types/state';
import type { TerrainType, CustomTerrainType } from '../../types/domain';

const THUMB_W = 220;
const THUMB_H = 160;

interface MapThumbnailProps {
  tilesData: TilesState;
  customTerrains?: CustomTerrainType[];
}

const MapThumbnail = ({
  tilesData,
  customTerrains = [],
}: MapThumbnailProps): React.ReactElement => {
  const tiles = useMemo(() => {
    return Object.values(tilesData || {});
  }, [tilesData]);

  const transform = useMemo(() => {
    if (tiles.length === 0) return '';

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    tiles.forEach(({ q, r }) => {
      const { x, y } = axialToPixel(q, r);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const contentW = maxX - minX + HEX_SIZE * 2;
    const contentH = maxY - minY + HEX_SIZE * 2;
    const scale = Math.min((THUMB_W * 0.9) / contentW, (THUMB_H * 0.9) / contentH, 1);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    return `translate(${THUMB_W / 2}, ${THUMB_H / 2}) scale(${scale}) translate(${-cx}, ${-cy})`;
  }, [tiles]);

  return (
    <svg
      width={THUMB_W}
      height={THUMB_H}
      style={{
        display: 'block',
        borderRadius: '6px 6px 0 0',
        background: theme.background,
        pointerEvents: 'none',
      }}
    >
      {tiles.length === 0 ? (
        <text
          x={THUMB_W / 2}
          y={THUMB_H / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={theme.textMuted}
          fontSize="11"
          fontFamily="sans-serif"
        >
          Empty map
        </text>
      ) : (
        <g transform={transform}>
          {tiles.map(({ q, r, terrain }) => {
            const { x, y } = axialToPixel(q, r);
            const color =
              theme.terrain[terrain as TerrainType]?.color ??
              customTerrains.find((ct) => {
                return ct.id === terrain;
              })?.color ??
              theme.terrain.grass.color;
            return (
              <polygon
                key={`${q},${r}`}
                points={hexPointsString(x, y)}
                fill={color}
                stroke={theme.tileStroke}
                strokeWidth={1}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
};

export default MapThumbnail;

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hexPointsString, axialToPixel, HEX_SIZE } from './HexUtils';
import { selectTile, deselectTile } from '../../features/ui/uiSlice';
import { deleteTile } from '../../features/tiles/tilesSlice';
import { toKey } from './HexUtils';
import { theme } from '../../styles/theme';

const HexTile = ({ q, r }) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const selectedTile = useSelector((state) => state.ui.selectedTile);
  const terrain = useSelector((state) => state.tiles[toKey(q, r)]?.terrain ?? 'grass');

  const { x, y } = axialToPixel(q, r);
  const key = toKey(q, r);
  const isSelected = selectedTile === key;
  const terrainData = theme.terrain[terrain] ?? theme.terrain.grass;
  const points = hexPointsString(x, y);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      dispatch(deselectTile());
    } else {
      dispatch(selectTile(key));
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) dispatch(deselectTile());
    dispatch(deleteTile({ q, r }));
  };

  return (
    <g
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Base terrain colour */}
      <polygon
        points={points}
        fill={terrainData.color}
        stroke={theme.tileStroke}
        strokeWidth={1.5}
      />
      {/* Texture pattern overlay */}
      <polygon
        points={points}
        fill={`url(#pattern-${terrain})`}
        stroke="none"
        style={{ pointerEvents: 'none' }}
      />
      {/* Selection ring — inset so it stays inside the tile and isn't overlapped by neighbours */}
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
      {/* Hover highlight */}
      {hovered && (
        <polygon
          points={points}
          fill="white"
          opacity={0.12}
          stroke="none"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
};

export default HexTile;

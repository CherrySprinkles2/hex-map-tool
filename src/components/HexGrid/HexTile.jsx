import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hexPointsString, axialToPixel } from './HexUtils';
import { selectTile, deselectTile } from '../../features/ui/uiSlice';
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

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      dispatch(deselectTile());
    } else {
      dispatch(selectTile(key));
    }
  };

  return (
    <g
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <polygon
        points={hexPointsString(x, y)}
        fill={terrainData.color}
        stroke={isSelected ? theme.selectedStroke : theme.tileStroke}
        strokeWidth={isSelected ? 3 : 1.5}
        filter={hovered && !isSelected ? 'brightness(1.3)' : undefined}
      />
      {/* Highlight overlay on hover */}
      {hovered && (
        <polygon
          points={hexPointsString(x, y)}
          fill="white"
          opacity={0.12}
          stroke="none"
          style={{ pointerEvents: 'none' }}
        />
      )}
      <text
        x={x}
        y={y + 6}
        textAnchor="middle"
        fontSize="20"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {terrainData.icon}
      </text>
    </g>
  );
};

export default HexTile;

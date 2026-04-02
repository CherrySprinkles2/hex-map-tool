import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hexPointsString, axialToPixel } from './HexUtils';
import { selectTile, deselectTile } from '../../features/ui/uiSlice';
import { toKey } from './HexUtils';
import { theme } from '../../styles/theme';

const HexTile = ({ q, r }) => {
  const dispatch = useDispatch();
  const selectedTile = useSelector((state) => state.ui.selectedTile);
  const terrain = useSelector((state) => state.tiles[toKey(q, r)]?.terrain ?? 'plain');

  const { x, y } = axialToPixel(q, r);
  const key = toKey(q, r);
  const isSelected = selectedTile === key;
  const terrainData = theme.terrain[terrain] ?? theme.terrain.plain;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      dispatch(deselectTile());
    } else {
      dispatch(selectTile(key));
    }
  };

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      <polygon
        points={hexPointsString(x, y)}
        fill={terrainData.color}
        stroke={isSelected ? theme.selectedStroke : theme.tileStroke}
        strokeWidth={isSelected ? 3 : 1.5}
      />
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

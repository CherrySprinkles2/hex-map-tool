import React from 'react';
import { useDispatch } from 'react-redux';
import { hexPointsString, axialToPixel } from './HexUtils';
import { addTile } from '../../features/tiles/tilesSlice';
import { theme } from '../../styles/theme';

const GhostTile = ({ q, r }) => {
  const dispatch = useDispatch();
  const { x, y } = axialToPixel(q, r);

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch(addTile({ q, r, terrain: 'plain' }));
  };

  return (
    <polygon
      points={hexPointsString(x, y)}
      fill={theme.ghostFill}
      stroke={theme.ghostStroke}
      strokeWidth={1.5}
      strokeDasharray="6 4"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default GhostTile;

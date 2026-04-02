import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { hexPointsString, axialToPixel } from './HexUtils';
import { addTile } from '../../features/tiles/tilesSlice';
import { theme } from '../../styles/theme';

const GhostTile = ({ q, r }) => {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const { x, y } = axialToPixel(q, r);

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch(addTile({ q, r, terrain: 'grass' }));
  };

  return (
    <polygon
      points={hexPointsString(x, y)}
      fill={hovered ? 'rgba(255,255,255,0.15)' : theme.ghostFill}
      stroke={hovered ? 'rgba(255,255,255,0.6)' : theme.ghostStroke}
      strokeWidth={hovered ? 2 : 1.5}
      strokeDasharray="6 4"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', transition: 'fill 0.15s, stroke 0.15s' }}
    />
  );
};

export default GhostTile;

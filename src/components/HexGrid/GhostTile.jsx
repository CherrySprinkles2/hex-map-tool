import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { hexPointsString, axialToPixel, toKey, getNeighbors } from './HexUtils';
import { addTile } from '../../features/tiles/tilesSlice';
import { selectTile } from '../../features/ui/uiSlice';
import { theme } from '../../styles/theme';

// Infer the best terrain for a new tile at (q, r) based on existing neighbours.
// Uses the most common terrain among neighbours; breaks ties by most recently placed.
const inferTerrain = (q, r, tiles) => {
  const neighbors = getNeighbors(q, r);
  const counts = {};

  neighbors.forEach(({ q: nq, r: nr }) => {
    const tile = tiles[toKey(nq, nr)];
    if (tile) counts[tile.terrain] = (counts[tile.terrain] || 0) + 1;
  });

  if (Object.keys(counts).length === 0) return 'grass';

  const maxCount = Math.max(...Object.values(counts));
  const tied = Object.keys(counts).filter((t) => counts[t] === maxCount);

  if (tied.length === 1) return tied[0];

  // Tie-break: walk tile insertion order in reverse to find the most recently
  // placed neighbour whose terrain is among the tied types.
  const neighborKeys = new Set(neighbors.map((n) => toKey(n.q, n.r)));
  const tileKeys = Object.keys(tiles);
  for (let i = tileKeys.length - 1; i >= 0; i--) {
    const key = tileKeys[i];
    if (neighborKeys.has(key) && tied.includes(tiles[key].terrain)) {
      return tiles[key].terrain;
    }
  }

  return tied[0];
};

const GhostTile = React.memo(({ q, r }) => {
  const dispatch = useDispatch();
  // useStore gives a stable ref to the Redux store; tiles are read only on click,
  // so GhostTile doesn't subscribe to tile state and won't re-render on tile changes.
  const store = useStore();
  const [hovered, setHovered] = useState(false);

  // Geometry is fixed for a given (q, r) — compute once
  const { x, y } = useMemo(() => axialToPixel(q, r), [q, r]);
  const points = useMemo(() => hexPointsString(x, y), [x, y]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const tiles = store.getState().tiles;
    const terrain = inferTerrain(q, r, tiles);
    dispatch(addTile({ q, r, terrain }));
    dispatch(selectTile(toKey(q, r)));
  }, [q, r, store, dispatch]);

  return (
    <polygon
      points={points}
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
});

export default GhostTile;

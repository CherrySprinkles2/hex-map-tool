import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { hexPointsString, axialToPixel, HEX_SIZE, toKey } from './HexUtils';
import { selectTile, deselectTile, setPlacingArmy, stopMovingArmy } from '../../features/ui/uiSlice';
import { deleteTile } from '../../features/tiles/tilesSlice';
import { addArmy, moveArmy } from '../../features/armies/armiesSlice';
import { theme } from '../../styles/theme';

const HexTile = React.memo(({ q, r }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const [hovered, setHovered] = useState(false);

  // Stable key for this tile — q and r never change for a given instance
  const key = useMemo(() => toKey(q, r), [q, r]);

  // Tile-specific selectors: only this tile re-renders when its selection or terrain changes
  const isSelected = useSelector((state) => state.ui.selectedTile === key);
  const terrain = useSelector((state) => state.tiles[key]?.terrain ?? 'grass');

  const terrainData = theme.terrain[terrain] ?? theme.terrain.grass;

  // Geometry is fixed for a given (q, r) — compute once
  const { x, y } = useMemo(() => axialToPixel(q, r), [q, r]);
  const points = useMemo(() => hexPointsString(x, y), [x, y]);
  const selectionPoints = useMemo(() => hexPointsString(x, y, HEX_SIZE - 5), [x, y]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const ui = store.getState().ui;

    if (ui.movingArmyId) {
      dispatch(moveArmy({ id: ui.movingArmyId, q, r }));
      dispatch(stopMovingArmy());
      return;
    }

    if (ui.placingArmy) {
      dispatch(addArmy({ q, r }));
      dispatch(setPlacingArmy(false));
      return;
    }

    if (isSelected) dispatch(deselectTile());
    else dispatch(selectTile(key));
  }, [isSelected, dispatch, key, q, r, store]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) dispatch(deselectTile());
    dispatch(deleteTile({ q, r }));
  }, [isSelected, dispatch, q, r]);

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
          points={selectionPoints}
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
});

export default HexTile;

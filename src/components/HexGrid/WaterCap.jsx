import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { useTheme } from 'styled-components';
import { axialToPixel, hexPointsString, HEX_SIZE, toKey } from '../../utils/hexUtils';
import { selectTile, deselectTile } from '../../features/ui/uiSlice';
import { deleteTile, setTileFaction } from '../../features/tiles/tilesSlice';

// WaterCap: renders the fill and interaction layer for a single water tile.
// Extracted so selection/hover state is local — only this tile re-renders on selection change.
const WaterCap = React.memo(({ q, r, terrain }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const store = useStore();
  const key = useMemo(() => {
    return toKey(q, r);
  }, [q, r]);

  const isSelected = useSelector((state) => {
    return state.ui.selectedTile === key;
  });
  const factionColor = useSelector((state) => {
    if (state.ui.mapMode !== 'faction') return null;
    const factionId = state.tiles[key]?.factionId;
    if (!factionId) return null;
    return (
      state.factions.find((f) => {
        return f.id === factionId;
      })?.color ?? null
    );
  });

  const [hovered, setHovered] = useState(false);
  const { x, y } = useMemo(() => {
    return axialToPixel(q, r);
  }, [q, r]);
  const pts = useMemo(() => {
    return hexPointsString(x, y);
  }, [x, y]);
  const selectionPts = useMemo(() => {
    return hexPointsString(x, y, HEX_SIZE - 5);
  }, [x, y]);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      const ui = store.getState().ui;

      if (ui.mapMode === 'faction') {
        dispatch(setTileFaction({ q, r, factionId: ui.activeFactionId }));
        return;
      }

      if (isSelected) dispatch(deselectTile());
      else dispatch(selectTile(key));
    },
    [isSelected, dispatch, key, q, r, store]
  );

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isSelected) dispatch(deselectTile());
      dispatch(deleteTile({ q, r }));
    },
    [isSelected, dispatch, q, r]
  );

  return (
    <g
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => {
        return setHovered(true);
      }}
      onMouseLeave={() => {
        return setHovered(false);
      }}
      style={{ cursor: 'pointer' }}
    >
      <polygon points={pts} fill={theme.terrain[terrain].color} stroke="none" />
      <polygon
        points={pts}
        fill={`url(#pattern-${terrain})`}
        stroke="none"
        style={{ pointerEvents: 'none' }}
      />
      {factionColor && (
        <polygon
          points={selectionPts}
          fill="none"
          stroke={factionColor}
          strokeWidth={5}
          style={{ pointerEvents: 'none' }}
        />
      )}
      {hovered && (
        <polygon
          points={pts}
          fill="white"
          opacity={0.12}
          stroke="none"
          style={{ pointerEvents: 'none' }}
        />
      )}
      {isSelected && (
        <polygon
          points={selectionPts}
          fill="none"
          stroke={theme.selectedStroke}
          strokeWidth={2.5}
          strokeDasharray="6 3"
          strokeLinecap="round"
          style={{ animation: 'marchingAnts 1s linear infinite', pointerEvents: 'none' }}
        />
      )}
    </g>
  );
});

export default WaterCap;

import React, { useState, useMemo, useCallback, useContext } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { hexPointsString, axialToPixel, HEX_SIZE, toKey } from '../../utils/hexUtils';
import {
  selectTile,
  deselectTile,
  setPlacingArmy,
  stopMovingArmy,
} from '../../features/ui/uiSlice';
import {
  deleteTile,
  setTileFaction,
  updateTile,
  setTileFeature,
} from '../../features/tiles/tilesSlice';
import { addArmy, moveArmy } from '../../features/armies/armiesSlice';
import { useTheme } from 'styled-components';
import { PaintContext } from './PaintContext';

// Detected once at module load — pointer: coarse = touch device (phone/tablet).
// Drag-to-paint is disabled on touch devices since drag = pan.
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

const HexTile = React.memo(({ q, r }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const store = useStore();
  const [hovered, setHovered] = useState(false);
  const isPaintingRef = useContext(PaintContext);

  // Stable key for this tile — q and r never change for a given instance
  const key = useMemo(() => {
    return toKey(q, r);
  }, [q, r]);

  // Tile-specific selectors: only this tile re-renders when its selection or terrain changes
  const isSelected = useSelector((state) => {
    return state.ui.selectedTile === key;
  });
  const terrain = useSelector((state) => {
    return state.tiles[key]?.terrain ?? 'grass';
  });

  // Faction overlay: only relevant in faction mode
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

  const terrainData = theme.terrain[terrain] ?? theme.terrain.grass;

  // Geometry is fixed for a given (q, r) — compute once
  const { x, y } = useMemo(() => {
    return axialToPixel(q, r);
  }, [q, r]);
  const points = useMemo(() => {
    return hexPointsString(x, y);
  }, [x, y]);
  const selectionPoints = useMemo(() => {
    return hexPointsString(x, y, HEX_SIZE - 5);
  }, [x, y]);

  // Applies the currently active paint brush to this tile.
  // Terrain brushes change the terrain type; feature brushes toggle river/road flags.
  const applyBrush = useCallback(
    (brushValue) => {
      if (!brushValue) return;
      if (theme.terrain[brushValue]) {
        dispatch(updateTile({ q, r, terrain: brushValue }));
      } else if (brushValue === 'river-on') {
        dispatch(setTileFeature({ q, r, flag: 'hasRiver', value: true }));
      } else if (brushValue === 'river-off') {
        dispatch(setTileFeature({ q, r, flag: 'hasRiver', value: false }));
      } else if (brushValue === 'road-on') {
        dispatch(setTileFeature({ q, r, flag: 'hasRoad', value: true }));
      } else if (brushValue === 'road-off') {
        dispatch(setTileFeature({ q, r, flag: 'hasRoad', value: false }));
      }
    },
    [dispatch, q, r, theme.terrain]
  );

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      const ui = store.getState().ui;

      if (ui.mapMode === 'terrain-paint') {
        applyBrush(ui.activePaintBrush);
        return;
      }

      if (ui.mapMode === 'faction') {
        dispatch(setTileFaction({ q, r, factionId: ui.activeFactionId }));
        return;
      }

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
    },
    [isSelected, dispatch, key, q, r, store, applyBrush]
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

  // Start a paint stroke on pointer down (desktop only — touch = pan).
  // isPaintingRef suppresses panning in HexGrid.handleMouseMove during the stroke.
  const handlePointerDown = useCallback(
    (e) => {
      if (isTouchDevice) return;
      const ui = store.getState().ui;
      if (ui.mapMode !== 'terrain-paint' && ui.mapMode !== 'faction') return;
      isPaintingRef.current = true;
      if (ui.mapMode === 'terrain-paint') {
        applyBrush(ui.activePaintBrush);
      } else {
        dispatch(setTileFaction({ q, r, factionId: ui.activeFactionId }));
      }
    },
    [store, isPaintingRef, applyBrush, dispatch, q, r]
  );

  // Continue painting as the pointer enters this tile during an active stroke.
  const handlePointerEnter = useCallback(
    (e) => {
      if (isTouchDevice) return;
      if (!isPaintingRef.current) return;
      const ui = store.getState().ui;
      if (ui.mapMode === 'terrain-paint') {
        applyBrush(ui.activePaintBrush);
      } else if (ui.mapMode === 'faction') {
        dispatch(setTileFaction({ q, r, factionId: ui.activeFactionId }));
      }
    },
    [store, isPaintingRef, applyBrush, dispatch, q, r]
  );

  return (
    <g
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onMouseEnter={() => {
        return setHovered(true);
      }}
      onMouseLeave={() => {
        return setHovered(false);
      }}
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
      {/* Faction border — inset so it doesn't bleed onto neighbouring tiles */}
      {factionColor && (
        <polygon
          points={selectionPoints}
          fill="none"
          stroke={factionColor}
          strokeWidth={5}
          style={{ pointerEvents: 'none' }}
        />
      )}
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

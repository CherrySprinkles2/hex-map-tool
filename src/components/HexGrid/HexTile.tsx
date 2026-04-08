import React, { useState, useMemo, useCallback, useContext } from 'react';
import { useTheme } from 'styled-components';
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
import { useAppDispatch, useAppSelector, useAppStore } from '../../app/hooks';
import { PaintContext } from './PaintContext';
import type { TileFlag } from '../../types/domain';

interface HexTileProps {
  q: number;
  r: number;
}

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

const HexTile = React.memo(({ q, r }: HexTileProps): React.ReactElement => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const [hovered, setHovered] = useState(false);
  const isPaintingRef = useContext(PaintContext);

  const key = useMemo(() => {
    return toKey(q, r);
  }, [q, r]);

  const isSelected = useAppSelector((state) => {
    return state.ui.selectedTile === key;
  });
  const terrain = useAppSelector((state) => {
    return state.tiles[key]?.terrain ?? 'grass';
  });

  const factionColor = useAppSelector((state) => {
    if (state.ui.mapMode !== 'faction') return null;
    const factionId = state.tiles[key]?.factionId;
    if (!factionId) return null;
    return (
      state.factions.find((f) => {
        return f.id === factionId;
      })?.color ?? null
    );
  });

  const customTerrainColor = useAppSelector((state) => {
    if (theme.terrain[terrain as keyof typeof theme.terrain]) return null;
    return (
      state.terrainConfig.custom.find((ct) => {
        return ct.id === terrain;
      })?.color ?? null
    );
  });

  const terrainData = theme.terrain[terrain as keyof typeof theme.terrain] ?? theme.terrain.grass;
  const fillColor = customTerrainColor ?? terrainData.color;

  const { x, y } = useMemo(() => {
    return axialToPixel(q, r);
  }, [q, r]);
  const points = useMemo(() => {
    return hexPointsString(x, y);
  }, [x, y]);
  const selectionPoints = useMemo(() => {
    return hexPointsString(x, y, HEX_SIZE - 5);
  }, [x, y]);

  const applyBrush = useCallback(
    (brushValue: string | null) => {
      if (!brushValue) return;
      const customTerrains = store.getState().terrainConfig.custom;
      const isTerrainBrush =
        !!theme.terrain[brushValue as keyof typeof theme.terrain] ||
        customTerrains.some((ct) => {
          return ct.id === brushValue;
        });
      if (isTerrainBrush) {
        dispatch(updateTile({ q, r, terrain: brushValue }));
      } else if (brushValue === 'river-on') {
        dispatch(setTileFeature({ q, r, flag: 'hasRiver' as TileFlag, value: true }));
      } else if (brushValue === 'river-off') {
        dispatch(setTileFeature({ q, r, flag: 'hasRiver' as TileFlag, value: false }));
      } else if (brushValue === 'road-on') {
        dispatch(setTileFeature({ q, r, flag: 'hasRoad' as TileFlag, value: true }));
      } else if (brushValue === 'road-off') {
        dispatch(setTileFeature({ q, r, flag: 'hasRoad' as TileFlag, value: false }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, q, r] // theme is a stable module-level constant
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
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
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isSelected) dispatch(deselectTile());
      dispatch(deleteTile({ q, r }));
    },
    [isSelected, dispatch, q, r]
  );

  const handlePointerDown = useCallback(
    (_e: React.PointerEvent) => {
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

  const handlePointerEnter = useCallback(
    (_e: React.PointerEvent) => {
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
      data-testid={`hex-tile-${q},${r}`}
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
      <polygon points={points} fill={fillColor} stroke={theme.tileStroke} strokeWidth={1.5} />
      <polygon
        points={points}
        fill={`url(#pattern-${terrain})`}
        stroke="none"
        style={{ pointerEvents: 'none' }}
      />
      {factionColor && (
        <polygon
          points={selectionPoints}
          fill="none"
          stroke={factionColor}
          strokeWidth={5}
          style={{ pointerEvents: 'none' }}
        />
      )}
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

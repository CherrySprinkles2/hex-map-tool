import React, { useState, useMemo, useCallback, useContext } from 'react';
import { useTheme } from 'styled-components';
import { hexPointsString, axialToPixel, toKey, getNeighbors } from '../../utils/hexUtils';
import { addTile, setTileFaction } from '../../features/tiles/tilesSlice';
import { selectTile, setPlacingArmy, stopMovingArmy } from '../../features/ui/uiSlice';
import { addArmy, moveArmy } from '../../features/armies/armiesSlice';
import { useAppDispatch, useAppStore } from '../../app/hooks';
import { PaintContext } from './PaintContext';
import { theme as appTheme } from '../../styles/theme';
import type { TerrainType } from '../../types/domain';
import type { TilesState } from '../../types/state';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

interface GhostTileProps {
  q: number;
  r: number;
}

const inferTerrain = (q: number, r: number, tiles: TilesState): TerrainType => {
  const neighbors = getNeighbors(q, r);
  const counts: Record<string, number> = {};

  neighbors.forEach(({ q: nq, r: nr }) => {
    const tile = tiles[toKey(nq, nr)];
    if (tile) counts[tile.terrain] = (counts[tile.terrain] || 0) + 1;
  });

  if (Object.keys(counts).length === 0) return 'grass';

  const maxCount = Math.max(...Object.values(counts));
  const tied = Object.keys(counts).filter((t) => {
    return counts[t] === maxCount;
  });

  if (tied.length === 1) return tied[0] as TerrainType;

  const neighborKeys = new Set(
    neighbors.map((n) => {
      return toKey(n.q, n.r);
    })
  );
  const tileKeys = Object.keys(tiles);
  for (let i = tileKeys.length - 1; i >= 0; i--) {
    const key = tileKeys[i];
    if (neighborKeys.has(key) && tied.includes(tiles[key].terrain)) {
      return tiles[key].terrain;
    }
  }

  return tied[0] as TerrainType;
};

const GhostTile = React.memo(({ q, r }: GhostTileProps): React.ReactElement => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const isPaintingRef = useContext(PaintContext);
  const [hovered, setHovered] = useState(false);

  const { x, y } = useMemo(() => {
    return axialToPixel(q, r);
  }, [q, r]);
  const points = useMemo(() => {
    return hexPointsString(x, y);
  }, [x, y]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const state = store.getState();
      const { movingArmyId, placingArmy, mapMode, activeFactionId, activePaintBrush } = state.ui;
      const tiles = state.tiles;

      if (movingArmyId) {
        const terrain = inferTerrain(q, r, tiles);
        dispatch(addTile({ q, r, terrain }));
        dispatch(moveArmy({ id: movingArmyId, q, r }));
        dispatch(stopMovingArmy());
        return;
      }

      if (placingArmy) {
        const terrain = inferTerrain(q, r, tiles);
        dispatch(addTile({ q, r, terrain }));
        dispatch(addArmy({ q, r }));
        dispatch(setPlacingArmy(false));
        return;
      }

      if (mapMode === 'terrain-paint') {
        if (
          activePaintBrush &&
          appTheme.terrain[activePaintBrush as keyof typeof appTheme.terrain]
        ) {
          dispatch(addTile({ q, r, terrain: activePaintBrush as TerrainType }));
        } else {
          const terrain = inferTerrain(q, r, tiles);
          dispatch(addTile({ q, r, terrain }));
          dispatch(selectTile(toKey(q, r)));
        }
        return;
      }

      if (mapMode === 'faction') {
        const terrain = inferTerrain(q, r, tiles);
        dispatch(addTile({ q, r, terrain }));
        dispatch(setTileFaction({ q, r, factionId: activeFactionId }));
        return;
      }

      const terrain = inferTerrain(q, r, tiles);
      dispatch(addTile({ q, r, terrain }));
      dispatch(selectTile(toKey(q, r)));
    },
    [q, r, store, dispatch]
  );

  const handlePointerDown = useCallback(
    (_e: React.PointerEvent) => {
      if (isTouchDevice) return;
      const ui = store.getState().ui;
      if (ui.mapMode !== 'terrain-paint') return;
      const brush = ui.activePaintBrush;
      if (!brush || !appTheme.terrain[brush as keyof typeof appTheme.terrain]) return;
      dispatch(addTile({ q, r, terrain: brush as TerrainType }));
      isPaintingRef.current = true;
    },
    [store, isPaintingRef, dispatch, q, r]
  );

  const handlePointerEnter = useCallback(
    (_e: React.PointerEvent) => {
      if (isTouchDevice) return;
      if (!isPaintingRef.current) return;
      const ui = store.getState().ui;
      if (ui.mapMode !== 'terrain-paint') return;
      const brush = ui.activePaintBrush;
      if (!brush || !appTheme.terrain[brush as keyof typeof appTheme.terrain]) return;
      if (!store.getState().tiles[toKey(q, r)]) {
        dispatch(addTile({ q, r, terrain: brush as TerrainType }));
      }
    },
    [store, isPaintingRef, dispatch, q, r]
  );

  return (
    <polygon
      data-testid={`ghost-tile-${q},${r}`}
      points={points}
      fill={hovered ? 'rgba(255,255,255,0.15)' : theme.ghostFill}
      stroke={hovered ? 'rgba(255,255,255,0.6)' : theme.ghostStroke}
      strokeWidth={hovered ? 2 : 1.5}
      strokeDasharray="6 4"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onMouseEnter={() => {
        return setHovered(true);
      }}
      onMouseLeave={() => {
        return setHovered(false);
      }}
      style={{ cursor: 'pointer', transition: 'fill 0.15s, stroke 0.15s' }}
    />
  );
});

export default GhostTile;

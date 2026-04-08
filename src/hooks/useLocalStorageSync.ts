import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../app/hooks';
import { useSelector } from 'react-redux';
import { store } from '../app/store';
import type { RootState } from '../app/store';
import { importTiles } from '../features/tiles/tilesSlice';
import { importArmies } from '../features/armies/armiesSlice';
import { importFactions } from '../features/factions/factionsSlice';
import { importTerrainConfig } from '../features/terrainConfig/terrainConfigSlice';
import { loadMap } from '../features/currentMap/currentMapSlice';
import { saveMapData, loadMapData, createMap } from '../utils/mapsStorage';
import * as historyManager from '../utils/historyManager';
import type { TilesState, ArmiesState, FactionsState, TerrainConfigState } from '../types/state';
import type { HistorySnapshot } from '../types/history';

const PAINT_SAVE_DEBOUNCE_MS = 500;

const DEFAULT_TERRAIN_CONFIG: TerrainConfigState = {
  disabled: [],
  custom: [],
  order: ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'],
};

const useLocalStorageSync = (): void => {
  const dispatch = useAppDispatch();
  const mapId = useSelector((state: RootState) => {
    return state.currentMap.id;
  });

  const justSavedPendingRef = useRef(false);
  const lastTilesRef = useRef<TilesState | null>(null);
  const lastArmiesRef = useRef<ArmiesState | null>(null);
  const lastFactionsRef = useRef<FactionsState | null>(null);
  const lastTerrainConfigRef = useRef<TerrainConfigState | null>(null);
  // Captured before-stroke snapshot; flushed as a single history entry after debounce
  const paintSnapshotRef = useRef<HistorySnapshot | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    historyManager.clearHistory();
  }, [mapId]);

  useEffect(() => {
    if (!mapId) return;

    if (justSavedPendingRef.current) {
      justSavedPendingRef.current = false;
    } else {
      const saved = loadMapData(mapId);
      if (saved) {
        try {
          dispatch(importTiles(saved.tiles));
        } catch {
          dispatch(importTiles({}));
        }
        dispatch(importArmies(saved.armies ?? {}));
        dispatch(importFactions(saved.factions ?? []));
        dispatch(importTerrainConfig(saved.terrainConfig ?? DEFAULT_TERRAIN_CONFIG));
      } else {
        dispatch(importTiles({}));
        dispatch(importArmies({}));
        dispatch(importFactions([]));
        dispatch(importTerrainConfig(DEFAULT_TERRAIN_CONFIG));
      }
    }

    const initial = store.getState();
    lastTilesRef.current = initial.tiles;
    lastArmiesRef.current = initial.armies;
    lastFactionsRef.current = initial.factions;
    lastTerrainConfigRef.current = initial.terrainConfig;

    const unsubscribe = store.subscribe(() => {
      const currentId = store.getState().currentMap.id;
      if (!currentId) return;

      const { tiles, armies, factions, ui, terrainConfig } = store.getState();

      const tilesChanged = tiles !== lastTilesRef.current;
      const armiesChanged = armies !== lastArmiesRef.current;
      const factionsChanged = factions !== lastFactionsRef.current;
      const terrainConfigChanged = terrainConfig !== lastTerrainConfigRef.current;

      if (!tilesChanged && !armiesChanged && !factionsChanged && !terrainConfigChanged) return;

      const isPaintMode = ui.mapMode === 'terrain-paint' || ui.mapMode === 'faction';

      if (isPaintMode && !terrainConfigChanged) {
        // Capture the pre-stroke state once; subsequent paints in the same stroke are suppressed
        if (!paintSnapshotRef.current) {
          paintSnapshotRef.current = {
            tiles: lastTilesRef.current!,
            armies: lastArmiesRef.current!,
            factions: lastFactionsRef.current!,
          };
        }

        lastTilesRef.current = tiles;
        lastArmiesRef.current = armies;
        lastFactionsRef.current = factions;
        lastTerrainConfigRef.current = terrainConfig;

        // Debounce the actual save + history push so they fire once per stroke
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveTimerRef.current = null;
          historyManager.push(paintSnapshotRef.current!);
          paintSnapshotRef.current = null;
          saveMapData(currentId, {
            tiles: lastTilesRef.current!,
            armies: lastArmiesRef.current!,
            factions: lastFactionsRef.current!,
            terrainConfig: lastTerrainConfigRef.current ?? DEFAULT_TERRAIN_CONFIG,
          });
        }, PAINT_SAVE_DEBOUNCE_MS);
      } else {
        // Flush any pending paint stroke before recording this non-paint change
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
          if (paintSnapshotRef.current) {
            historyManager.push(paintSnapshotRef.current);
            paintSnapshotRef.current = null;
          }
        }

        historyManager.push({
          tiles: lastTilesRef.current!,
          armies: lastArmiesRef.current!,
          factions: lastFactionsRef.current!,
        });

        lastTilesRef.current = tiles;
        lastArmiesRef.current = armies;
        lastFactionsRef.current = factions;
        lastTerrainConfigRef.current = terrainConfig;

        saveMapData(currentId, { tiles, armies, factions, terrainConfig });
      }
    });

    return () => {
      // Clear pending debounced paint save on unmount / map change
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      paintSnapshotRef.current = null;
      unsubscribe();
    };
  }, [dispatch, mapId]);

  useEffect(() => {
    if (mapId !== null) return;

    const cleanTiles = store.getState().tiles;
    const cleanArmies = store.getState().armies;
    const cleanFactions = store.getState().factions;
    const cleanTerrainConfig = store.getState().terrainConfig;

    let unsubscribe: (() => void) | undefined;
    unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (
        state.tiles === cleanTiles &&
        state.armies === cleanArmies &&
        state.factions === cleanFactions &&
        state.terrainConfig === cleanTerrainConfig
      )
        return;
      if (state.currentMap.name === '') return;

      if (unsubscribe) unsubscribe();
      justSavedPendingRef.current = true;
      const name = state.currentMap.name;
      const map = createMap(name);
      saveMapData(map.id, {
        tiles: state.tiles,
        armies: state.armies,
        factions: state.factions,
        terrainConfig: state.terrainConfig,
      });
      dispatch(loadMap({ id: map.id, name }));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch, mapId]);
};

export default useLocalStorageSync;

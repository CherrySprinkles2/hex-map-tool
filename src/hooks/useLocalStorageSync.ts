import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../app/hooks';
import { useSelector } from 'react-redux';
import { store } from '../app/store';
import type { RootState } from '../app/store';
import { importTiles } from '../features/tiles/tilesSlice';
import { importArmies } from '../features/armies/armiesSlice';
import { importFactions } from '../features/factions/factionsSlice';
import {
  importTerrainConfig,
  DEFAULT_TERRAIN_CONFIG,
} from '../features/terrainConfig/terrainConfigSlice';
import { loadMap, setOrientation } from '../features/currentMap/currentMapSlice';
import { saveMapData, loadMapData, createMap } from '../utils/mapsStorage';
import { captureThumbnail } from '../utils/captureThumbnail';
import * as historyManager from '../utils/historyManager';
import type { TilesState, ArmiesState, FactionsState, TerrainConfigState } from '../types/state';
import type { HexOrientation } from '../types/domain';
import type { HistorySnapshot } from '../types/history';
import type { ThumbnailWorkerRequest, ThumbnailWorkerResponse } from '../utils/thumbnailWorker';

const PAINT_SAVE_DEBOUNCE_MS = 500;

/**
 * Call before dispatching loadMap() when the caller has already loaded and
 * dispatched all map data (tiles, armies, factions, terrainConfig). This
 * prevents useLocalStorageSync from redundantly re-loading from localStorage.
 */
let _skipNextLoad = false;
export const skipNextSyncLoad = (): void => {
  _skipNextLoad = true;
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
  const lastOrientationRef = useRef<HexOrientation>('pointy-top');
  const lastThumbnailRef = useRef<string | undefined>(undefined);
  // Captured before-stroke snapshot; flushed as a single history entry after debounce
  const paintSnapshotRef = useRef<HistorySnapshot | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbnailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Worker refs — created once for the lifetime of the hook.
  const thumbnailWorkerRef = useRef<Worker | null>(null);
  const thumbnailRequestIdRef = useRef(0);
  // Tracks which mapId the latest in-flight worker request belongs to.
  const pendingThumbnailRef = useRef<{ id: number; mapId: string } | null>(null);

  // Create the worker once on mount; terminate on unmount.
  useEffect(() => {
    const worker = new Worker(new URL('../utils/thumbnailWorker.ts', import.meta.url), {
      type: 'module',
    });
    thumbnailWorkerRef.current = worker;

    worker.onmessage = ({ data }: MessageEvent<ThumbnailWorkerResponse>) => {
      const pending = pendingThumbnailRef.current;
      // Ignore stale responses if a newer request has been sent.
      if (!pending || pending.id !== data.id) return;
      pendingThumbnailRef.current = null;

      if (!data.arrayBuffer) return;

      const blob = new Blob([data.arrayBuffer], { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        lastThumbnailRef.current = dataUrl;
        if (store.getState().currentMap.id !== pending.mapId) return;
        saveMapData(pending.mapId, {
          tiles: lastTilesRef.current!,
          armies: lastArmiesRef.current!,
          factions: lastFactionsRef.current!,
          terrainConfig: lastTerrainConfigRef.current ?? DEFAULT_TERRAIN_CONFIG,
          thumbnail: dataUrl,
          orientation: lastOrientationRef.current,
        });
      };
      reader.readAsDataURL(blob);
    };

    return () => {
      worker.terminate();
      thumbnailWorkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    historyManager.clearHistory();
  }, [mapId]);

  useEffect(() => {
    if (!mapId) return;

    if (justSavedPendingRef.current) {
      justSavedPendingRef.current = false;
    } else if (_skipNextLoad) {
      // Data was already loaded by the caller (e.g. handleOpen) — skip redundant re-load
      _skipNextLoad = false;
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
        dispatch(setOrientation(saved.orientation ?? 'pointy-top'));
      } else {
        dispatch(importTiles({}));
        dispatch(importArmies({}));
        dispatch(importFactions([]));
        dispatch(importTerrainConfig(DEFAULT_TERRAIN_CONFIG));
        dispatch(setOrientation('pointy-top'));
      }
    }

    const initial = store.getState();
    lastTilesRef.current = initial.tiles;
    lastArmiesRef.current = initial.armies;
    lastFactionsRef.current = initial.factions;
    lastTerrainConfigRef.current = initial.terrainConfig;
    lastOrientationRef.current = initial.currentMap.orientation ?? 'pointy-top';
    lastThumbnailRef.current = loadMapData(mapId)?.thumbnail;

    // Posts to the thumbnail worker. Saves immediately with the stale thumbnail;
    // the worker responds async and re-saves with the fresh one.
    const requestThumbnailUpdate = (currentId: string): void => {
      const id = ++thumbnailRequestIdRef.current;
      pendingThumbnailRef.current = { id, mapId: currentId };
      thumbnailWorkerRef.current?.postMessage({
        id,
        tiles: lastTilesRef.current!,
        customTerrains: (lastTerrainConfigRef.current ?? DEFAULT_TERRAIN_CONFIG).custom,
        orientation: lastOrientationRef.current,
      } satisfies ThumbnailWorkerRequest);
    };

    const unsubscribe = store.subscribe(() => {
      const currentId = store.getState().currentMap.id;
      if (!currentId) return;

      const { tiles, armies, factions, ui, terrainConfig, currentMap } = store.getState();
      const orientation = currentMap.orientation ?? 'pointy-top';

      const tilesChanged = tiles !== lastTilesRef.current;
      const armiesChanged = armies !== lastArmiesRef.current;
      const factionsChanged = factions !== lastFactionsRef.current;
      const terrainConfigChanged = terrainConfig !== lastTerrainConfigRef.current;
      const orientationChanged = orientation !== lastOrientationRef.current;

      if (
        !tilesChanged &&
        !armiesChanged &&
        !factionsChanged &&
        !terrainConfigChanged &&
        !orientationChanged
      )
        return;

      // Orientation-only change: save immediately without debounce or history entry
      if (
        orientationChanged &&
        !tilesChanged &&
        !armiesChanged &&
        !factionsChanged &&
        !terrainConfigChanged
      ) {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
          if (paintSnapshotRef.current) {
            historyManager.push(paintSnapshotRef.current);
            paintSnapshotRef.current = null;
          }
        }
        lastOrientationRef.current = orientation;
        saveMapData(currentId, {
          tiles: (lastTilesRef.current ?? {}) as TilesState,
          armies: (lastArmiesRef.current ?? {}) as ArmiesState,
          factions: (lastFactionsRef.current ?? []) as FactionsState,
          terrainConfig: lastTerrainConfigRef.current ?? DEFAULT_TERRAIN_CONFIG,
          thumbnail: lastThumbnailRef.current,
          orientation,
        });
        requestThumbnailUpdate(currentId);
        return;
      }

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
        lastOrientationRef.current = orientation;

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
            thumbnail: lastThumbnailRef.current,
            orientation: lastOrientationRef.current,
          });
          requestThumbnailUpdate(currentId);
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
        lastOrientationRef.current = orientation;

        // Save immediately with the last known thumbnail so the main thread is not blocked.
        saveMapData(currentId, {
          tiles,
          armies,
          factions,
          terrainConfig,
          thumbnail: lastThumbnailRef.current,
          orientation,
        });

        // Debounce the worker call so rapid tile placement sends one request, not one per tile.
        if (thumbnailTimerRef.current) clearTimeout(thumbnailTimerRef.current);
        thumbnailTimerRef.current = setTimeout(() => {
          thumbnailTimerRef.current = null;
          if (store.getState().currentMap.id !== currentId) return;
          requestThumbnailUpdate(currentId);
        }, 800);
      }
    });

    return () => {
      // Clear pending debounced saves on unmount / map change
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (thumbnailTimerRef.current) {
        clearTimeout(thumbnailTimerRef.current);
        thumbnailTimerRef.current = null;
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
      if (state.currentMap.id !== null) return;
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
      // Synchronous capture is acceptable here — fires only once when a new map is first saved.
      const thumbnail = captureThumbnail(state.tiles, state.terrainConfig.custom);
      saveMapData(map.id, {
        tiles: state.tiles,
        armies: state.armies,
        factions: state.factions,
        terrainConfig: state.terrainConfig,
        thumbnail,
        orientation: state.currentMap.orientation ?? 'pointy-top',
      });
      dispatch(loadMap({ id: map.id, name }));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch, mapId]);
};

export default useLocalStorageSync;

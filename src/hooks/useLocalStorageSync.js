import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../app/store';
import { importTiles } from '../features/tiles/tilesSlice';
import { loadMap } from '../features/currentMap/currentMapSlice';
import { saveMapTiles, loadMapTiles, createMap } from '../utils/mapsStorage';

// Load tiles for the current map on mount, then auto-save on every store change.
const useLocalStorageSync = () => {
  const dispatch = useDispatch();
  const mapId = useSelector((state) => state.currentMap.id);

  // Tracks whether the previous render cycle just created a persistent map from
  // a pending example — used to skip the redundant importTiles reload below.
  const justSavedPendingRef = useRef(false);

  // ── Effect 1: load + auto-save for maps that already have a persistent id ───
  useEffect(() => {
    if (!mapId) return;

    if (justSavedPendingRef.current) {
      // Tiles are already correct in Redux; skip reloading from localStorage.
      justSavedPendingRef.current = false;
    } else {
      const saved = loadMapTiles(mapId);
      if (saved) {
        try {
          dispatch(importTiles(saved));
        } catch {
          // corrupted — start fresh
        }
      } else {
        // New map: reset to empty tiles
        dispatch(importTiles({}));
      }
    }

    const unsubscribe = store.subscribe(() => {
      const currentId = store.getState().currentMap.id;
      if (!currentId) return;
      const tiles = store.getState().tiles;
      saveMapTiles(currentId, tiles);
    });

    return unsubscribe;
  }, [dispatch, mapId]);

  // ── Effect 2: lazy-save for pending example maps (id === null) ───────────────
  // When the user opens an example, id is null and tiles are pre-loaded in Redux.
  // We wait for the first real tile change, then create a persistent copy.
  // Guard: if currentMap.name is empty the user is navigating away (unloadMap
  // has fired), so we skip the save rather than creating a blank copy.
  useEffect(() => {
    if (mapId !== null) return;

    const cleanTiles = store.getState().tiles;

    let unsubscribe;
    unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.tiles === cleanTiles) return;           // no tile change yet
      if (state.currentMap.name === '') return;         // navigating away — don't save

      unsubscribe(); // stop watching before dispatching to avoid re-entry
      justSavedPendingRef.current = true;
      const name = state.currentMap.name;
      const map = createMap(name);
      saveMapTiles(map.id, state.tiles);
      dispatch(loadMap({ id: map.id, name }));
      // Effect 1 re-runs with the new id and takes over auto-saving from here.
    });

    return () => unsubscribe();
  }, [dispatch, mapId]);
};

export default useLocalStorageSync;

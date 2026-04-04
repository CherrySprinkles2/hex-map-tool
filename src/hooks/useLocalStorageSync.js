import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../app/store';
import { importTiles } from '../features/tiles/tilesSlice';
import { importArmies } from '../features/armies/armiesSlice';
import { loadMap } from '../features/currentMap/currentMapSlice';
import { saveMapTiles, loadMapTiles, saveMapArmies, loadMapArmies, createMap } from '../utils/mapsStorage';

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
      // Tiles and armies are already correct in Redux; skip reloading from localStorage.
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
        dispatch(importTiles({}));
      }

      const savedArmies = loadMapArmies(mapId);
      dispatch(importArmies(savedArmies ?? {}));
    }

    const unsubscribe = store.subscribe(() => {
      const currentId = store.getState().currentMap.id;
      if (!currentId) return;
      const { tiles, armies } = store.getState();
      saveMapTiles(currentId, tiles);
      saveMapArmies(currentId, armies);
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

    const cleanTiles  = store.getState().tiles;
    const cleanArmies = store.getState().armies;

    let unsubscribe;
    unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.tiles === cleanTiles && state.armies === cleanArmies) return;
      if (state.currentMap.name === '') return;

      unsubscribe();
      justSavedPendingRef.current = true;
      const name = state.currentMap.name;
      const map = createMap(name);
      saveMapTiles(map.id, state.tiles);
      saveMapArmies(map.id, state.armies);
      dispatch(loadMap({ id: map.id, name }));
    });

    return () => unsubscribe();
  }, [dispatch, mapId]);
};

export default useLocalStorageSync;

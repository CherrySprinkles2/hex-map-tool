import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../app/store';
import { importTiles } from '../features/tiles/tilesSlice';
import { importArmies } from '../features/armies/armiesSlice';
import { importFactions } from '../features/factions/factionsSlice';
import { loadMap } from '../features/currentMap/currentMapSlice';
import { saveMapData, loadMapData, createMap } from '../utils/mapsStorage';
import * as historyManager from '../utils/historyManager';

// Load map data for the current map on mount, then auto-save on every store change.
// Only writes to localStorage when tiles, armies or factions have actually changed
// (reference comparison) — viewport/UI changes do not trigger a write.
const useLocalStorageSync = () => {
  const dispatch = useDispatch();
  const mapId = useSelector((state) => {
    return state.currentMap.id;
  });

  // Tracks whether the previous render cycle just created a persistent map from
  // a pending example — used to skip the redundant importTiles reload below.
  const justSavedPendingRef = useRef(false);

  // Reference cache: skip writes when these slices haven't changed
  const lastTilesRef = useRef(null);
  const lastArmiesRef = useRef(null);
  const lastFactionsRef = useRef(null);

  // Clear history whenever we switch to a new map — undo shouldn't cross map boundaries
  useEffect(() => {
    historyManager.clearHistory();
  }, [mapId]);

  // ── Effect 1: load + auto-save for maps that already have a persistent id ───
  useEffect(() => {
    if (!mapId) return;

    if (justSavedPendingRef.current) {
      // Tiles and armies are already correct in Redux; skip reloading from localStorage.
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
      } else {
        dispatch(importTiles({}));
        dispatch(importArmies({}));
        dispatch(importFactions([]));
      }
    }

    // Seed refs so the first subscriber tick doesn't trigger a redundant write
    const initial = store.getState();
    lastTilesRef.current = initial.tiles;
    lastArmiesRef.current = initial.armies;
    lastFactionsRef.current = initial.factions;

    const unsubscribe = store.subscribe(() => {
      const currentId = store.getState().currentMap.id;
      if (!currentId) return;

      const { tiles, armies, factions } = store.getState();

      const tilesChanged = tiles !== lastTilesRef.current;
      const armiesChanged = armies !== lastArmiesRef.current;
      const factionsChanged = factions !== lastFactionsRef.current;

      if (!tilesChanged && !armiesChanged && !factionsChanged) return;

      // Push the OLD state to history before overwriting refs
      historyManager.push({
        tiles: lastTilesRef.current,
        armies: lastArmiesRef.current,
        factions: lastFactionsRef.current,
      });

      lastTilesRef.current = tiles;
      lastArmiesRef.current = armies;
      lastFactionsRef.current = factions;

      saveMapData(currentId, { tiles, armies, factions });
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
    const cleanArmies = store.getState().armies;
    const cleanFactions = store.getState().factions;

    let unsubscribe;
    unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (
        state.tiles === cleanTiles &&
        state.armies === cleanArmies &&
        state.factions === cleanFactions
      )
        return;
      if (state.currentMap.name === '') return;

      unsubscribe();
      justSavedPendingRef.current = true;
      const name = state.currentMap.name;
      const map = createMap(name);
      saveMapData(map.id, { tiles: state.tiles, armies: state.armies, factions: state.factions });
      dispatch(loadMap({ id: map.id, name }));
    });

    return () => {
      return unsubscribe();
    };
  }, [dispatch, mapId]);
};

export default useLocalStorageSync;

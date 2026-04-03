import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../app/store';
import { importTiles } from '../features/tiles/tilesSlice';
import { saveMapTiles, loadMapTiles } from '../utils/mapsStorage';

// Load tiles for the current map on mount, then auto-save on every store change.
const useLocalStorageSync = () => {
  const dispatch = useDispatch();
  const mapId = useSelector((state) => state.currentMap.id);

  useEffect(() => {
    if (!mapId) return;

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

    const unsubscribe = store.subscribe(() => {
      const currentId = store.getState().currentMap.id;
      if (!currentId) return;
      const tiles = store.getState().tiles;
      saveMapTiles(currentId, tiles);
    });

    return unsubscribe;
  }, [dispatch, mapId]);
};

export default useLocalStorageSync;

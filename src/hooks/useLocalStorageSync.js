import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { store } from '../app/store';
import { importTiles } from '../features/tiles/tilesSlice';

const STORAGE_KEY = 'hex-map-tool-tiles';

// Load tiles from localStorage on mount, then sync every store change
const useLocalStorageSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        dispatch(importTiles(JSON.parse(saved)));
      } catch {
        // corrupted data — ignore and start fresh
      }
    }

    const unsubscribe = store.subscribe(() => {
      const tiles = store.getState().tiles;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
    });

    return unsubscribe;
  }, [dispatch]);
};

export default useLocalStorageSync;

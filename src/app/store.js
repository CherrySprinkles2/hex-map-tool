import { configureStore } from '@reduxjs/toolkit';
import tilesReducer from '../features/tiles/tilesSlice';
import viewportReducer from '../features/viewport/viewportSlice';
import uiReducer from '../features/ui/uiSlice';
import currentMapReducer from '../features/currentMap/currentMapSlice';

export const store = configureStore({
  reducer: {
    tiles: tilesReducer,
    viewport: viewportReducer,
    ui: uiReducer,
    currentMap: currentMapReducer,
  },
});

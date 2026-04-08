import { configureStore } from '@reduxjs/toolkit';
import tilesReducer from '../features/tiles/tilesSlice';
import armiesReducer from '../features/armies/armiesSlice';
import factionsReducer from '../features/factions/factionsSlice';
import viewportReducer from '../features/viewport/viewportSlice';
import uiReducer from '../features/ui/uiSlice';
import currentMapReducer from '../features/currentMap/currentMapSlice';
import terrainConfigReducer from '../features/terrainConfig/terrainConfigSlice';

const store = configureStore({
  reducer: {
    tiles: tilesReducer,
    armies: armiesReducer,
    factions: factionsReducer,
    viewport: viewportReducer,
    ui: uiReducer,
    currentMap: currentMapReducer,
    terrainConfig: terrainConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { store };
export default store;

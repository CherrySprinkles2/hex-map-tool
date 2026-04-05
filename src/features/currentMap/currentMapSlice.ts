import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CurrentMapState } from '../../types/state';

const currentMapSlice = createSlice({
  name: 'currentMap',
  initialState: {
    id: null,
    name: '',
  } as CurrentMapState,
  reducers: {
    loadMap: (state, action: PayloadAction<{ id: string | null; name: string }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
    },
    renameCurrentMap: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    unloadMap: (state) => {
      state.id = null;
      state.name = '';
    },
  },
});

export const { loadMap, renameCurrentMap, unloadMap } = currentMapSlice.actions;
export default currentMapSlice.reducer;

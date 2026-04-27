import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CurrentMapState } from '../../types/state';
import type { HexOrientation } from '../../types/domain';

const currentMapSlice = createSlice({
  name: 'currentMap',
  initialState: {
    id: null,
    name: '',
    orientation: 'pointy-top',
  } as CurrentMapState,
  reducers: {
    loadMap: (
      state,
      action: PayloadAction<{ id: string | null; name: string; orientation?: HexOrientation }>
    ) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.orientation = action.payload.orientation ?? 'pointy-top';
    },
    renameCurrentMap: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    unloadMap: (state) => {
      state.id = null;
      state.name = '';
      state.orientation = 'pointy-top';
    },
    setOrientation: (state, action: PayloadAction<HexOrientation>) => {
      state.orientation = action.payload;
    },
  },
});

export const { loadMap, renameCurrentMap, unloadMap, setOrientation } = currentMapSlice.actions;
export default currentMapSlice.reducer;

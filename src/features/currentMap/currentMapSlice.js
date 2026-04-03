import { createSlice } from '@reduxjs/toolkit';

const currentMapSlice = createSlice({
  name: 'currentMap',
  initialState: {
    id: null,
    name: '',
  },
  reducers: {
    loadMap: (state, action) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
    },
    renameCurrentMap: (state, action) => {
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

import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedTile: null, // coordKey string or null
  },
  reducers: {
    selectTile: (state, action) => {
      state.selectedTile = action.payload;
    },
    deselectTile: (state) => {
      state.selectedTile = null;
    },
  },
});

export const { selectTile, deselectTile } = uiSlice.actions;
export default uiSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedTile: null,
    screen: 'home',
  },
  reducers: {
    selectTile: (state, action) => {
      state.selectedTile = action.payload;
    },
    deselectTile: (state) => {
      state.selectedTile = null;
    },
    setScreen: (state, action) => {
      state.screen = action.payload;
    },
  },
});

export const { selectTile, deselectTile, setScreen } = uiSlice.actions;
export default uiSlice.reducer;

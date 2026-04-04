import { createSlice } from '@reduxjs/toolkit';

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 4;

const initialState = {
  x: 0,
  y: 0,
  scale: 1,
};

const viewportSlice = createSlice({
  name: 'viewport',
  initialState,
  reducers: {
    // Directly set all three viewport values; used by HexGrid to commit pan/zoom
    // to Redux after the interaction ends (bypassing React during the hot path).
    setViewport: (state, { payload: { x, y, scale } }) => {
      state.x = x;
      state.y = y;
      state.scale = scale;
    },
    resetViewport: () => {
      return initialState;
    },
  },
});

export const { setViewport, resetViewport } = viewportSlice.actions;
export default viewportSlice.reducer;

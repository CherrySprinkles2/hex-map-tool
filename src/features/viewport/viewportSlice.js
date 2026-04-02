import { createSlice } from '@reduxjs/toolkit';

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

const initialState = {
  x: 0,
  y: 0,
  scale: 1,
};

const viewportSlice = createSlice({
  name: 'viewport',
  initialState,
  reducers: {
    pan: (state, action) => {
      state.x += action.payload.dx;
      state.y += action.payload.dy;
    },
    zoom: (state, action) => {
      const { delta, focalX, focalY } = action.payload;
      const factor = delta < 0 ? 1.1 : 0.9;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * factor));
      // Adjust translation so zoom is centred on the focal point
      state.x = focalX - (focalX - state.x) * (newScale / state.scale);
      state.y = focalY - (focalY - state.y) * (newScale / state.scale);
      state.scale = newScale;
    },
    resetViewport: () => initialState,
  },
});

export const { pan, zoom, resetViewport } = viewportSlice.actions;
export default viewportSlice.reducer;

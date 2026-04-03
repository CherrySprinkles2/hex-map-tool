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
      const { delta, focalX, focalY, svgWidth, svgHeight } = action.payload;
      const factor = delta < 0 ? 1.1 : 0.9;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * factor));
      // The SVG transform is translate(svgWidth/2 + x, svgHeight/2 + y) scale(scale).
      // To zoom centred on the cursor, we solve for x/y such that the world point
      // under the cursor stays fixed in screen space.
      const tx = svgWidth / 2 + state.x;
      const ty = svgHeight / 2 + state.y;
      const wx = (focalX - tx) / state.scale;
      const wy = (focalY - ty) / state.scale;
      state.x = focalX - svgWidth / 2 - wx * newScale;
      state.y = focalY - svgHeight / 2 - wy * newScale;
      state.scale = newScale;
    },
    pinchZoom: (state, action) => {
      const { ratio, focalX, focalY, svgWidth, svgHeight } = action.payload;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * ratio));
      const tx = svgWidth / 2 + state.x;
      const ty = svgHeight / 2 + state.y;
      const wx = (focalX - tx) / state.scale;
      const wy = (focalY - ty) / state.scale;
      state.x = focalX - svgWidth / 2 - wx * newScale;
      state.y = focalY - svgHeight / 2 - wy * newScale;
      state.scale = newScale;
    },
    resetViewport: () => initialState,
  },
});

export const { pan, zoom, pinchZoom, resetViewport } = viewportSlice.actions;
export default viewportSlice.reducer;

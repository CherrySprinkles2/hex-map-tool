import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ViewportState } from '../../types/state';

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 4;

const initialState: ViewportState = {
  x: 0,
  y: 0,
  scale: 1,
};

const viewportSlice = createSlice({
  name: 'viewport',
  initialState,
  reducers: {
    setViewport: (state, { payload: { x, y, scale } }: PayloadAction<ViewportState>) => {
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

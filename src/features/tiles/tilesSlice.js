import { createSlice } from '@reduxjs/toolkit';
import { toKey } from '../../components/HexGrid/HexUtils';

const initialState = {
  // keyed by "q,r"
  [toKey(0, 0)]: { q: 0, r: 0, terrain: 'plain' },
};

const tilesSlice = createSlice({
  name: 'tiles',
  initialState,
  reducers: {
    addTile: (state, action) => {
      const { q, r, terrain = 'plain' } = action.payload;
      const key = toKey(q, r);
      if (!state[key]) {
        state[key] = { q, r, terrain };
      }
    },
    updateTile: (state, action) => {
      const { q, r, terrain } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].terrain = terrain;
      }
    },
    deleteTile: (state, action) => {
      const { q, r } = action.payload;
      delete state[toKey(q, r)];
    },
    importTiles: (_state, action) => {
      return action.payload;
    },
  },
});

export const { addTile, updateTile, deleteTile, importTiles } = tilesSlice.actions;
export default tilesSlice.reducer;

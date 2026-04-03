import { createSlice } from '@reduxjs/toolkit';
import { toKey } from '../../components/HexGrid/HexUtils';

const initialState = {
  [toKey(0, 0)]: { q: 0, r: 0, terrain: 'grass', hasRiver: false, hasRoad: false },
};

const tilesSlice = createSlice({
  name: 'tiles',
  initialState,
  reducers: {
    addTile: (state, action) => {
      const { q, r, terrain = 'grass', hasRiver = false, hasRoad = false } = action.payload;
      const key = toKey(q, r);
      if (!state[key]) {
        state[key] = { q, r, terrain, hasRiver, hasRoad };
      }
    },
    updateTile: (state, action) => {
      const { q, r, terrain } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].terrain = terrain;
      }
    },
    toggleTileFlag: (state, action) => {
      const { q, r, flag } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key][flag] = !state[key][flag];
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

export const { addTile, updateTile, toggleTileFlag, deleteTile, importTiles } = tilesSlice.actions;
export default tilesSlice.reducer;

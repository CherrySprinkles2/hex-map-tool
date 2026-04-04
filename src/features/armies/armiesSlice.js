import { createSlice } from '@reduxjs/toolkit';

const generateId = () => `army-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const armiesSlice = createSlice({
  name: 'armies',
  initialState: {},
  reducers: {
    addArmy: (state, action) => {
      const { q, r } = action.payload;
      const id = generateId();
      state[id] = { id, q, r, name: 'New Army', composition: '' };
    },
    deleteArmy: (state, action) => {
      delete state[action.payload];
    },
    moveArmy: (state, action) => {
      const { id, q, r } = action.payload;
      if (state[id]) {
        state[id].q = q;
        state[id].r = r;
      }
    },
    updateArmy: (state, action) => {
      const { id, name, composition } = action.payload;
      if (state[id]) {
        if (name !== undefined) state[id].name = name;
        if (composition !== undefined) state[id].composition = composition;
      }
    },
    importArmies: (_state, action) => action.payload ?? {},
  },
});

export const { addArmy, deleteArmy, moveArmy, updateArmy, importArmies } = armiesSlice.actions;
export default armiesSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { generateId } from '../../utils/generateId';
import { restoreSnapshot } from '../history/historyActions';

const armiesSlice = createSlice({
  name: 'armies',
  initialState: {},
  reducers: {
    addArmy: (state, action) => {
      const { q, r } = action.payload;
      const id = generateId('army');
      state[id] = { id, q, r, name: 'New Army', composition: '', factionId: null };
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
      const { id, name, composition, factionId } = action.payload;
      if (state[id]) {
        if (name !== undefined) state[id].name = name;
        if (composition !== undefined) state[id].composition = composition;
        if (factionId !== undefined) state[id].factionId = factionId;
      }
    },
    setArmyFaction: (state, action) => {
      const { id, factionId } = action.payload;
      if (state[id]) state[id].factionId = factionId;
    },
    importArmies: (_state, action) => {
      return action.payload ?? {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreSnapshot, (_state, action) => {
      return action.payload.armies;
    });
  },
});

export const { addArmy, deleteArmy, moveArmy, updateArmy, setArmyFaction, importArmies } =
  armiesSlice.actions;
export default armiesSlice.reducer;

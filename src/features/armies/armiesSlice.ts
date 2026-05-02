import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '../../utils/generateId';
import { restoreSnapshot } from '../history/historyActions';
import type { Army } from '../../types/domain';
import type { ArmiesState } from '../../types/state';

const armiesSlice = createSlice({
  name: 'armies',
  initialState: {} as ArmiesState,
  reducers: {
    addArmy: (state, action: PayloadAction<{ q: number; r: number }>) => {
      const { q, r } = action.payload;
      const id = generateId('army');
      state[id] = { id, q, r, name: 'New Army', composition: '', notes: '', factionId: null };
    },
    deleteArmy: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
    moveArmy: (state, action: PayloadAction<{ id: string; q: number; r: number }>) => {
      const { id, q, r } = action.payload;
      if (state[id]) {
        state[id].q = q;
        state[id].r = r;
      }
    },
    updateArmy: (
      state,
      action: PayloadAction<
        Partial<Pick<Army, 'name' | 'composition' | 'factionId'>> & { id: string; notes?: string }
      >
    ) => {
      const { id, name, composition, notes, factionId } = action.payload;
      if (state[id]) {
        if (name !== undefined) state[id].name = name;
        if (composition !== undefined) state[id].composition = composition;
        if (notes !== undefined) state[id].notes = notes;
        if (factionId !== undefined) state[id].factionId = factionId;
      }
    },
    setArmyFaction: (state, action: PayloadAction<{ id: string; factionId: string | null }>) => {
      const { id, factionId } = action.payload;
      if (state[id]) state[id].factionId = factionId;
    },
    setArmySubTilePosition: (
      state,
      action: PayloadAction<{ id: string; subTileX: number; subTileY: number }>
    ) => {
      const { id, subTileX, subTileY } = action.payload;
      if (state[id]) {
        state[id].subTileX = subTileX;
        state[id].subTileY = subTileY;
      }
    },
    setArmyInsideTown: (state, action: PayloadAction<{ id: string; insideTown: boolean }>) => {
      const { id, insideTown } = action.payload;
      if (state[id]) state[id].insideTown = insideTown;
    },
    importArmies: (_state, action: PayloadAction<ArmiesState>) => {
      return action.payload ?? {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreSnapshot, (_state, action) => {
      return action.payload.armies;
    });
  },
});

export const {
  addArmy,
  deleteArmy,
  moveArmy,
  updateArmy,
  setArmyFaction,
  setArmySubTilePosition,
  setArmyInsideTown,
  importArmies,
} = armiesSlice.actions;
export default armiesSlice.reducer;

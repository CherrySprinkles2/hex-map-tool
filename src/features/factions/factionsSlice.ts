import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '../../utils/generateId';
import { restoreSnapshot } from '../history/historyActions';
import type { Faction } from '../../types/domain';
import type { FactionsState } from '../../types/state';

const factionsSlice = createSlice({
  name: 'factions',
  initialState: [] as FactionsState,
  reducers: {
    addFaction: (state, action: PayloadAction<{ color: string }>) => {
      const { color } = action.payload;
      state.push({ id: generateId('faction'), name: 'New Faction', color, description: '' });
    },
    deleteFaction: (_state, action: PayloadAction<string>) => {
      return _state.filter((f) => {
        return f.id !== action.payload;
      });
    },
    updateFaction: (state, action: PayloadAction<Partial<Faction> & { id: string }>) => {
      const { id, name, color, description } = action.payload;
      const faction = state.find((f) => {
        return f.id === id;
      });
      if (!faction) return;
      if (name !== undefined) faction.name = name;
      if (color !== undefined) faction.color = color;
      if (description !== undefined) faction.description = description;
    },
    importFactions: (_state, action: PayloadAction<FactionsState>) => {
      return action.payload ?? [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreSnapshot, (_state, action) => {
      return action.payload.factions;
    });
  },
});

export const { addFaction, deleteFaction, updateFaction, importFactions } = factionsSlice.actions;
export default factionsSlice.reducer;

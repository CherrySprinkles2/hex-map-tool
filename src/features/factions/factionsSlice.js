import { createSlice } from '@reduxjs/toolkit';
import { generateId } from '../../utils/generateId';
import { restoreSnapshot } from '../history/historyActions';

const factionsSlice = createSlice({
  name: 'factions',
  initialState: [],
  reducers: {
    addFaction: (state, action) => {
      const { color } = action.payload;
      state.push({ id: generateId('faction'), name: 'New Faction', color, description: '' });
    },
    deleteFaction: (state, action) => {
      return state.filter((f) => {
        return f.id !== action.payload;
      });
    },
    updateFaction: (state, action) => {
      const { id, name, color, description } = action.payload;
      const faction = state.find((f) => {
        return f.id === id;
      });
      if (!faction) return;
      if (name !== undefined) faction.name = name;
      if (color !== undefined) faction.color = color;
      if (description !== undefined) faction.description = description;
    },
    importFactions: (_state, action) => {
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

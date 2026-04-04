import { createSlice } from '@reduxjs/toolkit';

const generateId = () => `faction-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const factionsSlice = createSlice({
  name: 'factions',
  initialState: [],
  reducers: {
    addFaction: (state, action) => {
      const { color } = action.payload;
      state.push({ id: generateId(), name: 'New Faction', color, description: '' });
    },
    deleteFaction: (state, action) => {
      return state.filter((f) => f.id !== action.payload);
    },
    updateFaction: (state, action) => {
      const { id, name, color, description } = action.payload;
      const faction = state.find((f) => f.id === id);
      if (!faction) return;
      if (name        !== undefined) faction.name        = name;
      if (color       !== undefined) faction.color       = color;
      if (description !== undefined) faction.description = description;
    },
    importFactions: (_state, action) => action.payload ?? [],
  },
});

export const { addFaction, deleteFaction, updateFaction, importFactions } = factionsSlice.actions;
export default factionsSlice.reducer;

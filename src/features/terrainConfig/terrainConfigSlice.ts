import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TerrainConfig, CustomTerrainType } from '../../types/domain';

const DEFAULT_ORDER = ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'];

const initialState: TerrainConfig = {
  disabled: [],
  custom: [],
  order: DEFAULT_ORDER,
};

const terrainConfigSlice = createSlice({
  name: 'terrainConfig',
  initialState,
  reducers: {
    importTerrainConfig: (_state, action: PayloadAction<TerrainConfig>) => {
      return action.payload;
    },
    disableBuiltinTerrain: (state, action: PayloadAction<string>) => {
      if (!state.disabled.includes(action.payload)) {
        state.disabled.push(action.payload);
      }
    },
    enableBuiltinTerrain: (state, action: PayloadAction<string>) => {
      state.disabled = state.disabled.filter((id) => {
        return id !== action.payload;
      });
    },
    addCustomTerrain: (state, action: PayloadAction<CustomTerrainType>) => {
      state.custom.push(action.payload);
      state.order.push(action.payload.id);
    },
    updateCustomTerrain: (state, action: PayloadAction<CustomTerrainType>) => {
      const idx = state.custom.findIndex((ct) => {
        return ct.id === action.payload.id;
      });
      if (idx !== -1) {
        state.custom[idx] = action.payload;
      }
    },
    removeCustomTerrain: (state, action: PayloadAction<string>) => {
      state.custom = state.custom.filter((ct) => {
        return ct.id !== action.payload;
      });
      state.order = state.order.filter((id) => {
        return id !== action.payload;
      });
    },
    reorderTerrains: (state, action: PayloadAction<string[]>) => {
      state.order = action.payload;
    },
  },
});

export const {
  importTerrainConfig,
  disableBuiltinTerrain,
  enableBuiltinTerrain,
  addCustomTerrain,
  updateCustomTerrain,
  removeCustomTerrain,
  reorderTerrains,
} = terrainConfigSlice.actions;
export default terrainConfigSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TerrainConfig, CustomTerrainType, FeatureVariety } from '../../types/domain';

const DEFAULT_ORDER = ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'];

/** Reserved ids for the always-present base river/road styles. */
export const DEFAULT_RIVER_TYPE_ID = 'river-default';
export const DEFAULT_ROAD_TYPE_ID = 'road-default';

// Seeded defaults. Colour/width mirror theme.river / theme.road; the renderer
// reads these variety values at runtime (theme is only the final fallback), so
// editing the default entry recolours/resizes the base river/road.
const DEFAULT_RIVER_TYPE: FeatureVariety = {
  id: DEFAULT_RIVER_TYPE_ID,
  name: 'River',
  color: '#4499cc',
  width: 6,
};
const DEFAULT_ROAD_TYPE: FeatureVariety = {
  id: DEFAULT_ROAD_TYPE_ID,
  name: 'Road',
  color: '#8B7355',
  width: 3,
};

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  disabled: [],
  custom: [],
  order: DEFAULT_ORDER,
  riverTypes: [DEFAULT_RIVER_TYPE],
  roadTypes: [DEFAULT_ROAD_TYPE],
};

/**
 * Merge a possibly-partial (or legacy) terrainConfig onto the defaults, and
 * guarantee the reserved default river/road varieties are present. Called at
 * every import site (via the importTerrainConfig reducer) so maps saved before
 * river/road varieties existed still load with valid arrays.
 */
export const normalizeTerrainConfig = (cfg?: Partial<TerrainConfig> | null): TerrainConfig => {
  const riverTypes = cfg?.riverTypes ? [...cfg.riverTypes] : [];
  const roadTypes = cfg?.roadTypes ? [...cfg.roadTypes] : [];
  if (
    !riverTypes.some((v) => {
      return v.id === DEFAULT_RIVER_TYPE_ID;
    })
  ) {
    riverTypes.unshift({ ...DEFAULT_RIVER_TYPE });
  }
  if (
    !roadTypes.some((v) => {
      return v.id === DEFAULT_ROAD_TYPE_ID;
    })
  ) {
    roadTypes.unshift({ ...DEFAULT_ROAD_TYPE });
  }
  return {
    disabled: cfg?.disabled ?? [],
    custom: cfg?.custom ?? [],
    order: cfg?.order ?? [...DEFAULT_ORDER],
    riverTypes,
    roadTypes,
  };
};

const initialState: TerrainConfig = DEFAULT_TERRAIN_CONFIG;

const terrainConfigSlice = createSlice({
  name: 'terrainConfig',
  initialState,
  reducers: {
    importTerrainConfig: (_state, action: PayloadAction<Partial<TerrainConfig> | null>) => {
      return normalizeTerrainConfig(action.payload);
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
    addRiverType: (state, action: PayloadAction<FeatureVariety>) => {
      state.riverTypes.push(action.payload);
    },
    updateRiverType: (state, action: PayloadAction<FeatureVariety>) => {
      const idx = state.riverTypes.findIndex((v) => {
        return v.id === action.payload.id;
      });
      if (idx !== -1) state.riverTypes[idx] = action.payload;
    },
    removeRiverType: (state, action: PayloadAction<string>) => {
      if (action.payload === DEFAULT_RIVER_TYPE_ID) return; // default is protected
      state.riverTypes = state.riverTypes.filter((v) => {
        return v.id !== action.payload;
      });
    },
    addRoadType: (state, action: PayloadAction<FeatureVariety>) => {
      state.roadTypes.push(action.payload);
    },
    updateRoadType: (state, action: PayloadAction<FeatureVariety>) => {
      const idx = state.roadTypes.findIndex((v) => {
        return v.id === action.payload.id;
      });
      if (idx !== -1) state.roadTypes[idx] = action.payload;
    },
    removeRoadType: (state, action: PayloadAction<string>) => {
      if (action.payload === DEFAULT_ROAD_TYPE_ID) return; // default is protected
      state.roadTypes = state.roadTypes.filter((v) => {
        return v.id !== action.payload;
      });
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
  addRiverType,
  updateRiverType,
  removeRiverType,
  addRoadType,
  updateRoadType,
  removeRoadType,
} = terrainConfigSlice.actions;
export default terrainConfigSlice.reducer;

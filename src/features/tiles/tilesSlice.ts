import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toKey } from '../../utils/hexUtils';
import { deleteFaction } from '../factions/factionsSlice';
import { restoreSnapshot } from '../history/historyActions';
import type { Tile, TileFlag } from '../../types/domain';
import type { TilesState } from '../../types/state';

type BlockedFlagKey = 'hasRiver' | 'hasRoad' | 'hasTown';
type BlockedArrayKey = 'riverBlocked' | 'roadBlocked' | 'portBlocked';

const BLOCKED_KEY: Record<BlockedFlagKey, BlockedArrayKey> = {
  hasRiver: 'riverBlocked',
  hasRoad: 'roadBlocked',
  hasTown: 'portBlocked',
};

const ONE_SIDED = new Set<BlockedFlagKey>(['hasTown']);

const initialState: TilesState = {
  [toKey(0, 0)]: {
    q: 0,
    r: 0,
    terrain: 'grass',
    hasRiver: false,
    hasRoad: false,
    riverBlocked: [],
    roadBlocked: [],
    hasTown: false,
    townName: '',
    portBlocked: [],
    notes: '',
    factionId: null,
  },
};

const tilesSlice = createSlice({
  name: 'tiles',
  initialState,
  reducers: {
    addTile: (state, action: PayloadAction<Partial<Tile> & { q: number; r: number }>) => {
      const {
        q,
        r,
        terrain = 'grass',
        hasRiver = false,
        hasRoad = false,
        hasTown = false,
        townName = '',
        notes = '',
        factionId = null,
      } = action.payload;
      const key = toKey(q, r);
      if (!state[key]) {
        state[key] = {
          q,
          r,
          terrain,
          hasRiver,
          hasRoad,
          riverBlocked: [],
          roadBlocked: [],
          hasTown,
          townName,
          portBlocked: [],
          notes,
          factionId,
        };
      }
    },
    updateTile: (state, action: PayloadAction<{ q: number; r: number; terrain: string }>) => {
      const { q, r, terrain } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].terrain = terrain as Tile['terrain'];
      }
    },
    toggleTileFlag: (
      state,
      action: PayloadAction<{ q: number; r: number; flag: BlockedFlagKey }>
    ) => {
      const { q, r, flag } = action.payload;
      const key = toKey(q, r);
      if (!state[key]) return;
      const wasActive = state[key][flag];
      state[key][flag] = !wasActive;
      if (wasActive) {
        const blockedKey = BLOCKED_KEY[flag];
        (state[key][blockedKey] || []).forEach((nk) => {
          if (state[nk]?.[blockedKey]) {
            state[nk][blockedKey] = state[nk][blockedKey].filter((k) => {
              return k !== key;
            });
          }
        });
        state[key][blockedKey] = [];
      }
    },
    blockConnection: (
      state,
      action: PayloadAction<{
        q: number;
        r: number;
        flag: BlockedFlagKey;
        neighborKey: string;
      }>
    ) => {
      const { q, r, flag, neighborKey } = action.payload;
      const myKey = toKey(q, r);
      const blockedKey = BLOCKED_KEY[flag];
      if (state[myKey] && !(state[myKey][blockedKey] || []).includes(neighborKey)) {
        (state[myKey][blockedKey] = state[myKey][blockedKey] || []).push(neighborKey);
      }
      if (!ONE_SIDED.has(flag)) {
        if (state[neighborKey] && !(state[neighborKey][blockedKey] || []).includes(myKey)) {
          (state[neighborKey][blockedKey] = state[neighborKey][blockedKey] || []).push(myKey);
        }
      }
    },
    unblockConnection: (
      state,
      action: PayloadAction<{
        q: number;
        r: number;
        flag: BlockedFlagKey;
        neighborKey: string;
      }>
    ) => {
      const { q, r, flag, neighborKey } = action.payload;
      const myKey = toKey(q, r);
      const blockedKey = BLOCKED_KEY[flag];
      if (state[myKey]?.[blockedKey]) {
        state[myKey][blockedKey] = state[myKey][blockedKey].filter((k) => {
          return k !== neighborKey;
        });
      }
      if (!ONE_SIDED.has(flag) && state[neighborKey]?.[blockedKey]) {
        state[neighborKey][blockedKey] = state[neighborKey][blockedKey].filter((k) => {
          return k !== myKey;
        });
      }
    },
    setTownName: (state, action: PayloadAction<{ q: number; r: number; name: string }>) => {
      const { q, r, name } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].townName = name;
      }
    },
    setTileNotes: (state, action: PayloadAction<{ q: number; r: number; notes: string }>) => {
      const { q, r, notes } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].notes = notes;
      }
    },
    setTileFaction: (
      state,
      action: PayloadAction<{ q: number; r: number; factionId: string | null }>
    ) => {
      const { q, r, factionId } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].factionId = factionId ?? null;
      }
    },
    deleteTile: (state, action: PayloadAction<{ q: number; r: number }>) => {
      const { q, r } = action.payload;
      delete state[toKey(q, r)];
    },
    setTileFeature: (
      state,
      action: PayloadAction<{ q: number; r: number; flag: TileFlag; value: boolean }>
    ) => {
      const { q, r, flag, value } = action.payload;
      const key = toKey(q, r);
      if (!state[key]) return;
      state[key][flag] = value;
      if (!value && flag in BLOCKED_KEY) {
        const blockedKey = BLOCKED_KEY[flag as BlockedFlagKey];
        (state[key][blockedKey] || []).forEach((nk) => {
          if (state[nk]?.[blockedKey]) {
            state[nk][blockedKey] = state[nk][blockedKey].filter((k) => {
              return k !== key;
            });
          }
        });
        state[key][blockedKey] = [];
      }
    },
    importTiles: (_state, action: PayloadAction<TilesState>) => {
      return action.payload;
    },
    deleteTilesByTerrain: (state, action: PayloadAction<string>) => {
      const terrainId = action.payload;
      Object.keys(state).forEach((key) => {
        if (state[key].terrain === terrainId) {
          delete state[key];
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreSnapshot, (_state, action) => {
      return action.payload.tiles;
    });
    builder.addCase(deleteFaction, (state, action) => {
      const deletedId = action.payload;
      Object.values(state).forEach((tile) => {
        if (tile.factionId === deletedId) {
          tile.factionId = null;
        }
      });
    });
  },
});

export const {
  addTile,
  updateTile,
  toggleTileFlag,
  blockConnection,
  unblockConnection,
  setTownName,
  setTileNotes,
  setTileFaction,
  setTileFeature,
  deleteTile,
  importTiles,
  deleteTilesByTerrain,
} = tilesSlice.actions;
export default tilesSlice.reducer;

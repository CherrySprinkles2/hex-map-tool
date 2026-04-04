import { createSlice } from '@reduxjs/toolkit';
import { toKey } from '../../utils/hexUtils';
import { deleteFaction } from '../factions/factionsSlice';
import { restoreSnapshot } from '../history/historyActions';

// Maps a feature flag to its corresponding blocked-connections array key
const BLOCKED_KEY = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked', hasTown: 'portBlocked' };

// Flags whose block state is stored only on the "source" tile (not mirrored on the neighbor).
// hasTown: the port lives on the water tile but the block decision belongs to the town tile.
const ONE_SIDED = new Set(['hasTown']);

const initialState = {
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
    addTile: (state, action) => {
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
      if (!state[key]) return;
      const wasActive = state[key][flag];
      state[key][flag] = !wasActive;
      // When turning off, clear blocked connections so they auto-connect if re-enabled
      if (wasActive && BLOCKED_KEY[flag]) {
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
    blockConnection: (state, action) => {
      const { q, r, flag, neighborKey } = action.payload;
      const myKey = toKey(q, r);
      const blockedKey = BLOCKED_KEY[flag];
      if (!blockedKey) return;
      if (state[myKey] && !(state[myKey][blockedKey] || []).includes(neighborKey)) {
        (state[myKey][blockedKey] = state[myKey][blockedKey] || []).push(neighborKey);
      }
      // Symmetric flags also store the block on the neighbor tile
      if (!ONE_SIDED.has(flag)) {
        if (state[neighborKey] && !(state[neighborKey][blockedKey] || []).includes(myKey)) {
          (state[neighborKey][blockedKey] = state[neighborKey][blockedKey] || []).push(myKey);
        }
      }
    },
    unblockConnection: (state, action) => {
      const { q, r, flag, neighborKey } = action.payload;
      const myKey = toKey(q, r);
      const blockedKey = BLOCKED_KEY[flag];
      if (!blockedKey) return;
      if (state[myKey]?.[blockedKey]) {
        state[myKey][blockedKey] = state[myKey][blockedKey].filter((k) => {
          return k !== neighborKey;
        });
      }
      // Symmetric flags also remove the block from the neighbor tile
      if (!ONE_SIDED.has(flag) && state[neighborKey]?.[blockedKey]) {
        state[neighborKey][blockedKey] = state[neighborKey][blockedKey].filter((k) => {
          return k !== myKey;
        });
      }
    },
    setTownName: (state, action) => {
      const { q, r, name } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].townName = name;
      }
    },
    setTileNotes: (state, action) => {
      const { q, r, notes } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].notes = notes;
      }
    },
    setTileFaction: (state, action) => {
      const { q, r, factionId } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].factionId = factionId ?? null;
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
  extraReducers: (builder) => {
    builder.addCase(restoreSnapshot, (_state, action) => {
      return action.payload.tiles;
    });
    // When a faction is deleted, clear that factionId from all tiles that reference it
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
  deleteTile,
  importTiles,
} = tilesSlice.actions;
export default tilesSlice.reducer;

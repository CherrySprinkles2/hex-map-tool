import { createSlice } from '@reduxjs/toolkit';
import { toKey } from '../../components/HexGrid/HexUtils';

// Maps a feature flag to its corresponding blocked-connections array key
const BLOCKED_KEY = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked' };

const initialState = {
  [toKey(0, 0)]: { q: 0, r: 0, terrain: 'grass', hasRiver: false, hasRoad: false, riverBlocked: [], roadBlocked: [], hasTown: false, townName: '' },
};

const tilesSlice = createSlice({
  name: 'tiles',
  initialState,
  reducers: {
    addTile: (state, action) => {
      const { q, r, terrain = 'grass', hasRiver = false, hasRoad = false, hasTown = false, townName = '' } = action.payload;
      const key = toKey(q, r);
      if (!state[key]) {
        state[key] = { q, r, terrain, hasRiver, hasRoad, riverBlocked: [], roadBlocked: [], hasTown, townName };
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
            state[nk][blockedKey] = state[nk][blockedKey].filter((k) => k !== key);
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
      if (state[neighborKey] && !(state[neighborKey][blockedKey] || []).includes(myKey)) {
        (state[neighborKey][blockedKey] = state[neighborKey][blockedKey] || []).push(myKey);
      }
    },
    unblockConnection: (state, action) => {
      const { q, r, flag, neighborKey } = action.payload;
      const myKey = toKey(q, r);
      const blockedKey = BLOCKED_KEY[flag];
      if (!blockedKey) return;
      if (state[myKey]?.[blockedKey]) {
        state[myKey][blockedKey] = state[myKey][blockedKey].filter((k) => k !== neighborKey);
      }
      if (state[neighborKey]?.[blockedKey]) {
        state[neighborKey][blockedKey] = state[neighborKey][blockedKey].filter((k) => k !== myKey);
      }
    },
    setTownName: (state, action) => {
      const { q, r, name } = action.payload;
      const key = toKey(q, r);
      if (state[key]) {
        state[key].townName = name;
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
});

export const { addTile, updateTile, toggleTileFlag, blockConnection, unblockConnection, setTownName, deleteTile, importTiles } = tilesSlice.actions;
export default tilesSlice.reducer;

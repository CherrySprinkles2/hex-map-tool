import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedTile: null,
    screen: 'home',
    selectedArmyId: null,
    placingArmy: false,
    movingArmyId: null,
    factionsOpen: false,
    mapMode: 'terrain',
    activeFactionId: null,
    showShortcuts: false,
    activePaintBrush: null,
  },
  reducers: {
    selectTile: (state, action) => {
      state.selectedTile = action.payload;
      state.selectedArmyId = null;
      state.movingArmyId = null;
      state.factionsOpen = false;
    },
    deselectTile: (state) => {
      state.selectedTile = null;
    },
    setScreen: (state, action) => {
      state.screen = action.payload;
    },
    selectArmy: (state, action) => {
      state.selectedArmyId = action.payload;
      state.selectedTile = null;
      state.placingArmy = false;
    },
    deselectArmy: (state) => {
      state.selectedArmyId = null;
      state.movingArmyId = null;
    },
    setPlacingArmy: (state, action) => {
      state.placingArmy = action.payload;
      if (action.payload) {
        state.selectedTile = null;
        state.selectedArmyId = null;
        state.movingArmyId = null;
      }
    },
    startMovingArmy: (state, action) => {
      state.movingArmyId = action.payload;
    },
    stopMovingArmy: (state) => {
      state.movingArmyId = null;
    },
    toggleFactionsPanel: (state) => {
      state.factionsOpen = !state.factionsOpen;
      if (state.factionsOpen) {
        state.selectedTile = null;
      }
    },
    closeFactionsPanel: (state) => {
      state.factionsOpen = false;
    },
    setMapMode: (state, action) => {
      state.mapMode = action.payload;
      if (action.payload === 'faction') {
        state.factionsOpen = false;
      }
    },
    setActiveFaction: (state, action) => {
      state.activeFactionId = action.payload;
    },
    enterTerrainPaint: (state, action) => {
      state.mapMode = 'terrain-paint';
      state.activePaintBrush = action.payload ?? null;
    },
    exitTerrainPaint: (state) => {
      state.mapMode = 'terrain';
      state.activePaintBrush = null;
    },
    setActivePaintBrush: (state, action) => {
      state.activePaintBrush = action.payload;
    },
    openShortcuts: (state) => {
      state.showShortcuts = true;
    },
    closeShortcuts: (state) => {
      state.showShortcuts = false;
    },
  },
});

export const {
  selectTile,
  deselectTile,
  setScreen,
  selectArmy,
  deselectArmy,
  setPlacingArmy,
  startMovingArmy,
  stopMovingArmy,
  toggleFactionsPanel,
  closeFactionsPanel,
  setMapMode,
  setActiveFaction,
  enterTerrainPaint,
  exitTerrainPaint,
  setActivePaintBrush,
  openShortcuts,
  closeShortcuts,
} = uiSlice.actions;
export default uiSlice.reducer;

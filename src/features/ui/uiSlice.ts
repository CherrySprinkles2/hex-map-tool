import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UiState, MapMode, Screen } from '../../types/state';

const initialState: UiState = {
  selectedTile: null,
  screen: 'home',
  helpReturnScreen: 'home',
  selectedArmyId: null,
  placingArmy: false,
  movingArmyId: null,
  factionsOpen: false,
  mapMode: 'terrain',
  activeFactionId: null,
  showShortcuts: false,
  activePaintBrush: null,
  editingTownTile: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectTile: (state, action: PayloadAction<{ key: string; hasTown: boolean }>) => {
      state.selectedTile = action.payload.key;
      state.selectedArmyId = null;
      state.movingArmyId = null;
      state.factionsOpen = false;
      if (state.editingTownTile !== null) {
        // Keep the town panel open only if the newly selected tile also has a town.
        state.editingTownTile = action.payload.hasTown ? action.payload.key : null;
      }
    },
    deselectTile: (state) => {
      state.selectedTile = null;
      state.editingTownTile = null;
    },
    setScreen: (state, action: PayloadAction<Screen>) => {
      state.screen = action.payload;
    },
    selectArmy: (state, action: PayloadAction<string>) => {
      state.selectedArmyId = action.payload;
      state.selectedTile = null;
      state.placingArmy = false;
    },
    deselectArmy: (state) => {
      state.selectedArmyId = null;
      state.movingArmyId = null;
    },
    setPlacingArmy: (state, action: PayloadAction<boolean>) => {
      state.placingArmy = action.payload;
      if (action.payload) {
        state.selectedTile = null;
        state.selectedArmyId = null;
        state.movingArmyId = null;
      }
    },
    startMovingArmy: (state, action: PayloadAction<string>) => {
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
    setMapMode: (state, action: PayloadAction<MapMode>) => {
      state.mapMode = action.payload;
      if (action.payload === 'faction') {
        state.factionsOpen = false;
      }
    },
    setActiveFaction: (state, action: PayloadAction<string | null>) => {
      state.activeFactionId = action.payload;
    },
    enterTerrainPaint: (state, action: PayloadAction<string | null>) => {
      state.mapMode = 'terrain-paint';
      state.activePaintBrush = action.payload ?? null;
    },
    exitTerrainPaint: (state) => {
      state.mapMode = 'terrain';
      state.activePaintBrush = null;
    },
    setActivePaintBrush: (state, action: PayloadAction<string | null>) => {
      state.activePaintBrush = action.payload;
    },
    openShortcuts: (state) => {
      state.showShortcuts = true;
    },
    closeShortcuts: (state) => {
      state.showShortcuts = false;
    },
    enterTownEdit: (state, action: PayloadAction<string>) => {
      state.editingTownTile = action.payload;
    },
    exitTownEdit: (state) => {
      state.editingTownTile = null;
    },
    navigateToHelp: (state) => {
      state.helpReturnScreen = state.screen;
      state.screen = 'help';
    },
    navigateBackFromHelp: (state) => {
      state.screen = state.helpReturnScreen;
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
  enterTownEdit,
  exitTownEdit,
  navigateToHelp,
  navigateBackFromHelp,
} = uiSlice.actions;
export default uiSlice.reducer;

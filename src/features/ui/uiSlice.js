import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedTile: null,
    screen: 'home',
    selectedArmyId: null,
    placingArmy: false,
    movingArmyId: null,
  },
  reducers: {
    selectTile: (state, action) => {
      state.selectedTile = action.payload;
      state.selectedArmyId = null;
      state.movingArmyId = null;
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
  },
});

export const {
  selectTile, deselectTile, setScreen,
  selectArmy, deselectArmy, setPlacingArmy,
  startMovingArmy, stopMovingArmy,
} = uiSlice.actions;
export default uiSlice.reducer;

import { createAction } from '@reduxjs/toolkit';
import type { HistorySnapshot } from '../../types/history';

// Single action that all three data slices (tiles, armies, factions) handle via
// extraReducers. Dispatching this once triggers a single Redux notification
// instead of three, which keeps the useLocalStorageSync subscriber simple.
export const restoreSnapshot = createAction<HistorySnapshot>('history/restoreSnapshot');

// Snapshot-based undo / redo for tiles, armies and factions.
//
// Each entry in `past` and `future` is { tiles, armies, factions }.
// When `push()` is called by useLocalStorageSync on every data change,
// it records the PREVIOUS state (before the change was applied).
//
// Suppress mechanism: undo/redo dispatch a single restoreSnapshot action
// that triggers the subscriber once. That call must not create a history entry.
// `undo()` and `redo()` set the suppress flag; the next `push()` call clears it.

import type { HistorySnapshot } from '../types/history';

const MAX_HISTORY = 50;

let past: HistorySnapshot[] = [];
let future: HistorySnapshot[] = [];
let _suppress = false;

export const canUndo = (): boolean => {
  return past.length > 0;
};
export const canRedo = (): boolean => {
  return future.length > 0;
};

// Called by useLocalStorageSync before a data write, with the OLD (pre-change) state.
export const push = (snapshot: HistorySnapshot): void => {
  if (_suppress) {
    _suppress = false;
    return;
  }
  past.push(snapshot);
  if (past.length > MAX_HISTORY) past.shift();
  future = [];
};

// Returns the snapshot to restore (previous state), or null if nothing to undo.
// The caller should also pass `currentSnapshot` which is pushed to `future`.
export const undo = (currentSnapshot: HistorySnapshot): HistorySnapshot | null => {
  if (past.length === 0) return null;
  future.push(currentSnapshot);
  if (future.length > MAX_HISTORY) future.shift();
  _suppress = true;
  return past.pop() ?? null;
};

// Returns the snapshot to restore (next state), or null if nothing to redo.
export const redo = (currentSnapshot: HistorySnapshot): HistorySnapshot | null => {
  if (future.length === 0) return null;
  past.push(currentSnapshot);
  if (past.length > MAX_HISTORY) past.shift();
  _suppress = true;
  return future.pop() ?? null;
};

// Clear all history — call when switching maps so undo doesn't cross boundaries.
export const clearHistory = (): void => {
  past = [];
  future = [];
  _suppress = false;
};

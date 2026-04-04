import { useEffect, useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { deselectTile, deselectArmy } from '../features/ui/uiSlice';
import { deleteTile } from '../features/tiles/tilesSlice';
import { resetViewport } from '../features/viewport/viewportSlice';
import { restoreSnapshot } from '../features/history/historyActions';
import * as historyManager from '../utils/historyManager';

const useKeyboardShortcuts = () => {
  const dispatch = useDispatch();
  const store = useStore();

  const handleKeyDown = useCallback(
    (e) => {
      // Don't fire shortcuts when focused on an input / textarea
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Escape — deselect tile and army, cancel move mode
      if (e.key === 'Escape') {
        dispatch(deselectTile());
        dispatch(deselectArmy());
        return;
      }

      // Delete — remove the currently selected tile
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedTile } = store.getState().ui;
        if (selectedTile) {
          const [q, r] = selectedTile.split(',').map(Number);
          dispatch(deselectTile());
          dispatch(deleteTile({ q, r }));
        }
        return;
      }

      // R — reset viewport to origin
      if (!ctrl && e.key === 'r') {
        dispatch(resetViewport());
        return;
      }

      // Ctrl+Z — undo
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const state = store.getState();
        const current = { tiles: state.tiles, armies: state.armies, factions: state.factions };
        const prev = historyManager.undo(current);
        if (prev) dispatch(restoreSnapshot(prev));
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z — redo
      if (
        ctrl &&
        (e.key === 'y' || (e.shiftKey && e.key === 'z') || (e.shiftKey && e.key === 'Z'))
      ) {
        e.preventDefault();
        const state = store.getState();
        const current = { tiles: state.tiles, armies: state.armies, factions: state.factions };
        const next = historyManager.redo(current);
        if (next) dispatch(restoreSnapshot(next));
      }
    },
    [dispatch, store]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;

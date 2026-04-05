import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppStore } from '../app/hooks';
import { deselectTile, deselectArmy } from '../features/ui/uiSlice';
import { deleteTile } from '../features/tiles/tilesSlice';
import { resetViewport } from '../features/viewport/viewportSlice';
import { restoreSnapshot } from '../features/history/historyActions';
import * as historyManager from '../utils/historyManager';

const useKeyboardShortcuts = (): void => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape') {
        dispatch(deselectTile());
        dispatch(deselectArmy());
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedTile } = store.getState().ui;
        if (selectedTile) {
          const [q, r] = selectedTile.split(',').map(Number);
          dispatch(deselectTile());
          dispatch(deleteTile({ q, r }));
        }
        return;
      }

      if (!ctrl && e.key === 'r') {
        dispatch(resetViewport());
        return;
      }

      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        const state = store.getState();
        const current = { tiles: state.tiles, armies: state.armies, factions: state.factions };
        const prev = historyManager.undo(current);
        if (prev) dispatch(restoreSnapshot(prev));
        return;
      }

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

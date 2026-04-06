import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { closeShortcuts } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { PanelHeader } from '../shared/PanelHeader';

const ShortcutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ShortcutRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const KeyBadge = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 7px;
  border-radius: 5px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-family: monospace;
  font-size: 0.78rem;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 28px;
  text-align: center;
  box-shadow: 0 1px 0
    ${({ theme }) => {
      return theme.panelBorder;
    }};
`;

const ShortcutDesc = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  flex: 1;
`;

const KeyboardShortcutsPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const open = useAppSelector((state) => {
    return state.ui.showShortcuts;
  });

  const SHORTCUTS = [
    { keys: ['Ctrl+Z'], desc: t('shortcuts.undo') },
    { keys: ['Ctrl+Y', 'Ctrl+⇧+Z'], desc: t('shortcuts.redo') },
    { keys: ['Escape'], desc: t('shortcuts.escape') },
    { keys: ['Delete', 'Backspace'], desc: t('shortcuts.delete') },
    { keys: ['R'], desc: t('shortcuts.resetViewport') },
  ];

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(closeShortcuts());
    };
    window.addEventListener('keydown', handler);
    return () => {
      return window.removeEventListener('keydown', handler);
    };
  }, [open, dispatch]);

  return (
    <SidePanel $open={open} $desktopSlide>
      <DragHandle $margin="0 auto 4px" />
      <PanelHeader
        title={t('shortcuts.title')}
        onClose={() => {
          return dispatch(closeShortcuts());
        }}
        closeVariant="bordered"
      />
      <ShortcutList>
        {SHORTCUTS.map(({ keys, desc }) => {
          return (
            <ShortcutRow key={desc}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minWidth: 100 }}>
                {keys.map((k) => {
                  return <KeyBadge key={k}>{k}</KeyBadge>;
                })}
              </div>
              <ShortcutDesc>{desc}</ShortcutDesc>
            </ShortcutRow>
          );
        })}
      </ShortcutList>
    </SidePanel>
  );
};

export default KeyboardShortcutsPanel;

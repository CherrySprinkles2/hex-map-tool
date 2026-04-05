import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { closeShortcuts } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const Panel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ $open }) => {
    return $open ? '0' : '-300px';
  }};
  width: 280px;
  height: 100vh;
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-left: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  padding: 24px 16px;
  transition: right 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: ${({ theme }) => {
    return theme.zIndex.panel;
  }};
  overflow-y: auto;

  @media (max-width: 600px) {
    top: auto;
    right: 0;
    bottom: ${({ $open }) => {
      return $open ? '0' : '-60vh';
    }};
    width: 100%;
    height: 60vh;
    border-left: none;
    border-top: 2px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    border-radius: 16px 16px 0 0;
    padding: 16px 16px 32px;
    transition: bottom 0.25s ease;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
`;

const CloseBtn = styled.button`
  padding: 4px 8px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.panelBorder;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => {
    return theme.panelBorder;
  }};
  margin: 0 auto 4px;

  @media (min-width: 601px) {
    display: none;
  }
`;

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
    <Panel $open={open}>
      <DragHandle />
      <PanelHeader>
        <PanelTitle>{t('shortcuts.title')}</PanelTitle>
        <CloseBtn
          onClick={() => {
            return dispatch(closeShortcuts());
          }}
          aria-label="Close"
        >
          ×
        </CloseBtn>
      </PanelHeader>
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
    </Panel>
  );
};

export default KeyboardShortcutsPanel;

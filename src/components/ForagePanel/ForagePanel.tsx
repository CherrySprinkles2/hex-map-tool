import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { deselectTile } from '../../features/ui/uiSlice';
import { adjustForage, setForageLevel } from '../../features/tiles/tilesSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { PanelHeader } from '../shared/PanelHeader';
import { PanelEmptyState } from '../shared/PanelEmptyState';
import { LeafIcon } from '../../assets/icons/ui';
import { FORAGE_MAX } from '../../utils/forage';

const Hint = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin: 0;
  line-height: 1.5;
`;

const LevelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 4px 0 8px;
`;

const StepBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.surface.subtle;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const LevelValue = styled.div`
  min-width: 64px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => {
    return theme.text;
  }};
`;

const LevelCap = styled.span`
  font-size: 0.9rem;
  font-weight: 400;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
`;

const ClearBtn = styled.button`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.surface.subtle;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.85rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const ForagePanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const overlay = useAppSelector((state) => {
    return state.ui.overlay;
  });
  const tile = useAppSelector((state) => {
    const key = state.ui.selectedTile;
    return key ? (state.tiles[key] ?? null) : null;
  });

  const level = tile?.forageLevel ?? 0;

  return (
    <SidePanel
      data-testid="forage-panel"
      $open={overlay === 'forage' && tile !== null}
      $desktopVisible={overlay === 'forage'}
      $gap="14px"
    >
      <DragHandle />
      <PanelHeader
        title={t('foragePanel.title')}
        icon={<LeafIcon aria-hidden />}
        onClose={() => {
          return dispatch(deselectTile());
        }}
        closeDesktopHidden
        $marginBottom="4px"
      />

      {!tile ? (
        <PanelEmptyState text={t('foragePanel.noTile')} />
      ) : (
        <>
          <Hint>{t('foragePanel.hint')}</Hint>
          <LevelRow>
            <StepBtn
              data-testid="forage-dec"
              aria-label={t('foragePanel.decrease')}
              disabled={level <= 0}
              onClick={() => {
                return dispatch(adjustForage({ q: tile.q, r: tile.r, delta: -1 }));
              }}
            >
              −
            </StepBtn>
            <LevelValue data-testid="forage-level">
              {level}
              <LevelCap> / {FORAGE_MAX}</LevelCap>
            </LevelValue>
            <StepBtn
              data-testid="forage-inc"
              aria-label={t('foragePanel.increase')}
              disabled={level >= FORAGE_MAX}
              onClick={() => {
                return dispatch(adjustForage({ q: tile.q, r: tile.r, delta: 1 }));
              }}
            >
              +
            </StepBtn>
          </LevelRow>
          <ClearBtn
            data-testid="forage-clear"
            disabled={level <= 0}
            onClick={() => {
              return dispatch(setForageLevel({ q: tile.q, r: tile.r, level: 0 }));
            }}
          >
            {t('foragePanel.clear')}
          </ClearBtn>
        </>
      )}
    </SidePanel>
  );
};

export default ForagePanel;

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { deleteTile, setTileNotes } from '../../features/tiles/tilesSlice';
import { deselectTile } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { PanelEmptyState } from '../shared/PanelEmptyState';
import { SectionLabel } from '../shared/SectionLabel';
import { StyledTextarea } from '../shared/StyledTextarea';
import { Divider } from '../shared/Divider';
import { DangerButton } from '../shared/DangerButton';
import { CloseIcon, TrashIcon } from '../../assets/icons/ui';
import TerrainSection from './TerrainSection';
import FeatureFlagSection from './FeatureFlagSection';
import TileArmySection from './TileArmySection';

const BTN_ICON_PROPS = {
  width: '1em',
  height: '1em',
  style: { marginRight: '0.4em', flexShrink: 0 },
  'aria-hidden': true,
} as const;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const CloseBtn = styled.button<{ $desktopHidden?: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 1.2rem;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }

  ${({ $desktopHidden }) => {
    return $desktopHidden ? '@media (min-width: 601px) { display: none; }' : '';
  }}
`;

const TileEditPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const selectedKey = useAppSelector((state) => {
    return state.ui.selectedTile;
  });
  const overlay = useAppSelector((state) => {
    return state.ui.overlay;
  });
  const paintActive = useAppSelector((state) => {
    return state.ui.paintActive;
  });
  const showShortcuts = useAppSelector((state) => {
    return state.ui.showShortcuts;
  });
  const selectedArmyId = useAppSelector((state) => {
    return state.ui.selectedArmyId;
  });
  const editingTownTile = useAppSelector((state) => {
    return state.ui.editingTownTile;
  });
  const tile = useAppSelector((state) => {
    return selectedKey ? (state.tiles[selectedKey] ?? null) : null;
  });

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!tile) return;
    dispatch(setTileNotes({ q: tile.q, r: tile.r, notes: e.target.value }));
  };

  const handleDelete = () => {
    if (!tile) return;
    dispatch(deleteTile({ q: tile.q, r: tile.r }));
    dispatch(deselectTile());
  };

  const handleClose = () => {
    return dispatch(deselectTile());
  };

  return (
    <SidePanel
      $open={
        overlay === 'terrain' &&
        (!!selectedKey || paintActive) &&
        !showShortcuts &&
        !selectedArmyId &&
        !editingTownTile
      }
      $desktopVisible={
        overlay === 'terrain' && !showShortcuts && !selectedArmyId && !editingTownTile
      }
      $gap="20px"
    >
      <DragHandle $margin="0 auto -8px" />

      {paintActive ? (
        <TerrainSection />
      ) : (
        <>
          <PanelTitle>{t('tilePanel.title')}</PanelTitle>
          <CloseBtn $desktopHidden={!selectedKey} onClick={handleClose}>
            <CloseIcon width="1em" height="1em" />
          </CloseBtn>

          {!selectedKey ? (
            <PanelEmptyState text={t('tilePanel.noTileSelected')} />
          ) : (
            <>
              <TerrainSection />

              <Divider />

              <FeatureFlagSection />

              <Divider />

              <div>
                <SectionLabel>{t('tilePanel.notes')}</SectionLabel>
                <StyledTextarea
                  data-testid="notes-textarea"
                  $minHeight="160px"
                  value={tile?.notes ?? ''}
                  onChange={handleNotesChange}
                  placeholder={t('tilePanel.notesPlaceholder')}
                />
              </div>

              <TileArmySection />

              <DangerButton
                data-testid="delete-tile-btn"
                style={{ marginTop: 'auto' }}
                onClick={handleDelete}
              >
                <TrashIcon {...BTN_ICON_PROPS} />
                {t('tilePanel.deleteTile')}
              </DangerButton>
            </>
          )}
        </>
      )}
    </SidePanel>
  );
};

export default TileEditPanel;

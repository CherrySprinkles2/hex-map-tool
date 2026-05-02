import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { deleteTile, setTileNotes } from '../../features/tiles/tilesSlice';
import { deselectTile } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { SectionLabel } from '../shared/SectionLabel';
import { StyledTextarea } from '../shared/StyledTextarea';
import { Divider } from '../shared/Divider';
import { DangerButton } from '../shared/DangerButton';
import { CloseIcon, HexIcon, TrashIcon } from '../../assets/icons/ui';
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

const CloseBtn = styled.button`
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

  @media (min-width: 601px) {
    display: none;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  opacity: 0.45;
`;

const EmptyHexIcon = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  opacity: 0.45;
`;

const EmptyText = styled.p`
  font-size: 0.85rem;
  text-align: center;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  line-height: 1.5;
  margin: 0;
`;

const TileEditPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const selectedKey = useAppSelector((state) => {
    return state.ui.selectedTile;
  });
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
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
        (!!selectedKey || mapMode === 'terrain-paint') &&
        !showShortcuts &&
        !selectedArmyId &&
        !editingTownTile
      }
      $desktopVisible={
        (mapMode === 'terrain' || mapMode === 'terrain-paint') &&
        !showShortcuts &&
        !selectedArmyId &&
        !editingTownTile
      }
      $gap="20px"
    >
      <DragHandle $margin="0 auto -8px" />

      {mapMode === 'terrain-paint' ? (
        <TerrainSection />
      ) : (
        <>
          <PanelTitle>{t('tilePanel.title')}</PanelTitle>
          <CloseBtn onClick={handleClose}>
            <CloseIcon width="1em" height="1em" />
          </CloseBtn>

          {!selectedKey ? (
            <EmptyState>
              <EmptyHexIcon as={HexIcon} />
              <EmptyText>{t('tilePanel.noTileSelected')}</EmptyText>
            </EmptyState>
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

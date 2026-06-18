import React from 'react';
import { useTranslation } from 'react-i18next';
import { deselectTile } from '../../features/ui/uiSlice';
import { setTileNotes } from '../../features/tiles/tilesSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { PanelHeader } from '../shared/PanelHeader';
import { PanelEmptyState } from '../shared/PanelEmptyState';
import { SectionLabel } from '../shared/SectionLabel';
import { StyledTextarea } from '../shared/StyledTextarea';
import { NoteIcon } from '../../assets/icons/ui';

const NotesPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const overlay = useAppSelector((state) => {
    return state.ui.overlay;
  });
  const tile = useAppSelector((state) => {
    const key = state.ui.selectedTile;
    return key ? (state.tiles[key] ?? null) : null;
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!tile) return;
    dispatch(setTileNotes({ q: tile.q, r: tile.r, notes: e.target.value }));
  };

  return (
    <SidePanel
      data-testid="notes-panel"
      $open={overlay === 'notes' && tile !== null}
      $desktopVisible={overlay === 'notes'}
      $gap="14px"
    >
      <DragHandle />
      <PanelHeader
        title={t('notesPanel.title')}
        icon={<NoteIcon aria-hidden />}
        onClose={() => {
          return dispatch(deselectTile());
        }}
        closeDesktopHidden
        $marginBottom="4px"
      />

      {!tile ? (
        <PanelEmptyState text={t('notesPanel.noTile')} />
      ) : (
        <div>
          <SectionLabel>{t('notesPanel.label')}</SectionLabel>
          <StyledTextarea
            data-testid="notes-overlay-textarea"
            $minHeight="200px"
            value={tile.notes ?? ''}
            onChange={handleChange}
            placeholder={t('notesPanel.placeholder')}
          />
        </div>
      )}
    </SidePanel>
  );
};

export default NotesPanel;

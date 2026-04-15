import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { setTownName, setFortification, setTownSize } from '../../features/tiles/tilesSlice';
import { exitTownEdit } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { SectionLabel } from '../shared/SectionLabel';
import FortificationPreview from './FortificationPreview';
import TownSizePreview from './TownSizePreview';
import type { Fortification, TownSize } from '../../types/domain';

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.surface.borderMedium;
    }};
  background: ${({ theme }) => {
    return theme.surface.card;
  }};
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  cursor: pointer;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.surface.borderFaint;
    }};
    border-color: ${({ theme }) => {
      return theme.surface.borderFocus;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

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

const NameInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.town.color;
    }}66;
  background: ${({ theme }) => {
    return theme.surface.card;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => {
      return theme.town.color;
    }};
  }

  &::placeholder {
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionBtn = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 2px solid
    ${({ $active, theme }) => {
      return $active ? theme.town.color : theme.surface.borderFaint;
    }};
  border-radius: 0;
  background: ${({ $active, theme }) => {
    return $active ? `${theme.town.color}18` : theme.surface.base;
  }};
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  &:first-child:last-child {
    border-radius: 8px;
  }
  & + & {
    margin-top: -2px;
  }
  &:hover {
    z-index: 1;
    border-color: ${({ $active, theme }) => {
      return $active ? theme.town.color : theme.surface.hover;
    }};
    background: ${({ $active, theme }) => {
      return $active ? `${theme.town.color}22` : theme.surface.hoverWeak;
    }};
  }
`;

const OptionTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const OptionLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  letter-spacing: 0.04em;
`;

const OptionDesc = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  line-height: 1.4;
`;

const FORTIFICATION_OPTIONS: Fortification[] = ['none', 'palisade', 'stone'];
const SIZE_OPTIONS: TownSize[] = ['village', 'town', 'city'];

const TownEditPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const editingTownTile = useAppSelector((state) => {
    return state.ui.editingTownTile;
  });
  const tile = useAppSelector((state) => {
    return editingTownTile ? (state.tiles[editingTownTile] ?? null) : null;
  });

  const handleBack = () => {
    dispatch(exitTownEdit());
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tile) return;
    dispatch(setTownName({ q: tile.q, r: tile.r, name: e.target.value }));
  };

  const handleFortificationChange = (fortification: Fortification) => {
    if (!tile) return;
    dispatch(setFortification({ q: tile.q, r: tile.r, fortification }));
  };

  const handleSizeChange = (townSize: TownSize) => {
    if (!tile) return;
    dispatch(setTownSize({ q: tile.q, r: tile.r, townSize }));
  };

  const currentFortification = tile?.fortification ?? 'none';
  const currentSize = tile?.townSize ?? 'town';
  const isOpen = !!editingTownTile;

  return (
    <SidePanel $open={isOpen} $desktopVisible={isOpen} $gap="20px">
      <DragHandle $margin="0 auto -8px" />

      <HeaderRow>
        <BackBtn data-testid="town-edit-back-btn" onClick={handleBack}>
          {t('townPanel.back')}
        </BackBtn>
        <PanelTitle>{t('townPanel.title')}</PanelTitle>
      </HeaderRow>

      <div>
        <SectionLabel>{t('townPanel.name')}</SectionLabel>
        <NameInput
          data-testid="town-edit-name-input"
          value={tile?.townName ?? ''}
          onChange={handleNameChange}
          placeholder={t('townPanel.namePlaceholder')}
          maxLength={32}
        />
      </div>

      <div>
        <SectionLabel>{t('townPanel.fortification')}</SectionLabel>
        <OptionGroup>
          {FORTIFICATION_OPTIONS.map((level) => {
            return (
              <OptionBtn
                key={level}
                data-testid={`fortification-${level}`}
                data-active={currentFortification === level}
                $active={currentFortification === level}
                onClick={() => {
                  return handleFortificationChange(level);
                }}
              >
                <FortificationPreview fortification={level} />
                <OptionTextCol>
                  <OptionLabel>{t(`townPanel.fortification_${level}`)}</OptionLabel>
                  <OptionDesc>{t(`townPanel.fortification_${level}_desc`)}</OptionDesc>
                </OptionTextCol>
              </OptionBtn>
            );
          })}
        </OptionGroup>
      </div>

      <div>
        <SectionLabel>{t('townPanel.sizeLabel')}</SectionLabel>
        <OptionGroup>
          {SIZE_OPTIONS.map((size) => {
            return (
              <OptionBtn
                key={size}
                data-testid={`size-${size}`}
                data-active={currentSize === size}
                $active={currentSize === size}
                onClick={() => {
                  return handleSizeChange(size);
                }}
              >
                <TownSizePreview townSize={size} />
                <OptionTextCol>
                  <OptionLabel>{t(`townPanel.size_${size}`)}</OptionLabel>
                  <OptionDesc>{t(`townPanel.size_${size}_desc`)}</OptionDesc>
                </OptionTextCol>
              </OptionBtn>
            );
          })}
        </OptionGroup>
      </div>
    </SidePanel>
  );
};

export default TownEditPanel;

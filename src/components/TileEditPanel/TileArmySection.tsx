import React, { useState } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addArmy } from '../../features/armies/armiesSlice';
import { selectArmy } from '../../features/ui/uiSlice';
import { toKey } from '../../utils/hexUtils';
import { theme } from '../../styles/theme';
import type { RootState } from '../../app/store';
import { SectionLabel } from '../shared/SectionLabel';
import { ButtonGroup } from '../shared/ButtonGroup';
import TileArrangeModal from '../TileArrangeModal/TileArrangeModal';
import { SwordsIcon } from '../../assets/icons/ui';

const BTN_ICON_PROPS = {
  width: '1em',
  height: '1em',
  style: { marginRight: '0.4em', flexShrink: 0 },
  'aria-hidden': true,
} as const;

const ArmyRow = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 2px solid
    ${({ theme: t }) => {
      return t.surface.borderFaint;
    }};
  border-radius: 0;
  background: ${({ theme: t }) => {
    return t.surface.subtle;
  }};
  color: ${({ theme: t }) => {
    return t.text;
  }};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-size: 0.85rem;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    z-index: 1;
    border-color: ${({ theme: t }) => {
      return t.garrison.nameColor;
    }}77;
    background: ${({ theme: t }) => {
      return t.garrison.nameColor;
    }}1a;
  }
`;

const ArmyIconCell = styled.div<{ $color?: string }>`
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: ${({ $color }) => {
    return $color ?? 'transparent';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ArmyRowName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AddArmyBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: t }) => {
      return t.surface.borderMedium;
    }};
  background: ${({ theme: t }) => {
    return t.surface.subtle;
  }};
  color: ${({ theme: t }) => {
    return t.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: t }) => {
      return t.surface.hover;
    }};
    border-color: ${({ theme: t }) => {
      return t.surface.borderFocus;
    }};
  }
`;

const ArrangeArmiesBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: t }) => {
      return t.garrison.nameColor;
    }}66;
  background: ${({ theme: t }) => {
    return t.garrison.nameColor;
  }}0f;
  color: ${({ theme: t }) => {
    return t.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: t }) => {
      return t.garrison.nameColor;
    }}26;
    border-color: ${({ theme: t }) => {
      return t.garrison.nameColor;
    }}b3;
  }
`;

const selectTileArmies = createSelector(
  [
    (state: RootState) => {
      return state.armies;
    },
    (_state: RootState, selectedKey: string | null) => {
      return selectedKey;
    },
  ],
  (armies, selectedKey) => {
    if (!selectedKey) return [];
    return Object.values(armies).filter((a) => {
      return toKey(a.q, a.r) === selectedKey;
    });
  }
);

const TileArmySection = (): React.ReactElement | null => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [arrangeOpen, setArrangeOpen] = useState(false);

  const selectedKey = useAppSelector((state) => {
    return state.ui.selectedTile;
  });
  const tile = useAppSelector((state) => {
    return selectedKey ? (state.tiles[selectedKey] ?? null) : null;
  });
  const tileArmies = useAppSelector((state) => {
    return selectTileArmies(state, selectedKey);
  });
  const factions = useAppSelector((state) => {
    return state.factions;
  });

  if (!tile || tileArmies.length === 0) {
    return (
      <AddArmyBtn
        data-testid="add-army-btn"
        onClick={() => {
          return tile && dispatch(addArmy({ q: tile.q, r: tile.r }));
        }}
      >
        <SwordsIcon {...BTN_ICON_PROPS} />
        {t('tilePanel.addArmy')}
      </AddArmyBtn>
    );
  }

  return (
    <>
      <div>
        <SectionLabel>{t('tilePanel.armies')}</SectionLabel>
        <ButtonGroup>
          {tileArmies.map((army) => {
            const faction = army.factionId
              ? (factions.find((f) => {
                  return f.id === army.factionId;
                }) ?? null)
              : null;
            return (
              <ArmyRow
                key={army.id}
                data-testid={`select-army-${army.id}`}
                onClick={() => {
                  return dispatch(selectArmy(army.id));
                }}
              >
                <ArmyIconCell $color={faction?.color}>
                  <theme.icons.army.land
                    style={{
                      width: '1rem',
                      height: '1rem',
                      filter: 'brightness(0) invert(1)',
                      opacity: 0.9,
                    }}
                  />
                </ArmyIconCell>
                <ArmyRowName>{army.name || 'Unnamed Army'}</ArmyRowName>
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Select →</span>
              </ArmyRow>
            );
          })}
        </ButtonGroup>
      </div>

      <ArrangeArmiesBtn
        data-testid="arrange-armies-btn"
        onClick={() => {
          return setArrangeOpen(true);
        }}
      >
        <SwordsIcon {...BTN_ICON_PROPS} />
        {t('tilePanel.arrangeArmies')}
      </ArrangeArmiesBtn>

      <AddArmyBtn
        data-testid="add-army-btn"
        onClick={() => {
          return dispatch(addArmy({ q: tile.q, r: tile.r }));
        }}
      >
        <SwordsIcon {...BTN_ICON_PROPS} />
        {t('tilePanel.addArmy')}
      </AddArmyBtn>

      {arrangeOpen && (
        <TileArrangeModal
          tile={tile}
          armies={tileArmies}
          factions={factions}
          onClose={() => {
            return setArrangeOpen(false);
          }}
        />
      )}
    </>
  );
};

export default TileArmySection;

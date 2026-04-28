import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { createSelector } from '@reduxjs/toolkit';
import { setMapMode, selectArmy, startMovingArmy } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { axialToPixel } from '../../utils/hexUtils';
import { animateViewportTo } from '../../utils/viewportAnimator';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { PanelHeader } from '../shared/PanelHeader';
import { SwordsIcon } from '../../assets/icons/ui';
import type { RootState } from '../../app/store';
import type { Army } from '../../types/domain';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ArmyGroup {
  factionId: string | null;
  factionName: string;
  factionColor: string | null;
  armies: Army[];
}

// ── Selector ───────────────────────────────────────────────────────────────────

const selectArmyGroups = createSelector(
  [
    (state: RootState) => {
      return state.armies;
    },
    (state: RootState) => {
      return state.factions;
    },
  ],
  (armies, factions) => {
    const allArmies = Object.values(armies);
    const groups: ArmyGroup[] = [];
    const byFaction = new Map<string | null, Army[]>();

    allArmies.forEach((army) => {
      const key = army.factionId ?? null;
      if (!byFaction.has(key)) byFaction.set(key, []);
      byFaction.get(key)!.push(army);
    });

    const sortedFactions = [...factions].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    sortedFactions.forEach((faction) => {
      const group = byFaction.get(faction.id);
      if (group) {
        groups.push({
          factionId: faction.id,
          factionName: faction.name,
          factionColor: faction.color,
          armies: [...group].sort((a, b) => {
            return a.name.localeCompare(b.name);
          }),
        });
      }
    });

    const unassigned = byFaction.get(null);
    if (unassigned && unassigned.length > 0) {
      groups.push({
        factionId: null,
        factionName: '',
        factionColor: null,
        armies: [...unassigned].sort((a, b) => {
          return a.name.localeCompare(b.name);
        }),
      });
    }

    return groups;
  }
);

// ── Styled components ──────────────────────────────────────────────────────────

const MovingHint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  background: ${({ theme }) => {
    return `${theme.army.movingColor}14`;
  }};
  border: 1px solid
    ${({ theme }) => {
      return `${theme.army.movingColor}33`;
    }};
  border-radius: 6px;
  padding: 8px 10px;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  font-size: 0.82rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  text-align: center;
  padding: 16px 0;
`;

const GroupSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 4px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  border-bottom: 1px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  margin-bottom: 2px;
`;

const Swatch = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
  background: ${({ $color }) => {
    return $color;
  }};
  border: 1px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
`;

const UnassignedDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
  border: 2px dashed
    ${({ theme }) => {
      return theme.textMuted;
    }};
`;

const ArmyRow = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 6px;
  background: ${({ $active, theme }) => {
    return $active ? `${theme.army.movingColor}18` : 'transparent';
  }};
  transition: background 0.1s;

  & + & {
    border-top: 1px solid
      ${({ theme }) => {
        return theme.surface.border;
      }};
  }
`;

const ArmyName = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => {
    return theme.text;
  }};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 4px;
`;

const TextBtn = styled.button`
  flex: 1;
  padding: 4px 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.75rem;
  cursor: pointer;
  text-align: center;
  transition:
    background 0.1s,
    color 0.1s;

  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

// ── Component ──────────────────────────────────────────────────────────────────

const ArmyEditPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });
  const movingArmyId = useAppSelector((state) => {
    return state.ui.movingArmyId;
  });
  const selectedArmyId = useAppSelector((state) => {
    return state.ui.selectedArmyId;
  });
  const movingArmyName = useAppSelector((state) => {
    const id = state.ui.movingArmyId;
    return id ? (state.armies[id]?.name ?? '') : '';
  });
  const groups = useAppSelector(selectArmyGroups);
  const totalArmies = groups.reduce((sum, g) => {
    return sum + g.armies.length;
  }, 0);

  const handleClose = useCallback(() => {
    dispatch(setMapMode('terrain'));
  }, [dispatch]);

  const handleScrollTo = useCallback((q: number, r: number) => {
    const { x: px, y: py } = axialToPixel(q, r);
    animateViewportTo(px, py);
  }, []);

  const handleMove = useCallback(
    (id: string) => {
      dispatch(selectArmy(id));
      dispatch(startMovingArmy(id));
    },
    [dispatch]
  );

  const handleEdit = useCallback(
    (id: string) => {
      dispatch(selectArmy(id));
    },
    [dispatch]
  );

  return (
    <SidePanel data-testid="army-edit-panel" $open={mapMode === 'army'} $desktopSlide $gap="12px">
      <DragHandle $margin="0 auto -4px" />
      <PanelHeader
        title={t('armyEditPanel.title')}
        icon={<SwordsIcon aria-hidden />}
        onClose={handleClose}
      />

      {movingArmyId && (
        <MovingHint data-testid="army-edit-moving-hint">
          {t('armyEditPanel.movingHint', { name: movingArmyName })}
        </MovingHint>
      )}

      {totalArmies === 0 && (
        <EmptyState data-testid="army-edit-empty">{t('armyEditPanel.empty')}</EmptyState>
      )}

      {groups.map((group) => {
        return (
          <GroupSection key={group.factionId ?? '__unassigned__'}>
            <GroupHeader data-testid={`army-edit-group-${group.factionId ?? 'unassigned'}`}>
              {group.factionColor ? <Swatch $color={group.factionColor} /> : <UnassignedDot />}
              {group.factionId ? group.factionName : t('armyEditPanel.unassigned')}
            </GroupHeader>
            {group.armies.map((army) => {
              const isActive = army.id === movingArmyId || army.id === selectedArmyId;
              return (
                <ArmyRow key={army.id} $active={isActive}>
                  <ArmyName>{army.name}</ArmyName>
                  <ButtonRow>
                    <TextBtn
                      data-testid={`army-edit-goto-${army.id}`}
                      aria-label={t('armyEditPanel.scrollTo')}
                      onClick={() => {
                        return handleScrollTo(army.q, army.r);
                      }}
                    >
                      {t('armyEditPanel.scrollTo')}
                    </TextBtn>
                    <TextBtn
                      data-testid={`army-edit-move-${army.id}`}
                      aria-label={t('armyEditPanel.move')}
                      onClick={() => {
                        return handleMove(army.id);
                      }}
                    >
                      {t('armyEditPanel.move')}
                    </TextBtn>
                    <TextBtn
                      data-testid={`army-edit-edit-${army.id}`}
                      aria-label={t('armyEditPanel.edit')}
                      onClick={() => {
                        return handleEdit(army.id);
                      }}
                    >
                      {t('armyEditPanel.edit')}
                    </TextBtn>
                  </ButtonRow>
                </ArmyRow>
              );
            })}
          </GroupSection>
        );
      })}
    </SidePanel>
  );
};

export default ArmyEditPanel;

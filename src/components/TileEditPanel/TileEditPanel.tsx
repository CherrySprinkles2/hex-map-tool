import React from 'react';
import { createSelector } from '@reduxjs/toolkit';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  updateTile,
  deleteTile,
  toggleTileFlag,
  setTileNotes,
  blockConnection,
  unblockConnection,
} from '../../features/tiles/tilesSlice';
import { addArmy } from '../../features/armies/armiesSlice';
import {
  deselectTile,
  selectArmy,
  enterTerrainPaint,
  exitTerrainPaint,
  setActivePaintBrush,
  enterTownEdit,
} from '../../features/ui/uiSlice';
import { theme } from '../../styles/theme';
import { NEIGHBOR_DIRS, toKey, DEEP_WATER } from '../../utils/hexUtils';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import useTerrainList from '../../hooks/useTerrainList';
import { TERRAIN_ICON } from '../../assets/icons/terrain';
import { RiverIcon, RoadIcon, PortIcon } from '../../assets/icons/features';
import { LandIcon } from '../../assets/icons/army';
import type { RootState } from '../../app/store';
import type { TileFlag, TerrainType } from '../../types/domain';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { SectionLabel } from '../shared/SectionLabel';
import { StyledTextarea } from '../shared/StyledTextarea';

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
  font-size: 3.5rem;
  line-height: 1;
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

const TerrainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const TerrainBtn = styled.button<{ $active: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active, $color, theme }) => {
      return $active
        ? `color-mix(in srgb, ${$color} ${theme.terrainButtonMix.activePercent}%, white)`
        : 'transparent';
    }};
  background: ${({ $color }) => {
    return $color;
  }}33;
  color: ${({ theme }) => {
    return theme.text;
  }};
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    border-color: ${({ $color, theme }) => {
      return `color-mix(in srgb, ${$color} ${theme.terrainButtonMix.hoverPercent}%, white)`;
    }};
    background: ${({ $color }) => {
      return $color;
    }}55;
  }

  &:focus-visible {
    outline: 3px solid
      ${({ $color, theme }) => {
        return `color-mix(in srgb, ${$color} ${theme.terrainButtonMix.focusPercent}%, white)`;
      }};
    outline-offset: 2px;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    filter: brightness(0) invert(1);
    opacity: 0.85;
  }
  span.label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const FlagBtnGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FlagBtn = styled.button<{ $active: boolean; $color: string }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 2px solid
    ${({ $active, $color }) => {
      return $active ? $color : 'rgba(255,255,255,0.1)';
    }};
  border-radius: 0;
  background: ${({ $active, $color }) => {
    return $active ? `${$color}22` : 'rgba(255,255,255,0.03)';
  }};
  color: ${({ theme }) => {
    return theme.text;
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
    border-color: ${({ $color }) => {
      return $color;
    }}77;
  }

  .flag-icon {
    width: 1.2rem;
    height: 1.2rem;
    display: block;
    filter: brightness(0) invert(1);
    opacity: 0.85;
  }
  .flag-label {
    font-size: 0.85rem;
    letter-spacing: 0.03em;
  }
  .flag-state {
    margin-left: auto;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
`;

const ArmyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ArmyRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid rgba(212, 160, 23, 0.35);
  background: rgba(212, 160, 23, 0.06);
  color: ${({ theme }) => {
    return theme.text;
  }};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-size: 0.85rem;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: rgba(212, 160, 23, 0.15);
    border-color: rgba(212, 160, 23, 0.6);
  }
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
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: ${({ theme }) => {
    return theme.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const EditTownBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.town.color;
    }}66;
  background: rgba(255, 255, 255, 0.03);
  color: ${({ theme }) => {
    return theme.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.town.color;
    }}22;
    border-color: ${({ theme }) => {
      return theme.town.color;
    }};
  }
`;

const DeleteBtn = styled.button`
  margin-top: auto;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.accent;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.accent;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.accent;
    }}22;
  }
`;

const ConnectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 8px;
  padding-left: 4px;
`;

const ConnectionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
`;

const ConnectionBtn = styled.button<{ $blocked: boolean; $color: string }>`
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid
    ${({ $blocked, $color }) => {
      return $blocked ? 'rgba(255,255,255,0.15)' : `${$color}66`;
    }};
  background: transparent;
  color: ${({ $blocked, theme }) => {
    return $blocked ? theme.textMuted : theme.text;
  }};
  font-size: 0.7rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition:
    border-color 0.15s,
    color 0.15s;
  &:hover {
    border-color: ${({ $color }) => {
      return $color;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const PaintModeHeader = styled.div`
  position: relative;
`;

const ExitPaintBtn = styled.button`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
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
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const FeatureBrushRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeatureBrushLabel = styled.span`
  flex: 0 0 72px;
  font-size: 0.85rem;
  color: ${({ theme }) => {
    return theme.text;
  }};
`;

const FeatureBrushBtnGroup = styled.div`
  display: flex;
  gap: 6px;
  flex: 1;
`;

const FeatureBrushBtn = styled.button<{ $active: boolean; $color: string }>`
  flex: 1;
  padding: 8px 6px;
  border-radius: 7px;
  border: 2px solid
    ${({ $active, $color }) => {
      return $active ? $color : 'rgba(255,255,255,0.1)';
    }};
  background: ${({ $active, $color }) => {
    return $active ? `${$color}22` : 'rgba(255,255,255,0.02)';
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  cursor: pointer;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;
  &:hover {
    border-color: ${({ $color }) => {
      return $color;
    }}77;
  }
  &:focus-visible {
    outline: 2px solid
      ${({ $color }) => {
        return $color;
      }};
    outline-offset: 2px;
  }
`;

const PaintModeBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid rgba(147, 112, 219, 0.4);
  background: rgba(147, 112, 219, 0.06);
  color: ${({ theme }) => {
    return theme.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: rgba(147, 112, 219, 0.15);
    border-color: rgba(147, 112, 219, 0.7);
  }
`;

const PaintHint = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  text-align: center;
  margin: 0;
  line-height: 1.5;

  @media (max-width: 600px) {
    display: none;
  }
`;

const DIR_LABELS = ['E', 'NE', 'NW', 'W', 'SW', 'SE'] as const;

const FLAG_BLOCKED_KEY: Record<
  'hasRiver' | 'hasRoad' | 'hasTown',
  'riverBlocked' | 'roadBlocked' | 'portBlocked'
> = {
  hasRiver: 'riverBlocked',
  hasRoad: 'roadBlocked',
  hasTown: 'portBlocked',
};

const FLAGS: Array<{
  key: 'hasRiver' | 'hasRoad' | 'hasTown';
  labelKey: 'features.river' | 'features.road' | 'features.town';
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}> = [
  { key: 'hasRiver', labelKey: 'features.river', Icon: RiverIcon, color: theme.river.color },
  { key: 'hasRoad', labelKey: 'features.road', Icon: RoadIcon, color: theme.road.color },
  { key: 'hasTown', labelKey: 'features.town', Icon: PortIcon, color: theme.town.color },
];

const TileEditPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const terrainList = useTerrainList();
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
  const activePaintBrush = useAppSelector((state) => {
    return state.ui.activePaintBrush;
  });
  const editingTownTile = useAppSelector((state) => {
    return state.ui.editingTownTile;
  });
  const tile = useAppSelector((state) => {
    return selectedKey ? (state.tiles[selectedKey] ?? null) : null;
  });
  const allTiles = useAppSelector((state) => {
    return state.tiles;
  });
  const tileArmies = useAppSelector((state) => {
    return selectTileArmies(state, selectedKey);
  });

  const handleTerrainChange = (terrainType: TerrainType) => {
    if (!tile) return;
    dispatch(updateTile({ q: tile.q, r: tile.r, terrain: terrainType }));
  };

  const handleFlagToggle = (flag: TileFlag) => {
    if (!tile) return;
    dispatch(toggleTileFlag({ q: tile.q, r: tile.r, flag }));
  };

  const handleConnectionToggle = (flag: TileFlag, neighborKey: string, isBlocked: boolean) => {
    if (!tile) return;
    if (isBlocked) {
      dispatch(unblockConnection({ q: tile.q, r: tile.r, flag, neighborKey }));
    } else {
      dispatch(blockConnection({ q: tile.q, r: tile.r, flag, neighborKey }));
    }
  };

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
        <>
          <PaintModeHeader>
            <PanelTitle>{t('tilePanel.paintMode')}</PanelTitle>
            <ExitPaintBtn
              data-testid="exit-paint-btn"
              onClick={() => {
                return dispatch(exitTerrainPaint());
              }}
            >
              {t('tilePanel.exitPaint')}
            </ExitPaintBtn>
          </PaintModeHeader>

          <div>
            <SectionLabel>{t('tilePanel.terrain')}</SectionLabel>
            <TerrainGrid>
              {terrainList.map(({ id, color, Icon: TerrainIcon, iconUrl, name }) => {
                return (
                  <TerrainBtn
                    key={id}
                    data-testid={`paint-brush-${id}`}
                    $active={activePaintBrush === id}
                    $color={color}
                    onClick={() => {
                      return dispatch(setActivePaintBrush(id));
                    }}
                  >
                    {TerrainIcon ? (
                      <TerrainIcon className="icon" />
                    ) : iconUrl ? (
                      <img className="icon" src={iconUrl} alt="" aria-hidden />
                    ) : (
                      <span
                        className="icon"
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          background: color,
                          borderRadius: '3px',
                          display: 'block',
                        }}
                      />
                    )}
                    <span className="label">
                      {t(`terrain.${id}` as `terrain.${TerrainType}`, { defaultValue: name })}
                    </span>
                  </TerrainBtn>
                );
              })}
            </TerrainGrid>
          </div>

          <Divider />

          <div>
            <SectionLabel>{t('tilePanel.features')}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <FeatureBrushRow>
                <FeatureBrushLabel>
                  <RiverIcon
                    style={{
                      width: '1rem',
                      height: '1rem',
                      verticalAlign: 'middle',
                      filter: 'brightness(0) invert(1)',
                      opacity: 0.85,
                    }}
                  />{' '}
                  {t('features.river')}
                </FeatureBrushLabel>
                <FeatureBrushBtnGroup>
                  <FeatureBrushBtn
                    $active={activePaintBrush === 'river-on'}
                    $color={theme.river.color}
                    onClick={() => {
                      return dispatch(setActivePaintBrush('river-on'));
                    }}
                  >
                    {t('tilePanel.riverAdd')}
                  </FeatureBrushBtn>
                  <FeatureBrushBtn
                    $active={activePaintBrush === 'river-off'}
                    $color="#888888"
                    onClick={() => {
                      return dispatch(setActivePaintBrush('river-off'));
                    }}
                  >
                    {t('tilePanel.riverRemove')}
                  </FeatureBrushBtn>
                </FeatureBrushBtnGroup>
              </FeatureBrushRow>
              <FeatureBrushRow>
                <FeatureBrushLabel>
                  <RoadIcon
                    style={{
                      width: '1rem',
                      height: '1rem',
                      verticalAlign: 'middle',
                      filter: 'brightness(0) invert(1)',
                      opacity: 0.85,
                    }}
                  />{' '}
                  {t('features.road')}
                </FeatureBrushLabel>
                <FeatureBrushBtnGroup>
                  <FeatureBrushBtn
                    $active={activePaintBrush === 'road-on'}
                    $color={theme.road.color}
                    onClick={() => {
                      return dispatch(setActivePaintBrush('road-on'));
                    }}
                  >
                    {t('tilePanel.roadAdd')}
                  </FeatureBrushBtn>
                  <FeatureBrushBtn
                    $active={activePaintBrush === 'road-off'}
                    $color="#888888"
                    onClick={() => {
                      return dispatch(setActivePaintBrush('road-off'));
                    }}
                  >
                    {t('tilePanel.roadRemove')}
                  </FeatureBrushBtn>
                </FeatureBrushBtnGroup>
              </FeatureBrushRow>
            </div>
          </div>

          <PaintHint>{t('tilePanel.paintHint')}</PaintHint>
        </>
      ) : (
        <>
          <PanelTitle>{t('tilePanel.title')}</PanelTitle>
          <CloseBtn onClick={handleClose}>✕</CloseBtn>

          {!selectedKey ? (
            <EmptyState>
              <EmptyHexIcon>⬡</EmptyHexIcon>
              <EmptyText>{t('tilePanel.noTileSelected')}</EmptyText>
            </EmptyState>
          ) : (
            <>
              <div>
                <SectionLabel>{t('tilePanel.terrain')}</SectionLabel>
                <TerrainGrid>
                  {terrainList.map(({ id, color, Icon: TerrainIcon, iconUrl, name }) => {
                    return (
                      <TerrainBtn
                        key={id}
                        data-testid={`terrain-btn-${id}`}
                        $active={tile?.terrain === id}
                        $color={color}
                        onClick={() => {
                          return handleTerrainChange(id as TerrainType);
                        }}
                      >
                        {TerrainIcon ? (
                          <TerrainIcon className="icon" />
                        ) : iconUrl ? (
                          <img className="icon" src={iconUrl} alt="" aria-hidden />
                        ) : (
                          <span
                            className="icon"
                            style={{
                              width: '1.5rem',
                              height: '1.5rem',
                              background: color,
                              borderRadius: '3px',
                              display: 'block',
                            }}
                          />
                        )}
                        <span className="label">
                          {t(`terrain.${id}` as `terrain.${TerrainType}`, { defaultValue: name })}
                        </span>
                      </TerrainBtn>
                    );
                  })}
                </TerrainGrid>
                <PaintModeBtn
                  data-testid="paint-terrain-btn"
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    return dispatch(enterTerrainPaint(tile?.terrain ?? null));
                  }}
                >
                  {t('tilePanel.paintTerrain')}
                </PaintModeBtn>
              </div>

              <Divider />

              <div>
                <SectionLabel>{t('tilePanel.features')}</SectionLabel>
                <FlagBtnGroup>
                  {FLAGS.map(({ key, labelKey, Icon: FlagIcon, color }) => {
                    const active = !!tile?.[key];
                    return (
                      <FlagBtn
                        key={key}
                        data-testid={`flag-toggle-${key}`}
                        $active={active}
                        $color={color}
                        onClick={() => {
                          return handleFlagToggle(key);
                        }}
                      >
                        <FlagIcon className="flag-icon" />
                        <span className="flag-label">{t(labelKey)}</span>
                        <span className="flag-state">{active ? 'on' : 'off'}</span>
                      </FlagBtn>
                    );
                  })}
                </FlagBtnGroup>
                {FLAGS.map(({ key, labelKey: _labelKey, color }) => {
                  const active = !!tile?.[key];
                  const blockedKey = FLAG_BLOCKED_KEY[key];
                  const isPort = key === 'hasTown';
                  if (!active || !blockedKey) return null;
                  const flagNeighbors = NEIGHBOR_DIRS.map((dir, i) => {
                    const nk = toKey((tile?.q ?? 0) + dir.q, (tile?.r ?? 0) + dir.r);
                    const neighbor = allTiles[nk];
                    if (isPort) {
                      if (!DEEP_WATER.has(neighbor?.terrain)) return null;
                      const isBlocked = (tile?.[blockedKey] ?? []).includes(nk);
                      return {
                        nk,
                        dirLabel: t(`dir.${DIR_LABELS[i]}`),
                        terrain: neighbor.terrain,
                        isBlocked,
                      };
                    } else {
                      if (!neighbor?.[key]) return null;
                      const isBlocked =
                        (tile?.[blockedKey] ?? []).includes(nk) ||
                        ((neighbor[blockedKey] ?? []) as string[]).includes(selectedKey ?? '');
                      return {
                        nk,
                        dirLabel: t(`dir.${DIR_LABELS[i]}`),
                        terrain: neighbor.terrain,
                        isBlocked,
                      };
                    }
                  }).filter(
                    (
                      x
                    ): x is {
                      nk: string;
                      dirLabel: string;
                      terrain: TerrainType;
                      isBlocked: boolean;
                    } => {
                      return x !== null;
                    }
                  );
                  if (flagNeighbors.length === 0) return null;
                  return (
                    <ConnectionList key={key}>
                      {flagNeighbors.map(({ nk, dirLabel, terrain, isBlocked }) => {
                        return (
                          <ConnectionRow key={nk}>
                            <span>
                              {(() => {
                                const entry = terrainList.find((e) => {
                                  return e.id === terrain;
                                });
                                const TerrainIcon = entry?.Icon ?? TERRAIN_ICON[terrain] ?? null;
                                const terrainIconUrl = entry?.iconUrl ?? '';
                                if (TerrainIcon) {
                                  return (
                                    <TerrainIcon
                                      style={{
                                        width: '1rem',
                                        height: '1rem',
                                        verticalAlign: 'middle',
                                        filter: 'brightness(0) invert(1)',
                                        opacity: 0.75,
                                      }}
                                    />
                                  );
                                }
                                if (terrainIconUrl) {
                                  return (
                                    <img
                                      src={terrainIconUrl}
                                      alt={terrain}
                                      style={{
                                        width: '1rem',
                                        height: '1rem',
                                        verticalAlign: 'middle',
                                        filter: 'brightness(0) invert(1)',
                                        opacity: 0.75,
                                      }}
                                    />
                                  );
                                }
                                return (
                                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                    {terrain}
                                  </span>
                                );
                              })()}
                            </span>
                            <span>{dirLabel}</span>
                            {isBlocked && (
                              <span style={{ opacity: 0.45 }}>
                                {isPort ? t('connection.noPort') : t('connection.blocked')}
                              </span>
                            )}
                            <ConnectionBtn
                              $blocked={isBlocked}
                              $color={color}
                              onClick={() => {
                                return handleConnectionToggle(key, nk, isBlocked);
                              }}
                            >
                              {isPort
                                ? isBlocked
                                  ? t('connection.addPort')
                                  : t('connection.removePort')
                                : isBlocked
                                  ? t('connection.restore')
                                  : t('connection.disconnect')}
                            </ConnectionBtn>
                          </ConnectionRow>
                        );
                      })}
                    </ConnectionList>
                  );
                })}
                {tile?.hasTown && (
                  <EditTownBtn
                    data-testid="edit-town-btn"
                    style={{ marginTop: '8px', width: '100%' }}
                    onClick={() => {
                      return selectedKey && dispatch(enterTownEdit(selectedKey));
                    }}
                  >
                    {t('tilePanel.editTown')}
                  </EditTownBtn>
                )}
              </div>

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

              {tileArmies.length > 0 && (
                <div>
                  <SectionLabel>{t('tilePanel.armies')}</SectionLabel>
                  <ArmyList>
                    {tileArmies.map((army) => {
                      return (
                        <ArmyRow
                          key={army.id}
                          data-testid={`select-army-${army.id}`}
                          onClick={() => {
                            return dispatch(selectArmy(army.id));
                          }}
                        >
                          <LandIcon
                            style={{
                              width: '1rem',
                              height: '1rem',
                              filter: 'brightness(0) invert(1)',
                              opacity: 0.75,
                            }}
                          />
                          <ArmyRowName>{army.name || 'Unnamed Army'}</ArmyRowName>
                          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Select →</span>
                        </ArmyRow>
                      );
                    })}
                  </ArmyList>
                </div>
              )}

              <AddArmyBtn
                data-testid="add-army-btn"
                onClick={() => {
                  return tile && dispatch(addArmy({ q: tile.q, r: tile.r }));
                }}
              >
                {t('tilePanel.addArmy')}
              </AddArmyBtn>

              <DeleteBtn data-testid="delete-tile-btn" onClick={handleDelete}>
                {t('tilePanel.deleteTile')}
              </DeleteBtn>
            </>
          )}
        </>
      )}
    </SidePanel>
  );
};

export default TileEditPanel;

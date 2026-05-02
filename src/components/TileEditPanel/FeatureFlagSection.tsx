import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  toggleTileFlag,
  blockConnection,
  unblockConnection,
} from '../../features/tiles/tilesSlice';
import { enterTownEdit } from '../../features/ui/uiSlice';
import { theme } from '../../styles/theme';
import { NEIGHBOR_DIRS, toKey, DEEP_WATER } from '../../utils/hexUtils';
import useTerrainList from '../../hooks/useTerrainList';
import type { TileFlag, TerrainType } from '../../types/domain';
import { SectionLabel } from '../shared/SectionLabel';
import { ButtonGroup } from '../shared/ButtonGroup';
import { HousesIcon } from '../../assets/icons/ui';

const BTN_ICON_PROPS = {
  width: '1em',
  height: '1em',
  style: { marginRight: '0.4em', flexShrink: 0 },
  'aria-hidden': true,
} as const;

const FlagBtn = styled.button<{ $active: boolean; $color: string }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 2px solid
    ${({ $active, $color }) => {
      return $active ? $color : theme.surface.borderFaint;
    }};
  border-radius: 0;
  background: ${({ $active, $color }) => {
    return $active ? `${$color}22` : theme.surface.subtle;
  }};
  color: ${({ theme: t }) => {
    return t.text;
  }};
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    border-color 0.15s,
    background 0.15s;

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
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
`;

const ConnectionBtn = styled.button<{ $blocked: boolean; $color: string }>`
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid
    ${({ $blocked, $color }) => {
      return $blocked ? theme.surface.border : `${$color}66`;
    }};
  background: transparent;
  color: ${({ $blocked, theme: t }) => {
    return $blocked ? t.textMuted : t.text;
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
    color: ${({ theme: t }) => {
      return t.text;
    }};
  }
`;

const EditTownBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: t }) => {
      return t.town.color;
    }}66;
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
      return t.town.color;
    }}22;
    border-color: ${({ theme: t }) => {
      return t.town.color;
    }};
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
  {
    key: 'hasRiver',
    labelKey: 'features.river',
    Icon: theme.icons.features.river,
    color: theme.river.color,
  },
  {
    key: 'hasRoad',
    labelKey: 'features.road',
    Icon: theme.icons.features.road,
    color: theme.road.color,
  },
  {
    key: 'hasTown',
    labelKey: 'features.town',
    Icon: theme.icons.features.port,
    color: theme.town.color,
  },
];

const FeatureFlagSection = (): React.ReactElement | null => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const terrainList = useTerrainList();
  const selectedKey = useAppSelector((state) => {
    return state.ui.selectedTile;
  });
  const tile = useAppSelector((state) => {
    return selectedKey ? (state.tiles[selectedKey] ?? null) : null;
  });
  const allTiles = useAppSelector((state) => {
    return state.tiles;
  });

  if (!tile) return null;

  const handleFlagToggle = (flag: TileFlag) => {
    dispatch(toggleTileFlag({ q: tile.q, r: tile.r, flag }));
  };

  const handleConnectionToggle = (flag: TileFlag, neighborKey: string, isBlocked: boolean) => {
    if (isBlocked) {
      dispatch(unblockConnection({ q: tile.q, r: tile.r, flag, neighborKey }));
    } else {
      dispatch(blockConnection({ q: tile.q, r: tile.r, flag, neighborKey }));
    }
  };

  return (
    <div>
      <SectionLabel>{t('tilePanel.features')}</SectionLabel>
      <ButtonGroup>
        {FLAGS.map(({ key, labelKey, Icon: FlagIcon, color }) => {
          const active = !!tile[key];
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
      </ButtonGroup>

      {FLAGS.map(({ key, labelKey: _labelKey, color }) => {
        const active = !!tile[key];
        const blockedKey = FLAG_BLOCKED_KEY[key];
        const isPort = key === 'hasTown';
        if (!active || !blockedKey) return null;
        const flagNeighbors = NEIGHBOR_DIRS.map((dir, i) => {
          const nk = toKey(tile.q + dir.q, tile.r + dir.r);
          const neighbor = allTiles[nk];
          if (isPort) {
            if (!DEEP_WATER.has(neighbor?.terrain)) return null;
            const isBlocked = (tile[blockedKey] ?? []).includes(nk);
            return {
              nk,
              dirLabel: t(`dir.${DIR_LABELS[i]}`),
              terrain: neighbor.terrain,
              isBlocked,
            };
          } else {
            if (!neighbor?.[key]) return null;
            const isBlocked =
              (tile[blockedKey] ?? []).includes(nk) ||
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
                      const TerrainIcon = entry?.Icon ?? theme.icons.terrain[terrain] ?? null;
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
                      return <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{terrain}</span>;
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

      {tile.hasTown && (
        <EditTownBtn
          data-testid="edit-town-btn"
          style={{ marginTop: '8px', width: '100%' }}
          onClick={() => {
            return selectedKey && dispatch(enterTownEdit(selectedKey));
          }}
        >
          <HousesIcon {...BTN_ICON_PROPS} />
          {t('tilePanel.editTown')}
        </EditTownBtn>
      )}
    </div>
  );
};

export default FeatureFlagSection;

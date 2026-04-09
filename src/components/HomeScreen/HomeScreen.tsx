import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Backdrop, SheetItem, SheetIcon } from '../shared/sheet';
import { LanguageToggle } from '../shared/LanguageToggle';
import { LanguageModal } from '../shared/LanguageModal';
import { SettingsButton } from '../shared/SettingsButton';
import { getAllMaps, createMap, deleteMap, loadMapData } from '../../utils/mapsStorage';
import { loadMap } from '../../features/currentMap/currentMapSlice';
import { importTiles } from '../../features/tiles/tilesSlice';
import { importArmies } from '../../features/armies/armiesSlice';
import { importFactions } from '../../features/factions/factionsSlice';
import {
  importTerrainConfig,
  DEFAULT_TERRAIN_CONFIG,
} from '../../features/terrainConfig/terrainConfigSlice';
import { setScreen } from '../../features/ui/uiSlice';
import { resetViewport } from '../../features/viewport/viewportSlice';
import MapThumbnail from './MapThumbnail';
import { exampleMaps } from '../../data/exampleMaps';
import type { MapEntry, CustomTerrainType } from '../../types/domain';
import type { TilesState } from '../../types/state';

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: ${({ theme }) => {
    return theme.background;
  }};
  overflow-y: auto;
`;

const Header = styled.div`
  padding: 32px 40px 0;

  @media (max-width: 600px) {
    padding: 16px 20px 0;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
`;

const HeaderLeft = styled.div`
  min-width: 0;
`;

const MobileBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-bottom: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  flex-shrink: 0;
  z-index: ${({ theme }) => {
    return theme.zIndex.toolbar;
  }};

  @media (min-width: 601px) {
    display: none;
  }
`;

const MobileBarTitle = styled.span`
  flex: 1;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => {
    return theme.text;
  }};
`;

const Sheet = styled.div<{ $open: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: ${({ $open }) => {
    return $open ? '0' : '-100%';
  }};
  z-index: ${({ theme }) => {
    return theme.zIndex.sheet;
  }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-top: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-radius: 16px 16px 0 0;
  padding: 8px 0 env(safe-area-inset-bottom, 0);
  transition: bottom 0.25s ease;
  max-width: 480px;
  margin: 0 auto;

  @media (min-width: 601px) {
    display: none;
  }
`;

const SheetHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => {
    return theme.panelBorder;
  }};
  margin: 8px auto 12px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => {
    return theme.text;
  }};
  letter-spacing: 0.06em;
  margin: 0 0 4px;

  @media (max-width: 600px) {
    display: none;
  }
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin: 0 0 16px;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  line-height: 1.6;
  margin: 0 0 20px;
  max-width: 560px;
`;

const Notice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 28px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #0f3460;
  background: rgba(15, 52, 96, 0.25);
  font-size: 0.8rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  line-height: 1.5;

  strong {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const Grid = styled.div`
  padding: 0 40px 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.1s;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => {
      return theme.textMuted;
    }};
    transform: translateY(-2px);
  }
`;

const NewCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border-style: dashed;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 2rem;
  flex-direction: column;
  gap: 8px;

  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
    border-color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const NewLabel = styled.span`
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const CardMeta = styled.div`
  padding: 12px 14px;
`;

const CardName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardDate = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin-top: 3px;
`;

const DeleteBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 4px;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.8rem;
  padding: 3px 6px;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s,
    color 0.15s;

  ${Card}:hover & {
    opacity: 1;
  }

  &:hover {
    color: ${({ theme }) => {
      return theme.accent;
    }};
  }

  @media (hover: none) {
    opacity: 1;
  }
`;

const ExampleBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-radius: 4px;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 6px;
`;

const formatDate = (iso: string | undefined, t: TFunction): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return t('home.justNow');
  if (diff < 3600) return t('home.minutesAgo', { n: Math.floor(diff / 60) });
  if (diff < 86400) return t('home.hoursAgo', { n: Math.floor(diff / 3600) });
  if (diff < 7 * 86400) return t('home.daysAgo', { n: Math.floor(diff / 86400) });
  return d.toLocaleDateString();
};

const HomeScreen = (): React.ReactElement => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [maps, setMaps] = useState<MapEntry[]>([]);
  const [tilesCache, setTilesCache] = useState<Record<string, TilesState>>({});
  const [customTerrainsCache, setCustomTerrainsCache] = useState<
    Record<string, CustomTerrainType[]>
  >({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const refreshMaps = useCallback(() => {
    const all = getAllMaps();
    setMaps(all);
    const cache: Record<string, TilesState> = {};
    const ctCache: Record<string, CustomTerrainType[]> = {};
    all.forEach(({ id }) => {
      const data = loadMapData(id);
      cache[id] = data?.tiles ?? {};
      ctCache[id] = data?.terrainConfig?.custom ?? [];
    });
    setTilesCache(cache);
    setCustomTerrainsCache(ctCache);
  }, []);

  useEffect(() => {
    refreshMaps();
  }, [refreshMaps]);

  const handleOpen = (map: MapEntry) => {
    const tiles = loadMapData(map.id)?.tiles ?? {};
    dispatch(importTiles(tiles));
    dispatch(loadMap({ id: map.id, name: map.name }));
    dispatch(resetViewport());
    dispatch(setScreen('editor'));
  };

  const handleNew = () => {
    const map = createMap(t('home.untitledMap'));
    dispatch(importTiles({}));
    dispatch(loadMap({ id: map.id, name: map.name }));
    dispatch(resetViewport());
    dispatch(setScreen('editor'));
  };

  const handleOpenExample = (example: (typeof exampleMaps)[number]) => {
    dispatch(importTiles(example.tiles));
    dispatch(importArmies(example.armies));
    dispatch(importFactions(example.factions));
    dispatch(importTerrainConfig(example.terrainConfig ?? DEFAULT_TERRAIN_CONFIG));
    dispatch(loadMap({ id: null, name: t('home.copyOf', { name: example.name }) }));
    dispatch(resetViewport());
    dispatch(setScreen('editor'));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(t('home.deleteConfirm'))) return;
    deleteMap(id);
    refreshMaps();
  };

  return (
    <Shell>
      {/* Mobile-only top bar */}
      <MobileBar>
        <MobileBarTitle>{t('home.title')}</MobileBarTitle>
        <SettingsButton
          $active={settingsOpen}
          onClick={() => {
            return setSettingsOpen((o) => {
              return !o;
            });
          }}
          aria-label="Settings"
        >
          ⚙
        </SettingsButton>
      </MobileBar>

      <Header>
        <HeaderTop>
          <HeaderLeft>
            <Title>{t('home.title')}</Title>
            <Subtitle>{t('home.subtitle')}</Subtitle>
          </HeaderLeft>
          <LanguageToggle
            onAfterSelect={() => {
              return setSettingsOpen(false);
            }}
          />
        </HeaderTop>
        <Description>{t('home.description')}</Description>
        <Notice>
          <span>⚠️</span>
          <span>
            <strong>{t('home.noticeStorageTitle')}</strong>{' '}
            <Trans
              i18nKey="home.noticeStorageBody"
              values={{
                export: t('home.noticeExport'),
                import: t('home.noticeImport'),
              }}
              components={{ bold: <strong /> }}
            />
          </span>
        </Notice>
      </Header>
      <Grid>
        <NewCard onClick={handleNew} data-testid="new-map-card">
          <span>＋</span>
          <NewLabel>{t('home.newMap')}</NewLabel>
        </NewCard>
        {[...maps]
          .sort((a, b) => {
            return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
          })
          .map((map) => {
            return (
              <Card
                key={map.id}
                data-testid={`map-card-${map.id}`}
                onClick={() => {
                  return handleOpen(map);
                }}
              >
                <MapThumbnail
                  tilesData={tilesCache[map.id] ?? {}}
                  customTerrains={customTerrainsCache[map.id] ?? []}
                />
                <DeleteBtn
                  data-testid={`delete-map-${map.id}`}
                  onClick={(e) => {
                    return handleDelete(e, map.id);
                  }}
                >
                  ✕
                </DeleteBtn>
                <CardMeta>
                  <CardName data-testid={`map-name-${map.id}`}>{map.name}</CardName>
                  <CardDate>{t('home.edited', { time: formatDate(map.updatedAt, t) })}</CardDate>
                </CardMeta>
              </Card>
            );
          })}
        {exampleMaps.map((example) => {
          return (
            <Card
              key={example.id}
              data-testid={`example-card-${example.id}`}
              onClick={() => {
                return handleOpenExample(example);
              }}
            >
              <MapThumbnail
                tilesData={example.tiles}
                customTerrains={example.terrainConfig?.custom ?? []}
              />
              <ExampleBadge>{t('home.example')}</ExampleBadge>
              <CardMeta>
                <CardName>{example.name}</CardName>
                <CardDate>{t('home.builtIn')}</CardDate>
              </CardMeta>
            </Card>
          );
        })}
      </Grid>

      {/* Mobile settings sheet */}
      <Backdrop
        $open={settingsOpen}
        onClick={() => {
          return setSettingsOpen(false);
        }}
      />
      <Sheet $open={settingsOpen}>
        <SheetHandle />
        <SheetItem
          onClick={() => {
            setSettingsOpen(false);
            setLangModalOpen(true);
          }}
        >
          <SheetIcon>🌐</SheetIcon>
          {t('toolbar.languageLabel')}
        </SheetItem>
      </Sheet>

      <LanguageModal
        open={langModalOpen}
        onClose={() => {
          return setLangModalOpen(false);
        }}
        onAfterSelect={() => {
          return setSettingsOpen(false);
        }}
      />
    </Shell>
  );
};

export default HomeScreen;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Backdrop, SheetItem, SheetIcon } from '../shared/sheet';
import { LanguageToggle } from '../shared/LanguageToggle';
import { LanguageModal } from '../shared/LanguageModal';
import { SettingsButton } from '../shared/SettingsButton';
import {
  SettingsIcon,
  WarningIcon,
  CloseIcon,
  GlobeIcon,
  HexIcon,
  UploadIcon,
} from '../../assets/icons/ui';
import {
  getAllMaps,
  createMap,
  deleteMap,
  loadMapData,
  saveMapData,
  type LoadedMapData,
} from '../../utils/mapsStorage';
import { captureThumbnail } from '../../utils/captureThumbnail';
import { skipNextSyncLoad } from '../../hooks/useLocalStorageSync';
import { slugify } from '../../utils/slugify';
import { loadMap } from '../../features/currentMap/currentMapSlice';
import { importTiles } from '../../features/tiles/tilesSlice';
import { importArmies } from '../../features/armies/armiesSlice';
import { importFactions } from '../../features/factions/factionsSlice';
import {
  importTerrainConfig,
  DEFAULT_TERRAIN_CONFIG,
} from '../../features/terrainConfig/terrainConfigSlice';
import { resetViewport } from '../../features/viewport/viewportSlice';
import MapThumbnail from './MapThumbnail';
import { exampleMaps } from '../../data/exampleMaps';
import { theme } from '../../styles/theme';
import type { MapEntry } from '../../types/domain';

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
  border: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return `${theme.panelBorder}40`;
  }};
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

const importPulse = keyframes`
  0%   { border-color: ${theme.ui.successImport}; box-shadow: 0 0 0 4px ${theme.ui.successImport}59; }
  20%  { border-color: ${theme.ui.successImport}; box-shadow: 0 0 0 8px ${theme.ui.successImport}26; }
  40%  { border-color: ${theme.ui.successImport}; box-shadow: 0 0 0 4px ${theme.ui.successImport}59; }
  60%  { border-color: ${theme.ui.successImport}; box-shadow: 0 0 0 6px ${theme.ui.successImport}33; }
  80%  { border-color: ${theme.ui.successImport}; box-shadow: 0 0 0 3px ${theme.ui.successImport}40; }
  100% { border-color: ${theme.ui.successImport}; box-shadow: none; }
`;

const Card = styled.div<{ $highlighted?: boolean }>`
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

  ${({ $highlighted }) => {
    return (
      $highlighted &&
      css`
        animation: ${importPulse} 5s ease-out forwards;
      `
    );
  }}

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
  background: ${({ theme }) => {
    return theme.surface.overlayMedium;
  }};
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

const HeaderRight = styled.div`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
`;

const ImportBtn = styled.button`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    background: transparent;
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.15s,
      color 0.15s;
    &:hover {
      background: ${({ theme }) => {
        return theme.panelBorder;
      }};
      color: ${({ theme }) => {
        return theme.text;
      }};
    }
  }
`;

const PageContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
`;

const HomeHelpBtn = styled.button`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    background: transparent;
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.15s,
      color 0.15s;
    &:hover {
      background: ${({ theme }) => {
        return theme.panelBorder;
      }};
      color: ${({ theme }) => {
        return theme.text;
      }};
    }
  }
`;

const ImportedBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${({ theme }) => {
    return `${theme.ui.successImport}d9`;
  }};
  border-radius: 4px;
  color: #000;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 6px;
`;

const ExampleBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${({ theme }) => {
    return theme.surface.overlayHeavy;
  }};
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

const WarningBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme }) => {
      return theme.accent;
    }};
  background: ${({ theme }) => {
    return `${theme.accent}18`;
  }};
  font-size: 0.82rem;
  color: ${({ theme }) => {
    return theme.text;
  }};
  line-height: 1.5;
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
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const locationWarning = (location.state as { warning?: string } | null)?.warning ?? null;
  const [maps, setMaps] = useState<MapEntry[]>([]);
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string | undefined>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [newlyImportedId, setNewlyImportedId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const refreshMaps = useCallback(() => {
    const all = getAllMaps();
    setMaps(all);
    const thumbCache: Record<string, string | undefined> = {};
    all.forEach(({ id }) => {
      const data = loadMapData(id);
      if (!data) return;
      if (data.thumbnail) {
        thumbCache[id] = data.thumbnail;
      } else if (Object.keys(data.tiles).length > 0) {
        // Generate and persist the thumbnail for maps that don't have one yet
        const thumbnail = captureThumbnail(data.tiles, data.terrainConfig?.custom);
        if (thumbnail) {
          thumbCache[id] = thumbnail;
          saveMapData(id, { ...data, thumbnail } as LoadedMapData);
        }
      }
    });
    // Generate thumbnails for built-in example maps (not persisted, just cached in state)
    exampleMaps.forEach((example) => {
      const thumb = captureThumbnail(example.tiles, example.terrainConfig?.custom);
      if (thumb) thumbCache[example.id] = thumb;
    });
    setThumbnailCache(thumbCache);
  }, []);

  useEffect(() => {
    refreshMaps();
  }, [refreshMaps]);

  const handleOpen = (map: MapEntry) => {
    const data = loadMapData(map.id);
    dispatch(importTiles(data?.tiles ?? {}));
    dispatch(importArmies(data?.armies ?? {}));
    dispatch(importFactions(data?.factions ?? []));
    dispatch(importTerrainConfig(data?.terrainConfig ?? DEFAULT_TERRAIN_CONFIG));
    skipNextSyncLoad();
    dispatch(loadMap({ id: map.id, name: map.name }));
    dispatch(resetViewport());
    navigate(`/map/${slugify(map.name)}`);
  };

  const handleNew = () => {
    const map = createMap(t('home.untitledMap'));
    dispatch(importTiles({}));
    dispatch(importArmies({}));
    dispatch(importFactions([]));
    dispatch(importTerrainConfig(DEFAULT_TERRAIN_CONFIG));
    dispatch(loadMap({ id: map.id, name: map.name }));
    dispatch(resetViewport());
    navigate(`/map/${slugify(map.name)}`);
  };

  const handleOpenExample = (example: (typeof exampleMaps)[number]) => {
    dispatch(importTiles(example.tiles));
    dispatch(importArmies(example.armies));
    dispatch(importFactions(example.factions));
    dispatch(importTerrainConfig(example.terrainConfig ?? DEFAULT_TERRAIN_CONFIG));
    dispatch(loadMap({ id: null, name: t('home.copyOf', { name: example.name }) }));
    dispatch(resetViewport());
    navigate('/map/example', { state: { examplePreloaded: true } });
  };

  const handleHelpClick = () => {
    setSettingsOpen(false);
    navigate('/help');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(t('home.deleteConfirm'))) return;
    deleteMap(id);
    refreshMaps();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target!.result as string);
        if (!data || typeof data !== 'object' || !data.tiles) {
          alert('Invalid JSON file.');
          return;
        }
        // Deduplicate name against existing maps
        const desired = (data.name || '').trim() || t('home.untitledMap');
        const takenNames = new Set(
          getAllMaps().map((m) => {
            return m.name;
          })
        );
        let finalName = desired;
        if (takenNames.has(finalName)) {
          let n = 2;
          while (takenNames.has(`${desired} (${n})`)) n++;
          finalName = `${desired} (${n})`;
        }
        // Create a new map entry and save the imported data into it
        const newMap = createMap(finalName);
        saveMapData(newMap.id, {
          tiles: data.tiles ?? {},
          armies: data.armies ?? {},
          factions: data.factions ?? [],
          terrainConfig: data.terrainConfig,
          thumbnail: data.thumbnail,
        });
        refreshMaps();
        // Highlight the new card for 5 seconds
        setNewlyImportedId(newMap.id);
        setTimeout(() => {
          setNewlyImportedId(null);
        }, 5000);
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Shell>
      {/* Mobile-only top bar */}
      <MobileBar>
        <MobileBarTitle>
          <HexIcon width="1em" height="1em" aria-hidden style={{ marginRight: '0.4em' }} />
          {t('home.title')}
        </MobileBarTitle>
        <SettingsButton
          $active={settingsOpen}
          onClick={() => {
            return setSettingsOpen((o) => {
              return !o;
            });
          }}
          aria-label="Settings"
        >
          <SettingsIcon width="1.1em" height="1.1em" aria-hidden />
        </SettingsButton>
      </MobileBar>

      <PageContent>
        <Header>
          <HeaderTop>
            <HeaderLeft>
              <Title>
                <HexIcon width="1em" height="1em" aria-hidden style={{ marginRight: '0.35em' }} />
                {t('home.title')}
              </Title>
              <Subtitle>{t('home.subtitle')}</Subtitle>
            </HeaderLeft>
            <HeaderRight>
              <ImportBtn
                data-testid="home-import-btn"
                onClick={() => {
                  return fileInput.current?.click();
                }}
              >
                <UploadIcon width="1em" height="1em" aria-hidden style={{ marginRight: '0.4em' }} />
                {t('toolbar.importJSON')}
              </ImportBtn>
              <HomeHelpBtn onClick={handleHelpClick}>? {t('help.helpButtonLabel')}</HomeHelpBtn>
              <LanguageToggle
                onAfterSelect={() => {
                  return setSettingsOpen(false);
                }}
              />
            </HeaderRight>
          </HeaderTop>
          <Description>{t('home.description')}</Description>
          {locationWarning === 'mapNotFound' && (
            <WarningBanner>
              <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center' }}>
                <WarningIcon width="1.2em" height="1.2em" />
              </span>
              <span>{t('home.warningMapNotFound')}</span>
            </WarningBanner>
          )}
          {locationWarning === 'pageNotFound' && (
            <WarningBanner>
              <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center' }}>
                <WarningIcon width="1.2em" height="1.2em" />
              </span>
              <span>{t('home.warningPageNotFound')}</span>
            </WarningBanner>
          )}
          <Notice>
            <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center' }}>
              <WarningIcon width="1.2em" height="1.2em" />
            </span>
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
              const isNew = map.id === newlyImportedId;
              return (
                <Card
                  key={map.id}
                  data-testid={`map-card-${map.id}`}
                  $highlighted={isNew}
                  onClick={() => {
                    return handleOpen(map);
                  }}
                >
                  <MapThumbnail thumbnail={thumbnailCache[map.id]} />
                  {isNew && <ImportedBadge>{t('home.imported')}</ImportedBadge>}
                  <DeleteBtn
                    data-testid={`delete-map-${map.id}`}
                    onClick={(e) => {
                      return handleDelete(e, map.id);
                    }}
                  >
                    <CloseIcon width="1em" height="1em" aria-hidden />
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
                <MapThumbnail thumbnail={thumbnailCache[example.id]} />
                <ExampleBadge>{t('home.example')}</ExampleBadge>
                <CardMeta>
                  <CardName>{example.name}</CardName>
                  <CardDate>{t('home.builtIn')}</CardDate>
                </CardMeta>
              </Card>
            );
          })}
        </Grid>
      </PageContent>

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
          data-testid="home-import-sheet-btn"
          onClick={() => {
            setSettingsOpen(false);
            fileInput.current?.click();
          }}
        >
          <SheetIcon>
            <UploadIcon aria-hidden />
          </SheetIcon>
          {t('toolbar.importJSON')}
        </SheetItem>
        <SheetItem onClick={handleHelpClick}>
          <SheetIcon>?</SheetIcon>
          {t('help.helpButtonLabel')}
        </SheetItem>
        <SheetItem
          onClick={() => {
            setSettingsOpen(false);
            setLangModalOpen(true);
          }}
        >
          <SheetIcon>
            <GlobeIcon aria-hidden />
          </SheetIcon>
          {t('toolbar.languageLabel')}
        </SheetItem>
      </Sheet>

      <input
        ref={fileInput}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

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

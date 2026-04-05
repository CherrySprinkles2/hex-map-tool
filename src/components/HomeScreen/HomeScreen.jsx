import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { getAllMaps, createMap, deleteMap, loadMapData } from '../../utils/mapsStorage';
import { loadMap } from '../../features/currentMap/currentMapSlice';
import { importTiles } from '../../features/tiles/tilesSlice';
import { importArmies } from '../../features/armies/armiesSlice';
import { importFactions } from '../../features/factions/factionsSlice';
import { setScreen } from '../../features/ui/uiSlice';
import { resetViewport } from '../../features/viewport/viewportSlice';
import MapThumbnail from './MapThumbnail';
import { exampleMaps } from '../../data/exampleMaps';

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
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => {
    return theme.text;
  }};
  letter-spacing: 0.06em;
  margin: 0 0 4px;
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

const formatDate = (iso, t) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return t('home.justNow');
  if (diff < 3600) return t('home.minutesAgo', { n: Math.floor(diff / 60) });
  if (diff < 86400) return t('home.hoursAgo', { n: Math.floor(diff / 3600) });
  if (diff < 7 * 86400) return t('home.daysAgo', { n: Math.floor(diff / 86400) });
  return d.toLocaleDateString();
};

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [maps, setMaps] = useState([]);
  const [tilesCache, setTilesCache] = useState({});

  const refreshMaps = useCallback(() => {
    const all = getAllMaps();
    setMaps(all);
    // Load tiles data for thumbnails
    const cache = {};
    all.forEach(({ id }) => {
      cache[id] = loadMapData(id)?.tiles ?? {};
    });
    setTilesCache(cache);
  }, []);

  useEffect(() => {
    refreshMaps();
  }, [refreshMaps]);

  const handleOpen = (map) => {
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

  const handleOpenExample = (example) => {
    // Load example tiles into Redux but don't create a localStorage entry yet.
    // useLocalStorageSync will lazily create a copy on the first real tile change.
    dispatch(importTiles(example.tiles));
    dispatch(importArmies(example.armies));
    dispatch(importFactions(example.factions));
    dispatch(loadMap({ id: null, name: t('home.copyOf', { name: example.name }) }));
    dispatch(resetViewport());
    dispatch(setScreen('editor'));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t('home.deleteConfirm'))) return;
    deleteMap(id);
    refreshMaps();
  };

  return (
    <Shell>
      <Header>
        <Title>{t('home.title')}</Title>
        <Subtitle>{t('home.subtitle')}</Subtitle>
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
        <NewCard onClick={handleNew}>
          <span>＋</span>
          <NewLabel>{t('home.newMap')}</NewLabel>
        </NewCard>
        {exampleMaps.map((example) => {
          return (
            <Card
              key={example.id}
              onClick={() => {
                return handleOpenExample(example);
              }}
            >
              <MapThumbnail tilesData={example.tiles} />
              <ExampleBadge>{t('home.example')}</ExampleBadge>
              <CardMeta>
                <CardName>{example.name}</CardName>
                <CardDate>{t('home.builtIn')}</CardDate>
              </CardMeta>
            </Card>
          );
        })}
        {[...maps].reverse().map((map) => {
          return (
            <Card
              key={map.id}
              onClick={() => {
                return handleOpen(map);
              }}
            >
              <MapThumbnail tilesData={tilesCache[map.id] ?? {}} />
              <DeleteBtn
                onClick={(e) => {
                  return handleDelete(e, map.id);
                }}
              >
                ✕
              </DeleteBtn>
              <CardMeta>
                <CardName>{map.name}</CardName>
                <CardDate>{t('home.edited', { time: formatDate(map.updatedAt, t) })}</CardDate>
              </CardMeta>
            </Card>
          );
        })}
      </Grid>
    </Shell>
  );
};

export default HomeScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { getAllMaps, createMap, deleteMap, loadMapTiles } from '../../utils/mapsStorage';
import { loadMap } from '../../features/currentMap/currentMapSlice';
import { importTiles } from '../../features/tiles/tilesSlice';
import { setScreen } from '../../features/ui/uiSlice';
import { resetViewport } from '../../features/viewport/viewportSlice';
import MapThumbnail from './MapThumbnail';
import { exampleMaps } from '../../data/exampleMaps';

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: ${({ theme }) => theme.background};
  overflow-y: auto;
`;

const Header = styled.div`
  padding: 32px 40px 0;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  letter-spacing: 0.06em;
  margin: 0 0 4px;
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0 0 16px;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textMuted};
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
  color: ${({ theme }) => theme.textMuted};
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.text};
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
  border: 2px solid ${({ theme }) => theme.panelBorder};
  background: ${({ theme }) => theme.panelBackground};
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.textMuted};
    transform: translateY(-2px);
  }
`;

const NewCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border-style: dashed;
  color: ${({ theme }) => theme.textMuted};
  font-size: 2rem;
  flex-direction: column;
  gap: 8px;

  &:hover {
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.text};
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
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardDate = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  margin-top: 3px;
`;

const DeleteBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.5);
  border: none;
  border-radius: 4px;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.8rem;
  padding: 3px 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;

  ${Card}:hover & {
    opacity: 1;
  }

  &:hover {
    color: ${({ theme }) => theme.accent};
  }

  @media (hover: none) {
    opacity: 1;
  }
`;

const ExampleBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.6);
  border: 1px solid ${({ theme }) => theme.panelBorder};
  border-radius: 4px;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 6px;
`;

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
};

const HomeScreen = () => {
  const dispatch = useDispatch();
  const [maps, setMaps] = useState([]);
  const [tilesCache, setTilesCache] = useState({});

  const refreshMaps = useCallback(() => {
    const all = getAllMaps();
    setMaps(all);
    // Load tiles data for thumbnails
    const cache = {};
    all.forEach(({ id }) => {
      cache[id] = loadMapTiles(id) ?? {};
    });
    setTilesCache(cache);
  }, []);

  useEffect(() => { refreshMaps(); }, [refreshMaps]);

  const handleOpen = (map) => {
    const tiles = loadMapTiles(map.id) ?? {};
    dispatch(importTiles(tiles));
    dispatch(loadMap({ id: map.id, name: map.name }));
    dispatch(resetViewport());
    dispatch(setScreen('editor'));
  };

  const handleNew = () => {
    const map = createMap();
    dispatch(importTiles({}));
    dispatch(loadMap({ id: map.id, name: map.name }));
    dispatch(resetViewport());
    dispatch(setScreen('editor'));
  };

  const handleOpenExample = (example) => {
    // Load example tiles into Redux but don't create a localStorage entry yet.
    // useLocalStorageSync will lazily create a copy on the first real tile change.
    dispatch(importTiles(example.tiles));
    dispatch(loadMap({ id: null, name: `Copy of ${example.name}` }));
    dispatch(resetViewport());
    dispatch(setScreen('editor'));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this map? This cannot be undone.')) return;
    deleteMap(id);
    refreshMaps();
  };

  return (
    <Shell theme={theme}>
      <Header>
        <Title theme={theme}>⬡ Hex Map Tool</Title>
        <Subtitle theme={theme}>Select a map to edit, or create a new one.</Subtitle>
        <Description theme={theme}>
          Design worlds and command armies. Build hex maps for wargames, campaigns, and strategic
          planning — place terrain, found towns, deploy forces, and trace the lines of battle.
          All rendered live as SVG, saved automatically in your browser.
        </Description>
        <Notice theme={theme}>
          <span>⚠️</span>
          <span>
            <strong>Maps are stored in your browser's local storage.</strong> They will be lost if
            you clear your browser data, switch browsers, or use a different device.
            Use <strong>Export JSON</strong> inside the editor to save a backup, and{' '}
            <strong>Import JSON</strong> to restore it.
          </span>
        </Notice>
      </Header>
      <Grid>
        <NewCard theme={theme} onClick={handleNew}>
          <span>＋</span>
          <NewLabel>New Map</NewLabel>
        </NewCard>
        {exampleMaps.map((example) => (
          <Card key={example.id} theme={theme} onClick={() => handleOpenExample(example)}>
            <MapThumbnail tilesData={example.tiles} />
            <ExampleBadge theme={theme}>Example</ExampleBadge>
            <CardMeta>
              <CardName theme={theme}>{example.name}</CardName>
              <CardDate theme={theme}>Built-in — opens as a copy</CardDate>
            </CardMeta>
          </Card>
        ))}
        {[...maps].reverse().map((map) => (
          <Card key={map.id} theme={theme} onClick={() => handleOpen(map)}>
            <MapThumbnail tilesData={tilesCache[map.id] ?? {}} />
            <DeleteBtn theme={theme} onClick={(e) => handleDelete(e, map.id)}>✕</DeleteBtn>
            <CardMeta>
              <CardName theme={theme}>{map.name}</CardName>
              <CardDate theme={theme}>Edited {formatDate(map.updatedAt)}</CardDate>
            </CardMeta>
          </Card>
        ))}
      </Grid>
    </Shell>
  );
};

export default HomeScreen;

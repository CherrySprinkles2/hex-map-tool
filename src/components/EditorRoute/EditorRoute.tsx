import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loadMap } from '../../features/currentMap/currentMapSlice';
import { importTiles } from '../../features/tiles/tilesSlice';
import { importArmies } from '../../features/armies/armiesSlice';
import { importFactions } from '../../features/factions/factionsSlice';
import {
  importTerrainConfig,
  DEFAULT_TERRAIN_CONFIG,
} from '../../features/terrainConfig/terrainConfigSlice';
import { resetViewport } from '../../features/viewport/viewportSlice';
import { loadMapData, getMapBySlug } from '../../utils/mapsStorage';
import { skipNextSyncLoad } from '../../hooks/useLocalStorageSync';
import { slugify } from '../../utils/slugify';
import Editor from '../Editor/Editor';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { loadExampleMapData, exampleMapsMeta } from '../../data/exampleMaps';

// EditorRoute handles two URL patterns:
//   /map/example      — unsaved example map
//   /map/:mapSlug     — saved map identified by its slug
const EditorRoute = (): React.ReactElement | null => {
  const { mapSlug } = useParams<{ mapSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const currentMapId = useAppSelector((state) => {
    return state.currentMap.id;
  });
  const currentMapName = useAppSelector((state) => {
    return state.currentMap.name;
  });
  const [ready, setReady] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (mapSlug === 'example') {
      // Data should already be in Redux (navigated from HomeScreen)
      const preloaded = Boolean(
        (location.state as Record<string, unknown> | null)?.examplePreloaded
      );
      if (preloaded || currentMapId !== null || ready) {
        setReady(true);
        return;
      }
      // Deep link to /map/example — load first example map on demand
      const meta = exampleMapsMeta[0];
      if (!meta) {
        setRedirect('/');
        return;
      }
      loadExampleMapData(meta.id)
        .then((data) => {
          dispatch(loadMap({ id: null, name: data.name }));
          dispatch(importTiles(data.tiles));
          dispatch(importArmies(data.armies));
          dispatch(importFactions(data.factions));
          dispatch(importTerrainConfig(data.terrainConfig ?? DEFAULT_TERRAIN_CONFIG));
          dispatch(resetViewport());
          setReady(true);
        })
        .catch(() => {
          setRedirect('/');
        });
      return;
    }

    if (!mapSlug) {
      setRedirect('/');
      return;
    }

    // Map is already loaded (navigated from HomeScreen — skipNextSyncLoad was set)
    const entry = getMapBySlug(mapSlug);
    if (entry && currentMapId === entry.id) {
      setReady(true);
      return;
    }

    // Deep link — load map data from localStorage
    if (!entry) {
      navigate('/', { replace: true, state: { warning: 'mapNotFound' } });
      return;
    }

    const data = loadMapData(entry.id);
    // loadMap first so useLocalStorageSync null-mapId guard fires before any data imports
    dispatch(
      loadMap({ id: entry.id, name: entry.name, orientation: data?.orientation ?? 'pointy-top' })
    );
    skipNextSyncLoad();
    dispatch(importTiles(data?.tiles ?? {}));
    dispatch(importArmies(data?.armies ?? {}));
    dispatch(importFactions(data?.factions ?? []));
    dispatch(importTerrainConfig(data?.terrainConfig ?? DEFAULT_TERRAIN_CONFIG));
    dispatch(resetViewport());
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSlug]);

  // Replace URL with correct slug when map is renamed
  useEffect(() => {
    if (!ready || !currentMapId || mapSlug === 'example') return;
    const correctSlug = slugify(currentMapName);
    if (mapSlug !== correctSlug) {
      navigate(`/map/${correctSlug}`, { replace: true });
    }
  }, [currentMapName, currentMapId, ready, mapSlug, navigate]);

  // Example map first-save: id transitions null → real ID
  useEffect(() => {
    if (!ready || mapSlug !== 'example' || currentMapId === null) return;
    const newSlug = slugify(currentMapName);
    navigate(`/map/${newSlug}`, { replace: true });
  }, [currentMapId, mapSlug, ready, currentMapName, navigate]);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <Editor />
    </ErrorBoundary>
  );
};

export default EditorRoute;

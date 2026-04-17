import React, { useMemo, useDeferredValue } from 'react';
import { theme } from '../../styles/theme';
import {
  renderFlagPaths,
  renderRoadPaths,
  computeAllRiverCurves,
  renderCausewayPaths,
  renderTownIcons,
  renderTownLabels,
  renderPorts,
} from '../../utils/overlayHelpers';
import { useAppSelector } from '../../app/hooks';
import { buildDeepWaterSet, getNeighbors, toKey } from '../../utils/hexUtils';
import type { Army } from '../../types/domain';

interface WaterOverlayProps {
  visibleKeys: Set<string>;
  armiesByTile: Record<string, Army[]>;
}

const WaterOverlay = React.memo(
  ({ visibleKeys, armiesByTile }: WaterOverlayProps): React.ReactElement => {
    const tiles = useAppSelector((state) => {
      return state.tiles;
    });
    const deferredTiles = useDeferredValue(tiles);

    const customTerrains = useAppSelector((state) => {
      return state.terrainConfig.custom;
    });
    const factions = useAppSelector((state) => {
      return state.factions;
    });
    const deepWaterSet = useMemo(() => {
      return buildDeepWaterSet(customTerrains);
    }, [customTerrains]);

    const factionColorMap = useMemo(() => {
      const map: Record<string, string> = {};
      factions.forEach((f) => {
        map[f.id] = f.color;
      });
      return map;
    }, [factions]);

    // Expand visible set by 1 tile so overlays at viewport edges render correctly
    // (rivers/roads need neighbor data for connection detection).
    const expandedKeys = useMemo(() => {
      const expanded = new Set<string>(visibleKeys);
      visibleKeys.forEach((key) => {
        const tile = deferredTiles[key];
        if (!tile) return;
        getNeighbors(tile.q, tile.r).forEach((n) => {
          const nk = toKey(n.q, n.r);
          if (deferredTiles[nk]) expanded.add(nk);
        });
      });
      return expanded;
    }, [visibleKeys, deferredTiles]);

    const riverPaths = useMemo(() => {
      return renderFlagPaths(deferredTiles, 'hasRiver', theme.river, deepWaterSet, expandedKeys);
    }, [deferredTiles, deepWaterSet, expandedKeys]);
    const riverCurvesByTile = useMemo(() => {
      return computeAllRiverCurves(deferredTiles, deepWaterSet, expandedKeys);
    }, [deferredTiles, deepWaterSet, expandedKeys]);
    const roadPaths = useMemo(() => {
      return renderRoadPaths(
        deferredTiles,
        theme.road,
        riverCurvesByTile,
        deepWaterSet,
        expandedKeys
      );
    }, [deferredTiles, riverCurvesByTile, deepWaterSet, expandedKeys]);
    const causewayPaths = useMemo(() => {
      return renderCausewayPaths(deferredTiles, theme.causeway, deepWaterSet, expandedKeys);
    }, [deferredTiles, deepWaterSet, expandedKeys]);
    const townIcons = useMemo(() => {
      return renderTownIcons(
        deferredTiles,
        armiesByTile ?? {},
        factionColorMap,
        deepWaterSet,
        expandedKeys
      );
    }, [deferredTiles, armiesByTile, factionColorMap, deepWaterSet, expandedKeys]);
    const townLabels = useMemo(() => {
      return renderTownLabels(deferredTiles, armiesByTile ?? {}, deepWaterSet, expandedKeys);
    }, [deferredTiles, armiesByTile, deepWaterSet, expandedKeys]);
    const ports = useMemo(() => {
      return renderPorts(deferredTiles, deepWaterSet, expandedKeys);
    }, [deferredTiles, deepWaterSet, expandedKeys]);
    return (
      <g>
        {riverPaths}
        {roadPaths}
        {causewayPaths}
        {townIcons}
        {ports}
        {townLabels}
      </g>
    );
  }
);

export default WaterOverlay;

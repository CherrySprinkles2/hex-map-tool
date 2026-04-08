import React, { useMemo } from 'react';
import { theme } from '../../styles/theme';
import {
  renderFlagPaths,
  renderRoadPaths,
  computeAllRiverCurves,
  renderCausewayPaths,
  renderWaterEdges,
  renderTownIcons,
  renderTownLabels,
  renderPorts,
} from '../../utils/overlayHelpers';
import { useAppSelector } from '../../app/hooks';
import { buildDeepWaterSet } from '../../utils/hexUtils';
import type { Army } from '../../types/domain';
import type { TilesState } from '../../types/state';

interface WaterOverlayProps {
  tiles: TilesState;
  armiesByTile: Record<string, Army[]>;
}

const WaterOverlay = React.memo(
  ({ tiles, armiesByTile }: WaterOverlayProps): React.ReactElement => {
    const customTerrains = useAppSelector((state) => {
      return state.terrainConfig.custom;
    });
    const deepWaterSet = useMemo(() => {
      return buildDeepWaterSet(customTerrains);
    }, [customTerrains]);

    const waterEdgesLake = useMemo(() => {
      return renderWaterEdges(tiles, 'lake', deepWaterSet);
    }, [tiles, deepWaterSet]);
    const waterEdgesOcean = useMemo(() => {
      return renderWaterEdges(tiles, 'ocean', deepWaterSet);
    }, [tiles, deepWaterSet]);
    const riverPaths = useMemo(() => {
      return renderFlagPaths(tiles, 'hasRiver', theme.river, deepWaterSet);
    }, [tiles, deepWaterSet]);
    const riverCurvesByTile = useMemo(() => {
      return computeAllRiverCurves(tiles, deepWaterSet);
    }, [tiles, deepWaterSet]);
    const roadPaths = useMemo(() => {
      return renderRoadPaths(tiles, theme.road, riverCurvesByTile, deepWaterSet);
    }, [tiles, riverCurvesByTile, deepWaterSet]);
    const causewayPaths = useMemo(() => {
      return renderCausewayPaths(tiles, theme.causeway, deepWaterSet);
    }, [tiles, deepWaterSet]);
    const townIcons = useMemo(() => {
      return renderTownIcons(tiles, armiesByTile ?? {}, deepWaterSet);
    }, [tiles, armiesByTile, deepWaterSet]);
    const townLabels = useMemo(() => {
      return renderTownLabels(tiles, armiesByTile ?? {}, deepWaterSet);
    }, [tiles, armiesByTile, deepWaterSet]);
    const ports = useMemo(() => {
      return renderPorts(tiles, deepWaterSet);
    }, [tiles, deepWaterSet]);
    return (
      <g>
        {waterEdgesLake}
        {waterEdgesOcean}
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

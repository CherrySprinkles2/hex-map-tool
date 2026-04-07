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
import type { Army } from '../../types/domain';
import type { TilesState } from '../../types/state';

interface WaterOverlayProps {
  tiles: TilesState;
  armiesByTile: Record<string, Army[]>;
}

const WaterOverlay = React.memo(
  ({ tiles, armiesByTile }: WaterOverlayProps): React.ReactElement => {
    const waterEdgesLake = useMemo(() => {
      return renderWaterEdges(tiles, 'lake');
    }, [tiles]);
    const waterEdgesOcean = useMemo(() => {
      return renderWaterEdges(tiles, 'ocean');
    }, [tiles]);
    const riverPaths = useMemo(() => {
      return renderFlagPaths(tiles, 'hasRiver', theme.river);
    }, [tiles]);
    // River curves computed after river paths so roads can detect intersections.
    // Memoised on the same tiles dependency — same recompute boundary as riverPaths.
    const riverCurvesByTile = useMemo(() => {
      return computeAllRiverCurves(tiles);
    }, [tiles]);
    const roadPaths = useMemo(() => {
      return renderRoadPaths(tiles, theme.road, riverCurvesByTile);
    }, [tiles, riverCurvesByTile]);
    const causewayPaths = useMemo(() => {
      return renderCausewayPaths(tiles, theme.causeway);
    }, [tiles]);
    const townIcons = useMemo(() => {
      return renderTownIcons(tiles, armiesByTile ?? {});
    }, [tiles, armiesByTile]);
    const townLabels = useMemo(() => {
      return renderTownLabels(tiles, armiesByTile ?? {});
    }, [tiles, armiesByTile]);
    const ports = useMemo(() => {
      return renderPorts(tiles);
    }, [tiles]);

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

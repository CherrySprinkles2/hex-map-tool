import React, { useMemo } from 'react';
import { theme } from '../../styles/theme';
import {
  renderFlagPaths,
  renderCausewayPaths,
  renderWaterEdges,
  renderTowns,
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
    const roadPaths = useMemo(() => {
      return renderFlagPaths(tiles, 'hasRoad', theme.road);
    }, [tiles]);
    const causewayPaths = useMemo(() => {
      return renderCausewayPaths(tiles, theme.causeway);
    }, [tiles]);
    const towns = useMemo(() => {
      return renderTowns(tiles, armiesByTile ?? {});
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
        {towns}
        {ports}
      </g>
    );
  }
);

export default WaterOverlay;

import React, { useMemo } from 'react';
import { DEEP_WATER, toKey } from '../../utils/hexUtils';
import { theme } from '../../styles/theme';
import {
  renderFlagPaths,
  renderWaterEdges,
  renderTowns,
  renderPorts,
} from '../../utils/overlayHelpers';
import WaterCap from './WaterCap';

const WaterOverlay = React.memo(({ tiles, armiesByTile }) => {
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
  const towns = useMemo(() => {
    return renderTowns(tiles, armiesByTile ?? {});
  }, [tiles, armiesByTile]);
  const ports = useMemo(() => {
    return renderPorts(tiles);
  }, [tiles]);
  const waterTiles = useMemo(() => {
    return Object.values(tiles).filter(({ terrain }) => {
      return DEEP_WATER.has(terrain);
    });
  }, [tiles]);

  return (
    <g>
      {waterEdgesLake}
      {waterEdgesOcean}
      {riverPaths}
      {roadPaths}
      {towns}
      {/* Water caps: re-draw lake/ocean fill on top of rivers/roads so water texture covers them */}
      {waterTiles.map(({ q, r, terrain }) => {
        return <WaterCap key={`water-cap-${toKey(q, r)}`} q={q} r={r} terrain={terrain} />;
      })}
      {ports}
    </g>
  );
});

export default WaterOverlay;

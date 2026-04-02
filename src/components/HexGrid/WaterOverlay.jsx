import React from 'react';
import { axialToPixel, edgeMidpoint, NEIGHBOR_DIRS, toKey } from './HexUtils';
import { theme } from '../../styles/theme';

// Renders river connector lines and lake merged-edge outlines
const WaterOverlay = ({ tiles }) => {
  const tileList = Object.values(tiles);
  const riverLines = [];
  const lakeEdges = [];

  tileList.forEach(({ q, r, terrain }) => {
    const { x, y } = axialToPixel(q, r);

    NEIGHBOR_DIRS.forEach((dir, i) => {
      const nq = q + dir.q;
      const nr = r + dir.r;
      const nKey = toKey(nq, nr);
      const neighbor = tiles[nKey];

      if (terrain === 'river' && neighbor?.terrain === 'river') {
        const mid = edgeMidpoint(x, y, i);
        riverLines.push(
          <line
            key={`river-${toKey(q,r)}-${i}`}
            x1={x} y1={y}
            x2={mid.x} y2={mid.y}
            stroke={theme.terrain.river.color}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.85}
            style={{ pointerEvents: 'none' }}
          />
        );
      }

      if (terrain === 'lake' && (!neighbor || neighbor.terrain !== 'lake')) {
        // Draw the outer border edge for lake tiles where the neighbour is NOT a lake
        const { hexCorners } = require('./HexUtils');
        const corners = hexCorners(x, y);
        const a = corners[i];
        const b = corners[(i + 1) % 6];
        lakeEdges.push(
          <line
            key={`lake-edge-${toKey(q,r)}-${i}`}
            x1={a.x} y1={a.y}
            x2={b.x} y2={b.y}
            stroke={theme.terrain.lake.color}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.9}
            style={{ pointerEvents: 'none' }}
          />
        );
      }
    });
  });

  return (
    <g>
      {lakeEdges}
      {riverLines}
    </g>
  );
};

export default WaterOverlay;
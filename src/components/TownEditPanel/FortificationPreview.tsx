import React from 'react';
import { theme } from '../../styles/theme';
import type { Fortification } from '../../types/domain';
import { TownIcon } from '../../assets/icons/town';

// Preview geometry — edit R to resize the preview circle.
const CX = 30;
const CY = 30;
const R = 22;
const MARK_INNER = R - 2;
const MARK_OUTER = R + 2;
const MARK_STROKE_W = 1.5;

interface Props {
  fortification: Fortification;
}

const FortificationPreview = ({ fortification }: Props): React.ReactElement => {
  const cfg = fortification === 'none' ? null : theme.town.fortification[fortification];

  const marks = cfg
    ? Array.from({ length: cfg.markCount }, (_, i) => {
        const angle = (i / cfg.markCount) * 2 * Math.PI;
        return (
          <line
            key={i}
            x1={CX + MARK_INNER * Math.cos(angle)}
            y1={CY + MARK_INNER * Math.sin(angle)}
            x2={CX + MARK_OUTER * Math.cos(angle)}
            y2={CY + MARK_OUTER * Math.sin(angle)}
            stroke={cfg.markColor}
            strokeWidth={MARK_STROKE_W}
          />
        );
      })
    : [];

  return (
    <svg viewBox="0 0 60 60" width="60" height="60">
      <TownIcon
        x={CX - R}
        y={CY - R}
        width={R * 2}
        height={R * 2}
        groundColor={theme.town.groundColor}
        buildingColor={theme.town.buildingColor}
        streetColor={theme.town.streetColor}
      />
      {cfg && (
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={cfg.wallColor}
          strokeWidth={cfg.wallWidth}
        />
      )}
      {marks}
    </svg>
  );
};

export default FortificationPreview;

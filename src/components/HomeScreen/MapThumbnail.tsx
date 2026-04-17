import React from 'react';
import { theme } from '../../styles/theme';

const THUMB_W = 220;
const THUMB_H = 160;

interface MapThumbnailProps {
  thumbnail?: string;
}

const MapThumbnail = ({ thumbnail }: MapThumbnailProps): React.ReactElement => {
  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt=""
        style={{
          display: 'block',
          width: '100%',
          height: THUMB_H,
          borderRadius: '6px 6px 0 0',
          objectFit: 'contain',
          background: theme.background,
        }}
      />
    );
  }

  return (
    <svg
      width="100%"
      height={THUMB_H}
      style={{
        display: 'block',
        borderRadius: '6px 6px 0 0',
        background: theme.background,
        pointerEvents: 'none',
      }}
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={theme.textMuted}
        fontSize="11"
        fontFamily="sans-serif"
      >
        Empty map
      </text>
    </svg>
  );
};

export default MapThumbnail;

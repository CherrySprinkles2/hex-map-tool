import React from 'react';

interface Props {
  size?: number;
}

// Three-hex cluster: two at top, one highlighted at bottom centre.
// Hex geometry: pointy-top, radius 9, centres at (15,17), (33,17), (24,32).
const HelpCanvasIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top-left hex */}
      <polygon
        points="22.8,21.5 15,26 7.2,21.5 7.2,12.5 15,8 22.8,12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />
      {/* Top-right hex */}
      <polygon
        points="40.8,21.5 33,26 25.2,21.5 25.2,12.5 33,8 40.8,12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />
      {/* Bottom-centre hex — highlighted (selected) */}
      <polygon
        points="31.8,36.5 24,41 16.2,36.5 16.2,27.5 24,23 31.8,27.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
      />
      {/* Selection dot at centre of bottom hex */}
      <circle cx="24" cy="32" r="2.5" fill="currentColor" />
    </svg>
  );
};

export default HelpCanvasIcon;

import React from 'react';

interface Props {
  size?: number;
}

// A single hexagon with a stylised mountain range inside.
const HelpTerrainIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hex outline */}
      <polygon
        points="24,4 41,13.5 41,32.5 24,42 7,32.5 7,13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Mountain silhouette */}
      <polyline
        points="10,33 18,20 22,26 28,14 37,33"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Snow cap on the tallest peak */}
      <polyline
        points="25.5,18 28,14 30.5,18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
};

export default HelpTerrainIcon;

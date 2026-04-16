import React from 'react';

interface Props {
  size?: number;
}

// A hexagon containing a simplified town/building silhouette.
const HelpTownsIcon = ({ size = 48 }: Props): React.ReactElement => {
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
      {/* Central tower */}
      <rect
        x="20"
        y="16"
        width="8"
        height="14"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Tower roof */}
      <polyline
        points="19,16 24,11 29,16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Left smaller building */}
      <rect
        x="12"
        y="22"
        width="7"
        height="8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <polyline
        points="11.5,22 15.5,18 19.5,22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right smaller building */}
      <rect
        x="29"
        y="22"
        width="7"
        height="8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <polyline
        points="28.5,22 32.5,18 36.5,22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Ground line */}
      <line
        x1="10"
        y1="30"
        x2="38"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
};

export default HelpTownsIcon;

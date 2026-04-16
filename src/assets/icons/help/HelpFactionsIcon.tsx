import React from 'react';

interface Props {
  size?: number;
}

// Two adjacent hexagons with different fill intensities separated by a border,
// suggesting two territories meeting.
const HelpFactionsIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left hex — territory A */}
      <polygon
        points="20,6 28,10.5 28,19.5 20,24 12,19.5 12,10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.35"
      />
      {/* Right hex — territory B */}
      <polygon
        points="34,14 42,18.5 42,27.5 34,32 26,27.5 26,18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Third hex — unassigned / contested */}
      <polygon
        points="20,24 28,28.5 28,37.5 20,42 12,37.5 12,28.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeDasharray="3,2"
        fill="none"
        opacity="0.5"
      />
      {/* Flag pin on left hex */}
      <line
        x1="20"
        y1="11"
        x2="20"
        y2="20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <polygon points="20,11 25,13.5 20,16" fill="currentColor" opacity="0.8" />
    </svg>
  );
};

export default HelpFactionsIcon;

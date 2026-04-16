import React from 'react';

interface Props {
  size?: number;
}

// Two hex tiles side-by-side with a curved path crossing the shared edge.
const HelpRiversRoadsIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left hex */}
      <polygon
        points="19,7 26,11 26,19 19,23 12,19 12,11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Right hex */}
      <polygon
        points="35,7 42,11 42,19 35,23 28,19 28,11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Curved path (river) crossing both tiles — offset toward top of edge */}
      <path
        d="M 13,13 C 17,13 22,14 27,15 C 32,16 37,15 41,15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Curved path (road) crossing both tiles — offset toward bottom of edge */}
      <path
        d="M 13,17 C 17,17 22,18 27,17 C 32,16 37,17 41,17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3,2"
        fill="none"
        opacity="0.6"
      />
      {/* Lower single hex showing a causeway on water */}
      <polygon
        points="27,28 34,32 34,40 27,44 20,40 20,32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M 21,36 C 24,36 30,36 33,36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default HelpRiversRoadsIcon;

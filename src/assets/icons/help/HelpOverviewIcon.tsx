import React from 'react';

interface Props {
  size?: number;
}

const HelpOverviewIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Single prominent hexagon */}
      <polygon
        points="24,4 41,13.5 41,32.5 24,42 7,32.5 7,13.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Inner hex detail */}
      <polygon
        points="24,12 34,17.5 34,28.5 24,34 14,28.5 14,17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
};

export default HelpOverviewIcon;

import React from 'react';

const RoadIcon = (props: React.SVGProps<SVGSVGElement>): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <line
        x1="8"
        y1="2"
        x2="6"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="2"
        x2="18"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="3"
        x2="12"
        y2="7"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
      <line
        x1="12"
        y1="10"
        x2="12"
        y2="14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
      <line
        x1="12"
        y1="17"
        x2="12"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
    </svg>
  );
};

export default RoadIcon;

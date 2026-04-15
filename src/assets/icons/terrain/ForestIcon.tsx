import React from 'react';

const ForestIcon = (props: React.SVGProps<SVGSVGElement>): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <polygon
        points="7,4 2,14 12,14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <polygon
        points="7,9 3,17 11,17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="7"
        y1="17"
        x2="7"
        y2="21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <polygon
        points="17,6 13,15 21,15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <polygon
        points="17,11 14,18 20,18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="17"
        y1="18"
        x2="17"
        y2="21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ForestIcon;

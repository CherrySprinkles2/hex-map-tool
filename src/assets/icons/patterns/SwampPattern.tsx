import React from 'react';

const SwampPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-swamp" x="0" y="0" width="18" height="16" patternUnits="userSpaceOnUse">
      <line
        x1="3"
        y1="14"
        x2="3"
        y2="6"
        stroke="rgba(0,40,0,0.28)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="8"
        x2="1"
        y2="5"
        stroke="rgba(0,40,0,0.22)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="8"
        x2="5"
        y2="5"
        stroke="rgba(0,40,0,0.22)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="14"
        x2="12"
        y2="7"
        stroke="rgba(0,40,0,0.28)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="9"
        x2="10"
        y2="6"
        stroke="rgba(0,40,0,0.22)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="9"
        x2="14"
        y2="6"
        stroke="rgba(0,40,0,0.22)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M0,14.5 C3,13.5 6,15.5 9,14.5 C12,13.5 15,15.5 18,14.5"
        stroke="rgba(0,40,60,0.28)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
    </pattern>
  );
};

export default SwampPattern;

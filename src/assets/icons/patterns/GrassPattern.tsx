import React from 'react';

const GrassPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-grass" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <line
        x1="2"
        y1="11"
        x2="4"
        y2="6"
        stroke="rgba(0,80,0,0.28)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="11"
        x2="6"
        y2="7"
        stroke="rgba(0,80,0,0.18)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="11"
        x2="11"
        y2="6"
        stroke="rgba(0,80,0,0.28)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="11"
        x2="13"
        y2="7"
        stroke="rgba(0,80,0,0.18)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="5"
        x2="7"
        y2="1"
        stroke="rgba(0,80,0,0.15)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </pattern>
  );
};

export default GrassPattern;

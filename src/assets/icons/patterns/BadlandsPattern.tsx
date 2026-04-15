import React from 'react';

const BadlandsPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-badlands" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <line
        x1="2"
        y1="5"
        x2="7"
        y2="9"
        stroke="rgba(40,0,0,0.28)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="9"
        x2="5"
        y2="14"
        stroke="rgba(40,0,0,0.28)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="14"
        x2="10"
        y2="17"
        stroke="rgba(40,0,0,0.22)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="2"
        x2="16"
        y2="7"
        stroke="rgba(40,0,0,0.28)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="7"
        x2="13"
        y2="12"
        stroke="rgba(40,0,0,0.28)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="13"
        y1="12"
        x2="18"
        y2="16"
        stroke="rgba(40,0,0,0.22)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="9"
        x2="13"
        y2="12"
        stroke="rgba(40,0,0,0.18)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </pattern>
  );
};

export default BadlandsPattern;

import React from 'react';

const MountainPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-mountain" x="0" y="0" width="22" height="13" patternUnits="userSpaceOnUse">
      <polyline
        points="0,11 5.5,5 11,11 16.5,5 22,11"
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="0,7 5.5,1 11,7 16.5,1 22,7"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </pattern>
  );
};

export default MountainPattern;

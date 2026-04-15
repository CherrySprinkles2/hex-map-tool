import React from 'react';

const OceanPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-ocean" x="0" y="0" width="50" height="18" patternUnits="userSpaceOnUse">
      <path
        d="M0,5 C7,2 14,8 21,5 C28,2 35,8 42,5 C45,3.5 47.5,2.5 50,5"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M0,12 C7,9 14,15 21,12 C28,9 35,15 42,12 C45,10.5 47.5,9.5 50,12"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </pattern>
  );
};

export default OceanPattern;

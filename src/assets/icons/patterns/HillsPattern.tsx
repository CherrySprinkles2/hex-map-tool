import React from 'react';

const HillsPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-hills" x="0" y="0" width="24" height="14" patternUnits="userSpaceOnUse">
      <path
        d="M0,12 Q6,5 12,12 Q18,5 24,12"
        stroke="rgba(60,30,0,0.22)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0,8 Q6,1 12,8 Q18,1 24,8"
        stroke="rgba(60,30,0,0.12)"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </pattern>
  );
};

export default HillsPattern;

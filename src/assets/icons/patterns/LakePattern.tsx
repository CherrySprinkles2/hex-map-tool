import React from 'react';

const LakePattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-lake" x="0" y="0" width="30" height="10" patternUnits="userSpaceOnUse">
      <path
        d="M0,3 C4,1.5 8,4.5 12,3 C16,1.5 20,4.5 24,3 C26,2.3 28,1.8 30,3"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M0,7.5 C4,6 8,9 12,7.5 C16,6 20,9 24,7.5 C26,6.8 28,6.3 30,7.5"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </pattern>
  );
};

export default LakePattern;

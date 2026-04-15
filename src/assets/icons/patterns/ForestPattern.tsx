import React from 'react';

const ForestPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-forest" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2.8" fill="rgba(0,30,0,0.32)" />
      <circle cx="11.5" cy="4" r="2" fill="rgba(0,30,0,0.22)" />
      <circle cx="7.5" cy="10.5" r="2.8" fill="rgba(0,30,0,0.32)" />
      <circle cx="1" cy="11" r="1.6" fill="rgba(0,30,0,0.18)" />
      <circle cx="14" cy="11" r="1.6" fill="rgba(0,30,0,0.18)" />
    </pattern>
  );
};

export default ForestPattern;

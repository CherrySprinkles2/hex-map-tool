import React from 'react';

const DesertPattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-desert" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="4" r="1" fill="rgba(80,50,0,0.22)" />
      <circle cx="10" cy="2" r="0.8" fill="rgba(80,50,0,0.18)" />
      <circle cx="7" cy="9" r="1.1" fill="rgba(80,50,0,0.25)" />
      <circle cx="14" cy="7" r="0.8" fill="rgba(80,50,0,0.18)" />
      <circle cx="2" cy="13" r="0.9" fill="rgba(80,50,0,0.20)" />
      <circle cx="11" cy="13" r="1" fill="rgba(80,50,0,0.22)" />
      <circle cx="5" cy="7" r="0.7" fill="rgba(80,50,0,0.15)" />
    </pattern>
  );
};

export default DesertPattern;

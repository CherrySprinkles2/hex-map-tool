import React from 'react';

const JunglePattern = (): React.ReactElement => {
  return (
    <pattern id="pattern-jungle" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2.5" fill="rgba(0,40,0,0.35)" />
      <circle cx="9" cy="2.5" r="2" fill="rgba(0,40,0,0.28)" />
      <circle cx="6" cy="8" r="2.5" fill="rgba(0,40,0,0.35)" />
      <circle cx="1" cy="9" r="1.5" fill="rgba(0,40,0,0.22)" />
      <circle cx="11" cy="8.5" r="1.5" fill="rgba(0,40,0,0.22)" />
      <circle cx="5" cy="5.5" r="1.2" fill="rgba(0,40,0,0.20)" />
    </pattern>
  );
};

export default JunglePattern;

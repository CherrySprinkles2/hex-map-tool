import React from 'react';

const FarmIcon = (props: React.SVGProps<SVGSVGElement>): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <line x1="2" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.3" />
      <line x1="2" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="1.3" />
      <line x1="2" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.3" />
      <line x1="2" y1="19" x2="22" y2="19" stroke="currentColor" strokeWidth="1.3" />
      <line
        x1="8"
        y1="5"
        x2="8"
        y2="21"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeDasharray="2 2"
      />
      <line
        x1="16"
        y1="5"
        x2="16"
        y2="21"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeDasharray="2 2"
      />
    </svg>
  );
};

export default FarmIcon;

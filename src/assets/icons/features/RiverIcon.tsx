import React from 'react';

const RiverIcon = (props: React.SVGProps<SVGSVGElement>): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4,3 C5,7 8,8 7,12 C6,16 9,17 8,21"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13,3 C15,7 12,10 14,14 C16,18 14,19 16,21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default RiverIcon;

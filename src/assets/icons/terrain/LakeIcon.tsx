import React from 'react';

const LakeIcon = (props: React.SVGProps<SVGSVGElement>): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <ellipse cx="12" cy="13" rx="9" ry="6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M7,12 C8.5,10.5 10,13.5 12,12 C14,10.5 15.5,13.5 17,12"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9,15 C10,13.8 11,15.2 12,14.5 C13,13.8 14,15.2 15,14.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default LakeIcon;

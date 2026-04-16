import React from 'react';

interface Props {
  size?: number;
}

// A downward arrow descending into a file/box, representing export/save.
const HelpSavingIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* File / box outline */}
      <rect
        x="9"
        y="28"
        width="30"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Horizontal line inside box (slot) */}
      <line
        x1="15"
        y1="35"
        x2="33"
        y2="35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Arrow shaft */}
      <line
        x1="24"
        y1="6"
        x2="24"
        y2="26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Arrow head */}
      <polyline
        points="17,20 24,28 31,20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default HelpSavingIcon;

import React from 'react';

interface Props {
  size?: number;
}

// A crossed sword and shield.
const HelpArmiesIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sword — blade */}
      <line
        x1="13"
        y1="35"
        x2="35"
        y2="13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Sword — crossguard */}
      <line
        x1="17"
        y1="25"
        x2="23"
        y2="31"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Sword — pommel */}
      <circle cx="11" cy="37" r="2.5" fill="currentColor" />
      {/* Shield body */}
      <path
        d="M 27,17 L 36,17 L 36,27 Q 36,34 31.5,37 Q 27,34 27,27 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Shield boss */}
      <circle cx="31.5" cy="26" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
};

export default HelpArmiesIcon;

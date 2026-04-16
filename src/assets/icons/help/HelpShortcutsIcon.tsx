import React from 'react';

interface Props {
  size?: number;
}

// A stylised keyboard key cap with a letter on it.
const HelpShortcutsIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Large key */}
      <rect
        x="6"
        y="10"
        width="36"
        height="24"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Key inner bevel shadow */}
      <rect
        x="9"
        y="13"
        width="30"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.35"
      />
      {/* Ctrl label */}
      <text
        x="24"
        y="26"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="9"
        fontFamily="monospace"
        fill="currentColor"
        letterSpacing="0.5"
      >
        Ctrl
      </text>
      {/* Key bottom shadow line */}
      <rect x="6" y="31" width="36" height="5" rx="3" fill="currentColor" fillOpacity="0.18" />
    </svg>
  );
};

export default HelpShortcutsIcon;

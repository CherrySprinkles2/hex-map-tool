import React from 'react';

interface Props {
  size?: number;
}

// Two overlapping map/document outlines with a small hex detail.
const HelpMapsIcon = ({ size = 48 }: Props): React.ReactElement => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back document */}
      <rect
        x="14"
        y="6"
        width="26"
        height="32"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.08"
        opacity="0.6"
      />
      {/* Front document */}
      <rect
        x="8"
        y="12"
        width="26"
        height="32"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.14"
      />
      {/* Small hex on front document */}
      <polygon
        points="21,23 25,25.3 25,29.7 21,32 17,29.7 17,25.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      {/* Horizontal lines suggesting map content */}
      <line
        x1="12"
        y1="38"
        x2="30"
        y2="38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="12"
        y1="42"
        x2="24"
        y2="42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
};

export default HelpMapsIcon;

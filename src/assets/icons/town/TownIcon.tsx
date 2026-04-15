import React from 'react';
import type { TownIconProps } from './VillageIcon';

const TownIcon = ({
  groundColor = '#7ec850',
  buildingColor = '#012731',
  streetColor = '#a08060',
  ...rest
}: TownIconProps): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60" {...rest}>
      <defs>
        <clipPath id="town-clip">
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      </defs>
      <circle cx="30" cy="30" r="30" fill={groundColor} />
      <g clipPath="url(#town-clip)">
        <rect x="0" y="27" width="60" height="5" fill={streetColor} />
        <rect x="27" y="0" width="5" height="29" fill={streetColor} />
        <rect x="4" y="4" width="20" height="19" fill={buildingColor} />
        <rect x="34" y="6" width="9" height="8" fill={buildingColor} />
        <rect x="46" y="6" width="9" height="8" fill={buildingColor} />
        <rect x="36" y="17" width="9" height="7" fill={buildingColor} />
        <rect x="5" y="34" width="9" height="8" fill={buildingColor} />
        <rect x="17" y="34" width="9" height="8" fill={buildingColor} />
        <rect x="34" y="34" width="9" height="8" fill={buildingColor} />
        <rect x="46" y="34" width="9" height="8" fill={buildingColor} />
        <rect x="10" y="45" width="9" height="8" fill={buildingColor} />
        <rect x="38" y="45" width="9" height="8" fill={buildingColor} />
      </g>
    </svg>
  );
};

export default TownIcon;

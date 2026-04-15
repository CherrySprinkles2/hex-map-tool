import React from 'react';
import type { TownIconProps } from './VillageIcon';

const CityIcon = ({
  groundColor = '#7ec850',
  buildingColor = '#012731',
  streetColor = '#a08060',
  courtyardColor = '#5aaa44',
  ...rest
}: TownIconProps): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60" {...rest}>
      <defs>
        <clipPath id="city-clip">
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      </defs>
      <circle cx="30" cy="30" r="30" fill={groundColor} />
      <g clipPath="url(#city-clip)">
        <rect x="0" y="19" width="60" height="2" fill={streetColor} />
        <rect x="0" y="39" width="60" height="2" fill={streetColor} />
        <rect x="19" y="0" width="2" height="60" fill={streetColor} />
        <rect x="39" y="0" width="2" height="60" fill={streetColor} />
        <rect x="21" y="21" width="18" height="18" fill={buildingColor} />
        <rect x="25" y="25" width="10" height="10" fill={courtyardColor} />
        <rect x="21" y="4" width="18" height="14" fill={buildingColor} />
        <rect x="4" y="21" width="4" height="4" fill={buildingColor} />
        <rect x="9" y="21" width="4" height="4" fill={buildingColor} />
        <rect x="14" y="21" width="4" height="4" fill={buildingColor} />
        <rect x="4" y="27" width="4" height="4" fill={buildingColor} />
        <rect x="9" y="27" width="4" height="4" fill={buildingColor} />
        <rect x="14" y="27" width="4" height="4" fill={buildingColor} />
        <rect x="4" y="33" width="4" height="4" fill={buildingColor} />
        <rect x="9" y="33" width="4" height="4" fill={buildingColor} />
        <rect x="14" y="33" width="4" height="4" fill={buildingColor} />
        <rect x="41" y="21" width="4" height="4" fill={buildingColor} />
        <rect x="46" y="21" width="4" height="4" fill={buildingColor} />
        <rect x="51" y="21" width="4" height="4" fill={buildingColor} />
        <rect x="41" y="27" width="4" height="4" fill={buildingColor} />
        <rect x="46" y="27" width="4" height="4" fill={buildingColor} />
        <rect x="51" y="27" width="4" height="4" fill={buildingColor} />
        <rect x="41" y="33" width="4" height="4" fill={buildingColor} />
        <rect x="46" y="33" width="4" height="4" fill={buildingColor} />
        <rect x="51" y="33" width="4" height="4" fill={buildingColor} />
        <rect x="21" y="41" width="4" height="4" fill={buildingColor} />
        <rect x="27" y="41" width="4" height="4" fill={buildingColor} />
        <rect x="33" y="41" width="4" height="4" fill={buildingColor} />
        <rect x="21" y="47" width="4" height="4" fill={buildingColor} />
        <rect x="27" y="47" width="4" height="4" fill={buildingColor} />
        <rect x="33" y="47" width="4" height="4" fill={buildingColor} />
        <rect x="5" y="5" width="4" height="4" fill={buildingColor} />
        <rect x="10" y="5" width="4" height="4" fill={buildingColor} />
        <rect x="5" y="10" width="4" height="4" fill={buildingColor} />
        <rect x="46" y="5" width="4" height="4" fill={buildingColor} />
        <rect x="51" y="5" width="4" height="4" fill={buildingColor} />
        <rect x="51" y="10" width="4" height="4" fill={buildingColor} />
        <rect x="5" y="46" width="4" height="4" fill={buildingColor} />
        <rect x="5" y="51" width="4" height="4" fill={buildingColor} />
        <rect x="10" y="51" width="4" height="4" fill={buildingColor} />
        <rect x="51" y="46" width="4" height="4" fill={buildingColor} />
        <rect x="46" y="51" width="4" height="4" fill={buildingColor} />
        <rect x="51" y="51" width="4" height="4" fill={buildingColor} />
      </g>
    </svg>
  );
};

export default CityIcon;

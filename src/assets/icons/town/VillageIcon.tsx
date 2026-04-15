import React from 'react';

export interface TownIconProps extends React.SVGProps<SVGSVGElement> {
  groundColor?: string;
  buildingColor?: string;
  streetColor?: string;
  courtyardColor?: string;
}

const VillageIcon = ({
  groundColor = '#7ec850',
  buildingColor = '#012731',
  streetColor = '#a08060',
  ...rest
}: TownIconProps): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60" {...rest}>
      <defs>
        <clipPath id="village-clip">
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      </defs>
      <circle cx="30" cy="30" r="30" fill={groundColor} />
      <g clipPath="url(#village-clip)">
        <rect x="0" y="27" width="60" height="5" fill={streetColor} />
        <rect x="10" y="11" width="16" height="12" fill={buildingColor} />
        <rect x="34" y="35" width="12" height="10" fill={buildingColor} />
      </g>
    </svg>
  );
};

export default VillageIcon;

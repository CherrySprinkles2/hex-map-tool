import React from 'react';
import { useTheme } from 'styled-components';
import type { TownSize } from '../../types/domain';
import { VillageIcon, TownIcon, CityIcon } from '../../assets/icons/town';
import type { AppTheme } from '../../types/theme';

interface Props {
  townSize: TownSize;
}

const TownSizePreview = ({ townSize }: Props): React.ReactElement => {
  const theme = useTheme() as AppTheme;
  const commonProps = {
    width: 60,
    height: 60,
    groundColor: theme.town.groundColor,
    buildingColor: theme.town.buildingColor,
    streetColor: theme.town.streetColor,
  };

  if (townSize === 'village') return <VillageIcon {...commonProps} />;
  if (townSize === 'city')
    return <CityIcon {...commonProps} courtyardColor={theme.town.courtyardColor} />;
  return <TownIcon {...commonProps} />;
};

export default TownSizePreview;

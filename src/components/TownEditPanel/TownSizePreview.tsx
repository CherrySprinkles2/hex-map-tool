import React from 'react';
import type { TownSize } from '../../types/domain';
import { VillageIcon, TownIcon, CityIcon } from '../../assets/icons/town';

interface Props {
  townSize: TownSize;
}

const TownSizePreview = ({ townSize }: Props): React.ReactElement => {
  const commonProps = { width: 60, height: 60 };

  if (townSize === 'village') return <VillageIcon {...commonProps} />;
  if (townSize === 'city') return <CityIcon {...commonProps} />;
  return <TownIcon {...commonProps} />;
};

export default TownSizePreview;

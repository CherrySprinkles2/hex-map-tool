import React from 'react';
import type { TownSize } from '../../types/domain';
import villageUrl from './assets/village.svg';
import townUrl from './assets/town.svg';
import cityUrl from './assets/city.svg';

const ASSET: Record<TownSize, string> = {
  village: villageUrl,
  town: townUrl,
  city: cityUrl,
};

interface Props {
  townSize: TownSize;
}

const TownSizePreview = ({ townSize }: Props): React.ReactElement => {
  return <img src={ASSET[townSize]} width="60" height="60" alt="" />;
};

export default TownSizePreview;

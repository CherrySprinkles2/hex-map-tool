import React from 'react';
import GrassIcon from './GrassIcon';
import FarmIcon from './FarmIcon';
import ForestIcon from './ForestIcon';
import MountainIcon from './MountainIcon';
import LakeIcon from './LakeIcon';
import OceanIcon from './OceanIcon';

export { GrassIcon, FarmIcon, ForestIcon, MountainIcon, LakeIcon, OceanIcon };

export const TERRAIN_ICON: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  grass: GrassIcon,
  farm: FarmIcon,
  forest: ForestIcon,
  mountain: MountainIcon,
  lake: LakeIcon,
  ocean: OceanIcon,
};

import { createSelector } from '@reduxjs/toolkit';
import { useAppSelector } from '../app/hooks';
import { theme } from '../styles/theme';
import type { RootState } from '../app/store';
import type { CustomTerrainType, TerrainConfig } from '../types/domain';

export interface TerrainEntry {
  id: string;
  color: string;
  icon: string;
  name: string;
  isCustom: boolean;
}

const BUILTIN_IDS = ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'] as const;

const selectTerrainList = createSelector(
  (state: RootState) => {
    return state.terrainConfig;
  },
  (terrainConfig: TerrainConfig) => {
    const { disabled, custom, order } = terrainConfig;
    const builtinEntries: Record<string, TerrainEntry> = {};
    BUILTIN_IDS.forEach((id) => {
      if (!disabled.includes(id)) {
        builtinEntries[id] = {
          id,
          color: theme.terrain[id].color,
          icon: theme.terrain[id].icon,
          name: id,
          isCustom: false,
        };
      }
    });
    const customEntries: Record<string, TerrainEntry> = {};
    custom.forEach((ct: CustomTerrainType) => {
      customEntries[ct.id] = {
        id: ct.id,
        color: ct.color,
        icon: ct.icon,
        name: ct.name,
        isCustom: true,
      };
    });
    const result: TerrainEntry[] = [];
    order.forEach((id) => {
      if (builtinEntries[id]) result.push(builtinEntries[id]);
      else if (customEntries[id]) result.push(customEntries[id]);
    });
    Object.values(builtinEntries).forEach((e) => {
      if (!order.includes(e.id)) result.push(e);
    });
    Object.values(customEntries).forEach((e) => {
      if (!order.includes(e.id)) result.push(e);
    });
    return result;
  }
);

const useTerrainList = (): TerrainEntry[] => {
  return useAppSelector(selectTerrainList);
};

export default useTerrainList;

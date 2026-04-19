import type { Tile, Army, Faction, TerrainConfig } from './domain';

export type TilesState = Record<string, Tile>;
export type ArmiesState = Record<string, Army>;
export type FactionsState = Faction[];
export type TerrainConfigState = TerrainConfig;

export type MapMode = 'terrain' | 'faction' | 'terrain-paint';

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface UiState {
  selectedTile: string | null;
  selectedArmyId: string | null;
  placingArmy: boolean;
  movingArmyId: string | null;
  mapMode: MapMode;
  factionsOpen: boolean;
  activeFactionId: string | null;
  activePaintBrush: string | null;
  showShortcuts: boolean;
  editingTownTile: string | null;
}

export interface CurrentMapState {
  id: string | null;
  name: string;
}

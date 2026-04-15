export type TerrainType = string;

export type PatternKey =
  | 'grass'
  | 'farm'
  | 'forest'
  | 'mountain'
  | 'lake'
  | 'ocean'
  | 'desert'
  | 'swamp'
  | 'jungle'
  | 'hills'
  | 'badlands'
  | 'none';

export interface CustomTerrainType {
  id: string;
  name: string;
  color: string;
  patternKey: PatternKey;
  isDeepWater: boolean;
  icon: string;
}

export interface TerrainConfig {
  disabled: string[];
  custom: CustomTerrainType[];
  order: string[];
}

export type TileFlag = 'hasRiver' | 'hasRoad' | 'hasTown';

export type Fortification = 'none' | 'palisade' | 'stone';

export type TownSize = 'village' | 'town' | 'city';

export interface Tile {
  q: number;
  r: number;
  terrain: TerrainType;
  hasRiver: boolean;
  hasRoad: boolean;
  riverBlocked: string[];
  roadBlocked: string[];
  hasTown: boolean;
  townName: string;
  fortification?: Fortification;
  townSize?: TownSize;
  portBlocked: string[];
  notes: string;
  factionId: string | null;
}

export interface Army {
  id: string;
  q: number;
  r: number;
  name: string;
  composition: string;
  notes?: string;
  factionId: string | null;
}

export interface Faction {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface MapEntry {
  id: string;
  name: string;
  updatedAt: string;
}

export interface MapData {
  version: 1 | 2;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
  terrainConfig?: TerrainConfig;
}

export interface MapEnvelope {
  name: string;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
  terrainConfig?: TerrainConfig;
}

export interface ExampleMap {
  id: string;
  name: string;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
}

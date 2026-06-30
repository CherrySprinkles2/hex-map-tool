export type TerrainType = string;

export type HexOrientation = 'pointy-top' | 'flat-top';

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

/** A named river or road style — colour + stroke width. */
export interface FeatureVariety {
  id: string;
  name: string;
  color: string;
  width: number;
}

export interface TerrainConfig {
  disabled: string[];
  custom: CustomTerrainType[];
  order: string[];
  /** Named river styles; always includes the reserved `river-default` entry. */
  riverTypes: FeatureVariety[];
  /** Named road styles; always includes the reserved `road-default` entry. */
  roadTypes: FeatureVariety[];
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
  /** River variety id; absent → the default river style. */
  riverTypeId?: string;
  /** Road variety id; absent → the default road style. */
  roadTypeId?: string;
  riverBlocked: string[];
  roadBlocked: string[];
  hasTown: boolean;
  townName: string;
  fortification?: Fortification;
  townSize?: TownSize;
  /** Settlement has been razed — draws a flame over the town icon (cosmetic). */
  razed?: boolean;
  portBlocked: string[];
  notes: string;
  factionId: string | null;
  /** Foraging level (0–FORAGE_MAX); 0 = unforaged. */
  forageLevel: number;
}

export interface Army {
  id: string;
  q: number;
  r: number;
  name: string;
  composition: string;
  notes?: string;
  factionId: string | null;
  subTileX?: number;
  subTileY?: number;
  insideTown?: boolean;
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
  /** ISO timestamp the map was first created — used as the age clock for never-exported maps. */
  createdAt?: string;
  /** ISO timestamp of the last JSON backup export; absent → never exported. */
  lastExportedAt?: string;
}

export interface MapData {
  version: 1 | 2;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
  terrainConfig?: TerrainConfig;
  thumbnail?: string;
  orientation?: HexOrientation;
}

export interface MapEnvelope {
  name: string;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
  terrainConfig?: TerrainConfig;
  thumbnail?: string;
  orientation?: HexOrientation;
}

export interface ExampleMap {
  id: string;
  name: string;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
}

export type TerrainType = 'grass' | 'farm' | 'forest' | 'mountain' | 'lake' | 'ocean';

export type TileFlag = 'hasRiver' | 'hasRoad' | 'hasTown';

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
  version: 1;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
}

export interface MapEnvelope {
  name: string;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
}

export interface ExampleMap {
  id: string;
  name: string;
  tiles: Record<string, Tile>;
  armies: Record<string, Army>;
  factions: Faction[];
}

// Example map data loaded from the bundled JSON.
// Each JSON file uses the export envelope: { name, tiles, armies, factions }.
// Tile defaults are applied here so the rest of the app never has to guard for missing properties.
import rawSmall from './example-map.json';
import rawLarge from './large-map.json';
import type { Tile, Army, Faction, TerrainConfig } from '../types/domain';
import type { TilesState, ArmiesState } from '../types/state';

type RawTile = Partial<Tile> & { q: number; r: number };
type RawArmy = Partial<Army> & { id: string; q: number; r: number };
type RawEnvelope = {
  name?: string;
  tiles?: Record<string, RawTile>;
  armies?: Record<string, RawArmy>;
  factions?: Faction[];
  terrainConfig?: TerrainConfig;
};

export interface ExampleMapData {
  id: string;
  name: string;
  tiles: TilesState;
  armies: ArmiesState;
  factions: Faction[];
  terrainConfig?: TerrainConfig;
}

const normalizeTile = (t: RawTile): Tile => {
  return {
    q: t.q,
    r: t.r,
    terrain: t.terrain ?? 'grass',
    hasRiver: t.hasRiver ?? false,
    hasRoad: t.hasRoad ?? false,
    riverBlocked: t.riverBlocked ?? [],
    roadBlocked: t.roadBlocked ?? [],
    hasTown: t.hasTown ?? false,
    townName: t.townName ?? '',
    portBlocked: t.portBlocked ?? [],
    notes: t.notes ?? '',
    factionId: t.factionId ?? null,
  };
};

const normalizeTiles = (raw: Record<string, RawTile>): TilesState => {
  return Object.fromEntries(
    Object.entries(raw).map(([key, tile]) => {
      return [key, normalizeTile(tile)];
    })
  );
};

const normalizeArmy = (a: RawArmy): Army => {
  return {
    id: a.id,
    q: a.q,
    r: a.r,
    name: a.name ?? 'Army',
    composition: a.composition ?? '',
    factionId: a.factionId ?? null,
  };
};

const normalizeArmies = (raw: Record<string, RawArmy>): ArmiesState => {
  return Object.fromEntries(
    Object.entries(raw).map(([key, army]) => {
      return [key, normalizeArmy(army)];
    })
  );
};

const fromEnvelope = (raw: RawEnvelope, id: string): ExampleMapData => {
  return {
    id,
    name: raw.name ?? 'Example Map',
    tiles: normalizeTiles(raw.tiles ?? {}),
    armies: normalizeArmies(raw.armies ?? {}),
    factions: raw.factions ?? [],
    terrainConfig: raw.terrainConfig,
  };
};

export const exampleMaps: ExampleMapData[] = [
  fromEnvelope(rawSmall as RawEnvelope, 'builtin-example-1'),
  fromEnvelope(rawLarge as RawEnvelope, 'builtin-example-large'),
];

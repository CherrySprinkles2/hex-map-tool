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

export interface ExampleMapMeta {
  id: string;
  name: string;
}

export const exampleMapsMeta: ExampleMapMeta[] = [
  { id: 'builtin-example-1', name: 'Simple' },
  { id: 'builtin-example-large', name: 'Finland' },
  { id: 'builtin-example-bahamas', name: 'The Bahamas' },
];

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
    townSize: t.townSize,
    fortification: t.fortification,
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

export const loadExampleMapData = async (id: string): Promise<ExampleMapData> => {
  let raw: RawEnvelope;
  switch (id) {
    case 'builtin-example-1':
      raw = (await import('./example-map.json')).default as unknown as RawEnvelope;
      break;
    case 'builtin-example-large':
      raw = (await import('./large-map.json')).default as unknown as RawEnvelope;
      break;
    case 'builtin-example-bahamas':
      raw = (await import('./bahamas-map.json')).default as unknown as RawEnvelope;
      break;
    default:
      throw new Error(`Unknown example map id: ${id}`);
  }
  return fromEnvelope(raw, id);
};

// Manages the multi-map index and per-map data storage in localStorage.
//
// Index key:  hex-map-tool-index         →  Array<{ id, name, updatedAt }>
// Data key:   hex-map-tool-data-{id}     →  { version: 1, tiles, armies, factions }
//
// Legacy keys (read-only, migrated on load):
//   hex-map-tool-tiles           (very old single-map format)
//   hex-map-tool-map-{id}        (old per-map tiles)
//   hex-map-tool-armies-{id}     (old per-map armies)
//   hex-map-tool-factions-{id}   (old per-map factions)

import { generateId } from './generateId';
import { slugify } from './slugify';
import type { MapEntry, MapData, Faction, TerrainConfig } from '../types/domain';
import type { TilesState, ArmiesState } from '../types/state';

const INDEX_KEY = 'hex-map-tool-index';
const DATA_KEY = (id: string): string => {
  return `hex-map-tool-data-${id}`;
};

// Legacy keys — only used for migration, never written
const LEGACY_SINGLE_KEY = 'hex-map-tool-tiles';
const LEGACY_TILES_KEY = (id: string): string => {
  return `hex-map-tool-map-${id}`;
};
const LEGACY_ARMIES_KEY = (id: string): string => {
  return `hex-map-tool-armies-${id}`;
};
const LEGACY_FACTIONS_KEY = (id: string): string => {
  return `hex-map-tool-factions-${id}`;
};

// ── Quota-safe write ──────────────────────────────────────────────────────────

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      window.dispatchEvent(new CustomEvent('hex-map-quota-exceeded'));
    }
  }
};

// ── Index helpers ─────────────────────────────────────────────────────────────

const readIndex = (): MapEntry[] | null => {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as MapEntry[]) : null;
  } catch {
    return null;
  }
};

const writeIndex = (index: MapEntry[]): void => {
  safeSetItem(INDEX_KEY, JSON.stringify(index));
};

// ── Migration ─────────────────────────────────────────────────────────────────

export const migrateFromLegacy = (): void => {
  if (readIndex() !== null) return;

  const legacy = localStorage.getItem(LEGACY_SINGLE_KEY);
  if (legacy) {
    const id = generateId('map');
    writeIndex([{ id, name: 'Untitled Map', updatedAt: new Date().toISOString() }]);
    try {
      const tiles = JSON.parse(legacy) as TilesState;
      safeSetItem(DATA_KEY(id), JSON.stringify({ version: 1, tiles, armies: {}, factions: [] }));
    } catch {
      safeSetItem(
        DATA_KEY(id),
        JSON.stringify({ version: 1, tiles: {}, armies: {}, factions: [] })
      );
    }
    localStorage.removeItem(LEGACY_SINGLE_KEY);
  } else {
    writeIndex([]);
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

// Slugs reserved for route segments that must not collide with map URLs.
const RESERVED_SLUGS = new Set(['example']);

export const getAllMaps = (): MapEntry[] => {
  return readIndex() ?? [];
};

export const getMapBySlug = (slug: string): MapEntry | null => {
  return (
    getAllMaps().find((m) => {
      return slugify(m.name) === slug;
    }) ?? null
  );
};

export const createMap = (name = 'Untitled Map'): MapEntry => {
  const id = generateId('map');
  const maps = getAllMaps();
  const existingSlugs = new Set(
    maps.map((m) => {
      return slugify(m.name);
    })
  );
  let finalName = name;
  const baseSlug = slugify(name);
  if (RESERVED_SLUGS.has(baseSlug) || existingSlugs.has(baseSlug)) {
    let n = 2;
    while (
      RESERVED_SLUGS.has(slugify(`${name} (${n})`)) ||
      existingSlugs.has(slugify(`${name} (${n})`))
    )
      n++;
    finalName = `${name} (${n})`;
  }
  const entry: MapEntry = { id, name: finalName, updatedAt: new Date().toISOString() };
  writeIndex([...maps, entry]);
  safeSetItem(DATA_KEY(id), JSON.stringify({ version: 2, tiles: {}, armies: {}, factions: [] }));
  return entry;
};

export type RenameResult = { ok: true } | { ok: false; reason: 'nameTaken' };

export const renameMap = (id: string, name: string): RenameResult => {
  const maps = getAllMaps();
  const newSlug = slugify(name);
  if (RESERVED_SLUGS.has(newSlug)) return { ok: false, reason: 'nameTaken' };
  const conflict = maps.some((m) => {
    return m.id !== id && slugify(m.name) === newSlug;
  });
  if (conflict) return { ok: false, reason: 'nameTaken' };
  writeIndex(
    maps.map((m) => {
      return m.id === id ? { ...m, name } : m;
    })
  );
  return { ok: true };
};

export const deleteMap = (id: string): void => {
  writeIndex(
    getAllMaps().filter((m) => {
      return m.id !== id;
    })
  );
  localStorage.removeItem(DATA_KEY(id));
  localStorage.removeItem(LEGACY_TILES_KEY(id));
  localStorage.removeItem(LEGACY_ARMIES_KEY(id));
  localStorage.removeItem(LEGACY_FACTIONS_KEY(id));
};

export const touchMap = (id: string): void => {
  writeIndex(
    getAllMaps().map((m) => {
      return m.id === id ? { ...m, updatedAt: new Date().toISOString() } : m;
    })
  );
};

// ── Map data I/O (consolidated) ───────────────────────────────────────────────

export interface LoadedMapData {
  tiles: TilesState;
  armies: ArmiesState;
  factions: Faction[];
  terrainConfig?: TerrainConfig;
  thumbnail?: string;
}

// Returns { tiles, armies, factions } or null if no data found.
// Automatically migrates old 3-key format to the consolidated key on first read.
export const loadMapData = (id: string): LoadedMapData | null => {
  // Try new consolidated format first
  try {
    const raw = localStorage.getItem(DATA_KEY(id));
    if (raw) {
      const data = JSON.parse(raw) as MapData;
      if (data.version === 1 || data.version === 2) {
        return {
          tiles: (data.tiles ?? {}) as TilesState,
          armies: (data.armies ?? {}) as ArmiesState,
          factions: (data.factions ?? []) as Faction[],
          terrainConfig: data.terrainConfig,
          thumbnail: data.thumbnail,
        };
      }
    }
  } catch {
    /* ignore parse errors, fall through to legacy */
  }

  // Fall back to old 3-key format and migrate atomically
  try {
    const rawTiles = localStorage.getItem(LEGACY_TILES_KEY(id));
    const rawArmies = localStorage.getItem(LEGACY_ARMIES_KEY(id));
    const rawFactions = localStorage.getItem(LEGACY_FACTIONS_KEY(id));

    if (rawTiles !== null || rawArmies !== null) {
      const loaded: LoadedMapData = {
        tiles: rawTiles ? (JSON.parse(rawTiles) as TilesState) : {},
        armies: rawArmies ? (JSON.parse(rawArmies) as ArmiesState) : {},
        factions: rawFactions ? (JSON.parse(rawFactions) as Faction[]) : [],
      };
      safeSetItem(DATA_KEY(id), JSON.stringify({ version: 1, ...loaded }));
      localStorage.removeItem(LEGACY_TILES_KEY(id));
      localStorage.removeItem(LEGACY_ARMIES_KEY(id));
      localStorage.removeItem(LEGACY_FACTIONS_KEY(id));
      return loaded;
    }
  } catch {
    /* ignore */
  }

  return null;
};

// Saves tiles, armies and factions in a single atomic write and updates the index timestamp.
export const saveMapData = (id: string, data: LoadedMapData): void => {
  safeSetItem(DATA_KEY(id), JSON.stringify({ version: 2, ...data }));
  touchMap(id);
};

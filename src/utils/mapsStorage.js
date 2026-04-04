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

const INDEX_KEY = 'hex-map-tool-index';
const DATA_KEY = (id) => {
  return `hex-map-tool-data-${id}`;
};

// Legacy keys — only used for migration, never written
const LEGACY_SINGLE_KEY = 'hex-map-tool-tiles';
const LEGACY_TILES_KEY = (id) => {
  return `hex-map-tool-map-${id}`;
};
const LEGACY_ARMIES_KEY = (id) => {
  return `hex-map-tool-armies-${id}`;
};
const LEGACY_FACTIONS_KEY = (id) => {
  return `hex-map-tool-factions-${id}`;
};

// ── Quota-safe write ──────────────────────────────────────────────────────────

const safeSetItem = (key, value) => {
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

const readIndex = () => {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeIndex = (index) => {
  return safeSetItem(INDEX_KEY, JSON.stringify(index));
};

// ── Migration ─────────────────────────────────────────────────────────────────

// Call once on app start. Handles two legacy formats:
// 1. Very old: single hex-map-tool-tiles key (no index)
// 2. Old multi-map: separate tiles/armies/factions keys → migrates to consolidated key
export const migrateFromLegacy = () => {
  if (readIndex() !== null) return; // already initialised

  const legacy = localStorage.getItem(LEGACY_SINGLE_KEY);
  if (legacy) {
    const id = generateId('map');
    writeIndex([{ id, name: 'Untitled Map', updatedAt: new Date().toISOString() }]);
    try {
      const tiles = JSON.parse(legacy);
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

export const getAllMaps = () => {
  return readIndex() ?? [];
};

export const createMap = (name = 'Untitled Map') => {
  const id = generateId('map');
  const entry = { id, name, updatedAt: new Date().toISOString() };
  writeIndex([...getAllMaps(), entry]);
  safeSetItem(DATA_KEY(id), JSON.stringify({ version: 1, tiles: {}, armies: {}, factions: [] }));
  return entry;
};

export const renameMap = (id, name) => {
  writeIndex(
    getAllMaps().map((m) => {
      return m.id === id ? { ...m, name } : m;
    })
  );
};

export const deleteMap = (id) => {
  writeIndex(
    getAllMaps().filter((m) => {
      return m.id !== id;
    })
  );
  localStorage.removeItem(DATA_KEY(id));
  // Clean up any un-migrated legacy keys
  localStorage.removeItem(LEGACY_TILES_KEY(id));
  localStorage.removeItem(LEGACY_ARMIES_KEY(id));
  localStorage.removeItem(LEGACY_FACTIONS_KEY(id));
};

export const touchMap = (id) => {
  writeIndex(
    getAllMaps().map((m) => {
      return m.id === id ? { ...m, updatedAt: new Date().toISOString() } : m;
    })
  );
};

// ── Map data I/O (consolidated) ───────────────────────────────────────────────

// Returns { tiles, armies, factions } or null if no data found.
// Automatically migrates old 3-key format to the consolidated key on first read.
export const loadMapData = (id) => {
  // Try new consolidated format first
  try {
    const raw = localStorage.getItem(DATA_KEY(id));
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version === 1) {
        return {
          tiles: data.tiles ?? {},
          armies: data.armies ?? {},
          factions: data.factions ?? [],
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
      const data = {
        tiles: rawTiles ? JSON.parse(rawTiles) : {},
        armies: rawArmies ? JSON.parse(rawArmies) : {},
        factions: rawFactions ? JSON.parse(rawFactions) : [],
      };
      // Persist in new format then remove old keys
      safeSetItem(DATA_KEY(id), JSON.stringify({ version: 1, ...data }));
      localStorage.removeItem(LEGACY_TILES_KEY(id));
      localStorage.removeItem(LEGACY_ARMIES_KEY(id));
      localStorage.removeItem(LEGACY_FACTIONS_KEY(id));
      return data;
    }
  } catch {
    /* ignore */
  }

  return null;
};

// Saves tiles, armies and factions in a single atomic write and updates the index timestamp.
export const saveMapData = (id, { tiles, armies, factions }) => {
  safeSetItem(DATA_KEY(id), JSON.stringify({ version: 1, tiles, armies, factions }));
  touchMap(id);
};

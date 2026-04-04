// Manages the multi-map index and per-map tile storage in localStorage.
//
// Index key:     hex-map-tool-index          →  Array<{ id, name, updatedAt }>
// Tiles key:     hex-map-tool-map-{id}       →  tiles JSON object
// Armies key:    hex-map-tool-armies-{id}    →  armies JSON object
// Factions key:  hex-map-tool-factions-{id}  →  factions JSON array
// Legacy key:    hex-map-tool-tiles          →  migrated on first access

const INDEX_KEY    = 'hex-map-tool-index';
const TILES_KEY    = (id) => `hex-map-tool-map-${id}`;
const ARMIES_KEY   = (id) => `hex-map-tool-armies-${id}`;
const FACTIONS_KEY = (id) => `hex-map-tool-factions-${id}`;
const LEGACY_KEY   = 'hex-map-tool-tiles';

const generateId = () => `map-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
};

// ── Migration ─────────────────────────────────────────────────────────────────

// Call once on app start. If the old single-map key exists and no index exists,
// migrate the data into the new format.
export const migrateFromLegacy = () => {
  if (readIndex() !== null) return; // already migrated

  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    const id = generateId();
    const entry = { id, name: 'Untitled Map', updatedAt: new Date().toISOString() };
    writeIndex([entry]);
    localStorage.setItem(TILES_KEY(id), legacy);
    localStorage.removeItem(LEGACY_KEY);
  } else {
    writeIndex([]);
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const getAllMaps = () => readIndex() ?? [];

export const createMap = (name = 'Untitled Map') => {
  const id = generateId();
  const entry = { id, name, updatedAt: new Date().toISOString() };
  const index = getAllMaps();
  writeIndex([...index, entry]);
  // Write empty tiles for the new map
  localStorage.setItem(TILES_KEY(id), JSON.stringify({}));
  return entry;
};

export const renameMap = (id, name) => {
  const index = getAllMaps().map((m) => (m.id === id ? { ...m, name } : m));
  writeIndex(index);
};

export const deleteMap = (id) => {
  writeIndex(getAllMaps().filter((m) => m.id !== id));
  localStorage.removeItem(TILES_KEY(id));
  localStorage.removeItem(ARMIES_KEY(id));
  localStorage.removeItem(FACTIONS_KEY(id));
};

export const touchMap = (id) => {
  const index = getAllMaps().map((m) =>
    m.id === id ? { ...m, updatedAt: new Date().toISOString() } : m
  );
  writeIndex(index);
};

// ── Tiles I/O ─────────────────────────────────────────────────────────────────

export const loadMapTiles = (id) => {
  try {
    const raw = localStorage.getItem(TILES_KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveMapTiles = (id, tiles) => {
  localStorage.setItem(TILES_KEY(id), JSON.stringify(tiles));
  touchMap(id);
};

// ── Armies I/O ────────────────────────────────────────────────────────────────

export const loadMapArmies = (id) => {
  try {
    const raw = localStorage.getItem(ARMIES_KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveMapArmies = (id, armies) => {
  localStorage.setItem(ARMIES_KEY(id), JSON.stringify(armies));
};

// ── Factions I/O ─────────────────────────────────────────────────────────────

export const loadMapFactions = (id) => {
  try {
    const raw = localStorage.getItem(FACTIONS_KEY(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveMapFactions = (id, factions) => {
  localStorage.setItem(FACTIONS_KEY(id), JSON.stringify(factions));
};

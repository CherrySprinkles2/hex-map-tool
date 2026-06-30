// Feature 2 — Export reminder.
//
// Owns the per-map "snooze" store and the "is this map overdue for a backup"
// decision. Snooze state is deliberately kept out of MapData/MapEnvelope so that
// import/export stays clean — it lives in its own localStorage key.

import type { MapEntry } from '../types/domain';

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const SNOOZE_KEY = 'hex-map-tool-export-reminder-snooze';

type SnoozeMap = Record<string, string>; // mapId → ISO timestamp the snooze expires

const readSnooze = (): SnoozeMap => {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    return raw ? (JSON.parse(raw) as SnoozeMap) : {};
  } catch {
    return {};
  }
};

const writeSnooze = (map: SnoozeMap): void => {
  try {
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(map));
  } catch {
    /* best-effort; losing a snooze just means the reminder may reappear */
  }
};

/** "Remind me later" — push the next reminder out a further 7 days. */
export const snoozeReminder = (mapId: string, now: number = Date.now()): void => {
  const map = readSnooze();
  map[mapId] = new Date(now + SEVEN_DAYS_MS).toISOString();
  writeSnooze(map);
};

/** Drop any snooze for a map (e.g. once it has been exported). */
export const clearSnooze = (mapId: string): void => {
  const map = readSnooze();
  if (map[mapId] === undefined) return;
  delete map[mapId];
  writeSnooze(map);
};

const getSnoozeUntil = (mapId: string): number | null => {
  const iso = readSnooze()[mapId];
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
};

/**
 * Whether the open map is overdue for a backup export.
 *
 * - Currently snoozed → never overdue.
 * - Exported before: overdue when it has been edited since that export *and*
 *   ≥ 7 days have passed since it (no-edit-no-nag for already-backed-up maps).
 * - Never exported: overdue when the map is ≥ 7 days old (by `createdAt`,
 *   falling back to `updatedAt` for pre-existing maps without one).
 */
export const isExportOverdue = (entry: MapEntry, now: number = Date.now()): boolean => {
  const snoozeUntil = getSnoozeUntil(entry.id);
  if (snoozeUntil !== null && now < snoozeUntil) return false;

  if (entry.lastExportedAt) {
    const exportedAt = new Date(entry.lastExportedAt).getTime();
    const updatedAt = new Date(entry.updatedAt).getTime();
    if (updatedAt <= exportedAt) return false; // nothing changed since the backup
    return now - exportedAt >= SEVEN_DAYS_MS;
  }

  const createdAt = new Date(entry.createdAt ?? entry.updatedAt).getTime();
  if (Number.isNaN(createdAt)) return false;
  return now - createdAt >= SEVEN_DAYS_MS;
};

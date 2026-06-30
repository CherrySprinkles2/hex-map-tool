// Rolling in-memory log of recently dispatched Redux actions, used by the
// "Create bug report" button in the Settings modal. Records each action's type
// plus an ANONYMISED summary of its payload: object/array sizes are coarsened
// into ranges and every key / string / number value is replaced with a
// per-session token (see utils/anonymize). The shape is preserved (so a tile
// edited repeatedly in a loop still shows the same token) but no real map
// content — counts, coordinates, names — can be recovered from it.

import type { Middleware } from '@reduxjs/toolkit';
import { anonToken, bucket } from '../utils/anonymize';

/** How far back the log retains entries. */
export const ACTION_LOG_WINDOW_MS = 60_000;

// Hard cap so a runaway dispatch loop (the exact bug class this exists to catch)
// can't grow the buffer without bound between prunes.
const MAX_ENTRIES = 8_000;

export interface ActionLogEntry {
  /** Epoch ms when the action was dispatched. */
  t: number;
  /** Action type string. */
  type: string;
  /** Compact, size-bounded summary of the payload — never the full data. */
  summary: unknown;
}

const buffer: ActionLogEntry[] = [];

// Shallow, anonymised summary of an action payload. Objects/arrays collapse to
// their shape (bucketed key count / length), keys are tokenised, and primitive
// string/number values are anonymised so no real map content is captured.
const summarize = (value: unknown): unknown => {
  if (value === null || value === undefined) return null;
  const type = typeof value;
  if (type === 'string') return { kind: 'string', value: anonToken(value as string) };
  if (type === 'number') return { kind: 'number', value: bucket(value as number) };
  if (type === 'boolean') return { kind: 'boolean' };
  if (Array.isArray(value)) return { kind: 'array', length: bucket(value.length) };
  if (type === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    return { kind: 'object', size: bucket(keys.length), keys: keys.slice(0, 12).map(anonToken) };
  }
  return { kind: type };
};

const prune = (now: number): void => {
  const cutoff = now - ACTION_LOG_WINDOW_MS;
  let drop = 0;
  while (drop < buffer.length && buffer[drop].t < cutoff) drop += 1;
  if (drop > 0) buffer.splice(0, drop);
  if (buffer.length > MAX_ENTRIES) buffer.splice(0, buffer.length - MAX_ENTRIES);
};

const record = (type: string, payload: unknown): void => {
  const now = Date.now();
  buffer.push({ t: now, type, summary: summarize(payload) });
  prune(now);
};

/** Snapshot the retained log (pruned to the window), with offsets relative to `now`. */
export const getActionLog = (
  now: number = Date.now()
): Array<ActionLogEntry & { sinceMs: number }> => {
  prune(now);
  return buffer.map((e) => {
    return { ...e, sinceMs: now - e.t };
  });
};

/** Clear the buffer (used by tests). */
export const clearActionLog = (): void => {
  buffer.length = 0;
};

/** Redux middleware that records every dispatched action into the rolling log. */
export const actionLogMiddleware: Middleware = () => {
  return (next) => {
    return (action) => {
      const a = action as { type?: unknown; payload?: unknown };
      if (typeof a?.type === 'string') {
        try {
          record(a.type, a.payload);
        } catch {
          /* logging must never break dispatch */
        }
      }
      return next(action);
    };
  };
};

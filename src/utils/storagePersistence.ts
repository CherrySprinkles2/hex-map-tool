// Feature 1 — Persistent storage.
//
// Asks the browser to mark this origin's storage as *persistent* (exempt from
// automatic eviction under storage pressure) via the StorageManager API. This is
// a best-effort upgrade, not a requirement: the app already works on plain
// localStorage. A denial is not an error.
//
// Browser behaviour varies: Chrome/Edge grant or deny silently from an engagement
// heuristic (often denied on a first visit), Firefox shows a prompt, Safari uses
// its own heuristic. `navigator.storage` only exists in secure contexts.

/** Reports whether persistence is already granted, without prompting. */
export const isStoragePersisted = async (): Promise<boolean> => {
  if (!navigator.storage?.persisted) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
};

/** Requests persistence once; resolves to whether it is now granted. */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
};

/** Whether the StorageManager persist API is available (secure context only). */
export const isPersistenceSupported = (): boolean => {
  return !!navigator.storage?.persist;
};

// ── First-visit explainer "seen" flag ──────────────────────────────────────────

const SEEN_KEY = 'hex-map-tool-persistence-prompt-seen';

export const hasSeenPersistencePrompt = (): boolean => {
  try {
    return localStorage.getItem(SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

export const markPersistencePromptSeen = (): void => {
  try {
    localStorage.setItem(SEEN_KEY, 'true');
  } catch {
    /* best-effort */
  }
};

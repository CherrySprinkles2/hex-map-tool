// Anonymisation helpers for the diagnostic bug report. The goal is to keep the
// report's *shape* useful for debugging (you can still see counts at a coarse
// scale, and spot a value that repeats — e.g. the same tile edited in a loop)
// while never revealing real map content: exact quantities, tile coordinates,
// map names, or any other identifying value.
//
// A random salt is generated once per page load. Because it is random and never
// exported, someone who knows an original value (a co-player who knows your map
// name) cannot hash it themselves to confirm a match, and tokens cannot be
// correlated across separate reports. Within a single session the mapping is
// stable, so a value that recurs still shows up as the same token.

const SALT = Math.random().toString(36).slice(2) + Date.now().toString(36);

// Tokens are deterministic for a given value (within a session), so memoise them.
// This matters for the diagnostic's hot path: a runaway dispatch loop hammers the
// same payload values, and the action-log middleware would otherwise re-hash each
// one on every dispatch. Cache hits make that near-free without changing any output.
// Per-session and never exported, so it doesn't weaken the privacy guarantee.
const tokenCache = new Map<string, string>();
const TOKEN_CACHE_MAX = 5000;

/** Stable, non-reversible token for a string value (coordinates, names, ids, …). */
export const anonToken = (value: string): string => {
  const cached = tokenCache.get(value);
  if (cached !== undefined) return cached;

  let h = 0;
  const input = SALT + value;
  for (let i = 0; i < input.length; i += 1) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  const token = `~${(h >>> 0).toString(36)}`;

  // Bound the cache so a long, varied session can't grow it without limit.
  if (tokenCache.size >= TOKEN_CACHE_MAX) tokenCache.clear();
  tokenCache.set(value, token);
  return token;
};

const EDGES = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

/**
 * Coarsen a count into a range string so the exact quantity is hidden but the
 * order of magnitude (useful for perf triage) is kept. 0/1/2 are exact; larger
 * values collapse to ranges like "6-10", "2501-5000", "10001+".
 */
export const bucket = (n: number): string => {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n <= 2) return String(n);
  let lo = 3;
  for (const edge of EDGES) {
    if (n <= edge) return `${lo}-${edge}`;
    lo = edge + 1;
  }
  return `${lo}+`;
};

// Foraging level shared constants/helpers. A tile's forageLevel is an integer
// in [0, FORAGE_MAX]; 0 means unforaged.

export const FORAGE_MAX = 5;

export const clampForage = (level: number): number => {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(FORAGE_MAX, Math.round(level)));
};

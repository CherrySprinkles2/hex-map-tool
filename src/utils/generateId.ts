/**
 * Generates a unique ID with an optional prefix.
 * e.g. generateId('army') → 'army-1712345678901-abc12'
 */
export const generateId = (prefix = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
};

// Picks a reasonable terrain for a newly-placed tile based on its neighbours.
// The winning terrain is the most common among existing neighbours; ties are
// broken by most-recently-placed neighbour (preserving the user's recent palette).
// Falls back to 'grass' when the tile has no neighbours.

import { getNeighbors, toKey } from './hexUtils';
import type { TerrainType } from '../types/domain';
import type { TilesState } from '../types/state';

export const inferTerrain = (q: number, r: number, tiles: TilesState): TerrainType => {
  const neighbors = getNeighbors(q, r);
  const counts: Record<string, number> = {};

  neighbors.forEach(({ q: nq, r: nr }) => {
    const tile = tiles[toKey(nq, nr)];
    if (tile) counts[tile.terrain] = (counts[tile.terrain] || 0) + 1;
  });

  if (Object.keys(counts).length === 0) return 'grass';

  const maxCount = Math.max(...Object.values(counts));
  const tied = Object.keys(counts).filter((t) => {
    return counts[t] === maxCount;
  });

  if (tied.length === 1) return tied[0] as TerrainType;

  const neighborKeys = new Set(
    neighbors.map((n) => {
      return toKey(n.q, n.r);
    })
  );
  const tileKeys = Object.keys(tiles);
  for (let i = tileKeys.length - 1; i >= 0; i--) {
    const key = tileKeys[i];
    if (neighborKeys.has(key) && tied.includes(tiles[key].terrain)) {
      return tiles[key].terrain;
    }
  }

  return tied[0] as TerrainType;
};

// Example map data loaded from the bundled JSON.
// The JSON may omit optional tile fields; defaults are applied here so the
// rest of the app never has to guard for missing properties.
import rawTiles from './example-map.json';

const normalizeTile = (t) => ({
  q:            t.q,
  r:            t.r,
  terrain:      t.terrain      ?? 'grass',
  hasRiver:     t.hasRiver     ?? false,
  hasRoad:      t.hasRoad      ?? false,
  riverBlocked: t.riverBlocked ?? [],
  roadBlocked:  t.roadBlocked  ?? [],
  hasTown:      t.hasTown      ?? false,
  townName:     t.townName     ?? '',
  portBlocked:  t.portBlocked  ?? [],
});

const exampleTiles = Object.fromEntries(
  Object.entries(rawTiles).map(([key, tile]) => [key, normalizeTile(tile)])
);

export const exampleMaps = [
  {
    id: 'builtin-example-1',
    name: 'Example Map',
    tiles: exampleTiles,
  },
];

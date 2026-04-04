// Example map data loaded from the bundled JSON.
// The JSON may omit optional tile fields; defaults are applied here so the
// rest of the app never has to guard for missing properties.
import rawTiles from './example-map.json';
import rawLargeTiles from './large-map.json';

const normalizeTile = (t) => {
  return {
    q: t.q,
    r: t.r,
    terrain: t.terrain ?? 'grass',
    hasRiver: t.hasRiver ?? false,
    hasRoad: t.hasRoad ?? false,
    riverBlocked: t.riverBlocked ?? [],
    roadBlocked: t.roadBlocked ?? [],
    hasTown: t.hasTown ?? false,
    townName: t.townName ?? '',
    portBlocked: t.portBlocked ?? [],
    notes: t.notes ?? '',
    factionId: t.factionId ?? null,
  };
};

const normalizeTiles = (raw) => {
  return Object.fromEntries(
    Object.entries(raw).map(([key, tile]) => {
      return [key, normalizeTile(tile)];
    })
  );
};

const normalizeArmy = (a) => {
  return {
    ...a,
    factionId: a.factionId ?? null,
  };
};

const normalizeArmies = (raw) => {
  return Object.fromEntries(
    Object.entries(raw).map(([key, army]) => {
      return [key, normalizeArmy(army)];
    })
  );
};

// ── Small map — factions ──────────────────────────────────────────────────
const smallFactions = [
  {
    id: 'faction-example-1-a',
    name: 'Kingdom of Suomi',
    color: '#4488cc',
    description: 'A seafaring northern kingdom controlling the western coast. Capital at Helsinki.',
  },
  {
    id: 'faction-example-1-b',
    name: 'Tampereen Liitto',
    color: '#cc4444',
    description:
      'An inland confederation of city-states. Controls the interior and eastern reaches.',
  },
];

// ── Small map — armies ────────────────────────────────────────────────────
// Town coords: Helsinki(-2,0), Turku(-1,-3), Tampere(1,-2), Pääsiäinenmies(2,-4)
const smallArmies = {
  'army-sm-1': {
    id: 'army-sm-1',
    q: -2,
    r: 0,
    name: 'Helsinki Guard',
    composition: '1200 Infantry, 400 Archers',
    factionId: 'faction-example-1-a',
  },
  'army-sm-2': {
    id: 'army-sm-2',
    q: -1,
    r: -3,
    name: 'Turku Garrison',
    composition: '800 Infantry, 6 Warships',
    factionId: 'faction-example-1-a',
  },
  'army-sm-3': {
    id: 'army-sm-3',
    q: -2,
    r: -1,
    name: 'Suomi Outriders',
    composition: '600 Light Cavalry',
    factionId: 'faction-example-1-a',
  },
  'army-sm-4': {
    id: 'army-sm-4',
    q: 1,
    r: -2,
    name: 'Tampere Militia',
    composition: '1500 Infantry, 300 Crossbowmen',
    factionId: 'faction-example-1-b',
  },
  'army-sm-5': {
    id: 'army-sm-5',
    q: 1,
    r: -4,
    name: 'Liitto Vanguard',
    composition: '900 Heavy Infantry, 200 Cavalry',
    factionId: 'faction-example-1-b',
  },
};

// ── Large map — factions ──────────────────────────────────────────────────
const largeFactions = [
  {
    id: 'faction-example-2-a',
    name: 'Forest Accord',
    color: '#3aaa55',
    description:
      'A confederation of forest settlements controlling the central woodlands. Holds Ferndale and Mosswick.',
  },
  {
    id: 'faction-example-2-b',
    name: 'Iron Dominion',
    color: '#e05c2a',
    description:
      'A militaristic empire based in the north, controlling Ironspire and Stonepeak from mountain fortresses.',
  },
  {
    id: 'faction-example-2-c',
    name: 'Silver Coast League',
    color: '#4488cc',
    description:
      'A merchant alliance controlling coastal towns and trade routes. Governs Ashford, Clearwater, and Millhaven.',
  },
  {
    id: 'faction-example-2-d',
    name: 'Eastern Reaches',
    color: '#9b59b6',
    description:
      'A coalition of eastern settlements commanding dense forests and mountain passes. Controls Greenwood, Highcrest, and Timbergate.',
  },
];

// ── Large map — armies ────────────────────────────────────────────────────
// Town coords: Ferndale(-12,8), Mosswick(-8,4), Ironspire(-10,-15),
//              Stonepeak(-5,-8), Ashford(0,0), Clearwater(5,8),
//              Millhaven(8,12), Greenwood(10,-5), Highcrest(15,-10), Timbergate(18,-15)
const largeArmies = {
  'army-lg-1': {
    id: 'army-lg-1',
    q: -10,
    r: -15,
    name: 'Iron Legion',
    composition: '3000 Heavy Infantry, 500 War Machines',
    factionId: 'faction-example-2-b',
  },
  'army-lg-2': {
    id: 'army-lg-2',
    q: -5,
    r: -8,
    name: 'Stonepeak Watch',
    composition: '1200 Infantry, 800 Archers',
    factionId: 'faction-example-2-b',
  },
  'army-lg-3': {
    id: 'army-lg-3',
    q: -11,
    r: -14,
    name: 'Dominion Vanguard',
    composition: '2000 Cavalry, 400 Scouts',
    factionId: 'faction-example-2-b',
  },
  'army-lg-4': {
    id: 'army-lg-4',
    q: -12,
    r: 8,
    name: 'Ferndale Rangers',
    composition: '900 Archers, 300 Druids',
    factionId: 'faction-example-2-a',
  },
  'army-lg-5': {
    id: 'army-lg-5',
    q: -8,
    r: 4,
    name: 'Mosswick Wardens',
    composition: '700 Spearmen, 500 Forest Scouts',
    factionId: 'faction-example-2-a',
  },
  'army-lg-6': {
    id: 'army-lg-6',
    q: -11,
    r: 7,
    name: 'Accord Skirmishers',
    composition: '1100 Light Infantry, 200 Cavalry',
    factionId: 'faction-example-2-a',
  },
  'army-lg-7': {
    id: 'army-lg-7',
    q: 0,
    r: 0,
    name: 'Ashford Guard',
    composition: '600 City Watch, 4 Warships',
    factionId: 'faction-example-2-c',
  },
  'army-lg-8': {
    id: 'army-lg-8',
    q: 5,
    r: 8,
    name: 'Clearwater Fleet',
    composition: '400 Marines, 12 Warships',
    factionId: 'faction-example-2-c',
  },
  'army-lg-9': {
    id: 'army-lg-9',
    q: 10,
    r: -5,
    name: 'Greenwood Wardens',
    composition: '800 Forest Infantry, 300 Rangers',
    factionId: 'faction-example-2-d',
  },
  'army-lg-10': {
    id: 'army-lg-10',
    q: 18,
    r: -15,
    name: 'Timbergate Garrison',
    composition: '1000 Infantry, 400 Cavalry',
    factionId: 'faction-example-2-d',
  },
};

export const exampleMaps = [
  {
    id: 'builtin-example-1',
    name: 'Example Map',
    tiles: normalizeTiles(rawTiles),
    factions: smallFactions,
    armies: normalizeArmies(smallArmies),
  },
  {
    id: 'builtin-example-large',
    name: 'Large Map (3000 tiles)',
    tiles: normalizeTiles(rawLargeTiles),
    factions: largeFactions,
    armies: normalizeArmies(largeArmies),
  },
];

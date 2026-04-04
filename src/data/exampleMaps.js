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
    id: 'faction-lg-uusimaa',
    name: 'Uudenmaan Ruhtinaskunta',
    color: '#2255cc',
    description:
      'A powerful coastal lordship commanding the Gulf of Finland shore. Masters of maritime trade and sea warfare, ruling from the fortress of Helsinki.',
  },
  {
    id: 'faction-lg-hame',
    name: 'Hämeen Käräjäkunta',
    color: '#cc3322',
    description:
      'The ancient assembly-lands of the Häme people, controlling the great forest heartlands and the lake country around Tampere. Renowned for their infantry.',
  },
];

// ── Large map — armies ────────────────────────────────────────────────────
// Coordinates from scripts/generate-finland.mjs output (LON_MIN=16.0, LAT_MIN=57.5, SCALE_LON=0.13):
//   Helsinki(-19,47), Espoo(-20,46), Kotka(-8,43), Lahti(-11,37)
//   Tampere(-16,30), Turku(-29,43)
const largeArmies = {
  'army-lg-helslinki-garrison': {
    id: 'army-lg-helslinki-garrison',
    q: -19,
    r: 47,
    name: 'Helsingin Linnanvartiosto',
    composition: '1200 miekkasotilas, 400 jousimies',
    factionId: 'faction-lg-uusimaa',
  },
  'army-lg-uusimaa-cavalry': {
    id: 'army-lg-uusimaa-cavalry',
    q: -19,
    r: 46,
    name: 'Uusmaan Ratsuväki',
    composition: '600 ratsuväki, 200 kevyt ratsuväki',
    factionId: 'faction-lg-uusimaa',
  },
  'army-lg-kotka-fleet': {
    id: 'army-lg-kotka-fleet',
    q: -8,
    r: 43,
    name: 'Rannikkovartio',
    composition: '800 jalkaväki, 8 pitkälaivaa',
    factionId: 'faction-lg-uusimaa',
  },
  'army-lg-lahti-garrison': {
    id: 'army-lg-lahti-garrison',
    q: -11,
    r: 37,
    name: 'Lahden Linnaväki',
    composition: '700 keihässotilas, 300 jousimies',
    factionId: 'faction-lg-uusimaa',
  },
  'army-lg-tampere-garrison': {
    id: 'army-lg-tampere-garrison',
    q: -16,
    r: 30,
    name: 'Tampereen Linnaleiri',
    composition: '1500 jalkaväki, 400 jousimies',
    factionId: 'faction-lg-hame',
  },
  'army-lg-hame-field': {
    id: 'army-lg-hame-field',
    q: -19,
    r: 33,
    name: 'Hämäläinen Miekkasotajoukko',
    composition: '900 miekkasotilas, 300 ratsuväki',
    factionId: 'faction-lg-hame',
  },
  'army-lg-turku-garrison': {
    id: 'army-lg-turku-garrison',
    q: -29,
    r: 43,
    name: 'Turun Kaupunkivartiosto',
    composition: '800 jalkaväki, 6 hansakauppalaiva',
    factionId: 'faction-lg-hame',
  },
  'army-lg-hame-scouts': {
    id: 'army-lg-hame-scouts',
    q: -2,
    r: 21,
    name: 'Hämeen Tiedustelujoukko',
    composition: '350 kevyt ratsuväki, 150 tiedustelija',
    factionId: 'faction-lg-hame',
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
    name: 'Finland',
    tiles: normalizeTiles(rawLargeTiles),
    factions: largeFactions,
    armies: normalizeArmies(largeArmies),
  },
];

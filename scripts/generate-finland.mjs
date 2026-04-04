// scripts/generate-finland.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as turf from '@turf/turf';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- Load GeoJSON data ---
const finlandGeoJSON = JSON.parse(readFileSync(join(__dirname, 'data/finland-boundary.geojson'), 'utf8'));
const lakesGeoJSON   = JSON.parse(readFileSync(join(__dirname, 'data/finland-lakes.geojson'), 'utf8'));
const riversGeoJSON  = JSON.parse(readFileSync(join(__dirname, 'data/finland-rivers.geojson'), 'utf8'));
const landGeoJSON    = JSON.parse(readFileSync(join(__dirname, 'data/ne_50m_land.geojson'), 'utf8'));

const finlandFeature = finlandGeoJSON.features[0];
const lakeFeatures   = lakesGeoJSON.features;
const riverFeatures  = riversGeoJSON.features;
const landFeatures   = landGeoJSON.features;

// --- Hex math (pointy-top axial) ---

// Geographic bounds — extended westward/southward to include Baltic and Gulf of Bothnia
const LON_MIN = 16.0, LON_MAX = 32.0;
const LAT_MIN = 57.5, LAT_MAX = 70.5;

// Scale: map geographic degrees to hex grid
// Finland is ~1200km tall, ~600km wide
// We want roughly 3000+ land tiles
// At 65°N: 1° lat ≈ 111km, 1° lon ≈ 46.8km
// For equilateral hexes in real space: SCALE_LAT/SCALE_LON = km_per_lon/km_per_lat = 46.8/111

const SCALE_LON = 0.13; // degrees longitude per hex unit
const KM_PER_LON = 46.8;  // km per degree longitude at 65°N
const KM_PER_LAT = 111.0; // km per degree latitude
const SCALE_LAT = SCALE_LON * (KM_PER_LON / KM_PER_LAT); // ≈ 0.076°/unit

const CENTER_LON = (LON_MIN + LON_MAX) / 2;
const CENTER_LAT = (LAT_MIN + LAT_MAX) / 2;

function hexToGeo(q, r) {
  // Pointy-top: x = sqrt(3)*q + sqrt(3)/2*r, y = 3/2*r
  const x = (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r) * SCALE_LON;
  const y = (3 / 2 * r) * SCALE_LAT;
  return [CENTER_LON + x, CENTER_LAT - y]; // note: flip y for lat
}

function geoToHexApprox(lon, lat) {
  const x = (lon - CENTER_LON) / SCALE_LON;
  const y = -(lat - CENTER_LAT) / SCALE_LAT;
  // Pointy-top inverse
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y);
  const r = (2 / 3 * y);
  return hexRound(q, r);
}

function hexRound(q, r) {
  const s = -q - r;
  let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s);
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { q: rq, r: rr };
}

function toKey(q, r) { return `${q},${r}`; }

// --- City list (lon, lat, name) ---
const MAX_TOWNS = 100;
const CITIES = [
  // Major cities
  { lon: 24.93, lat: 60.17, name: 'Helsinki' },
  { lon: 24.66, lat: 60.25, name: 'Espoo' },
  { lon: 25.03, lat: 60.30, name: 'Vantaa' },
  { lon: 23.77, lat: 61.50, name: 'Tampere' },
  { lon: 22.27, lat: 60.45, name: 'Turku' },
  { lon: 25.47, lat: 65.01, name: 'Oulu' },
  { lon: 25.75, lat: 62.24, name: 'Jyväskylä' },
  { lon: 27.68, lat: 62.89, name: 'Kuopio' },
  { lon: 25.66, lat: 60.98, name: 'Lahti' },
  { lon: 25.72, lat: 66.50, name: 'Rovaniemi' },
  { lon: 29.77, lat: 62.60, name: 'Joensuu' },
  { lon: 21.61, lat: 63.10, name: 'Vaasa' },
  { lon: 28.19, lat: 61.06, name: 'Lappeenranta' },
  { lon: 26.95, lat: 60.47, name: 'Kotka' },
  // Southern Finland
  { lon: 24.46, lat: 60.99, name: 'Hämeenlinna' },
  { lon: 26.70, lat: 60.87, name: 'Kouvola' },
  { lon: 21.79, lat: 61.48, name: 'Pori' },
  { lon: 25.66, lat: 60.40, name: 'Porvoo' },
  { lon: 24.07, lat: 60.25, name: 'Lohja' },
  { lon: 23.13, lat: 60.38, name: 'Salo' },
  { lon: 21.51, lat: 61.12, name: 'Rauma' },
  { lon: 24.86, lat: 60.63, name: 'Hyvinkää' },
  { lon: 24.77, lat: 60.74, name: 'Riihimäki' },
  { lon: 23.51, lat: 61.48, name: 'Nokia' },
  { lon: 23.62, lat: 60.81, name: 'Forssa' },
  { lon: 24.03, lat: 61.27, name: 'Valkeakoski' },
  { lon: 22.37, lat: 60.41, name: 'Kaarina' },
  { lon: 23.06, lat: 60.85, name: 'Loimaa' },
  { lon: 21.41, lat: 60.80, name: 'Uusikaupunki' },
  { lon: 22.03, lat: 60.47, name: 'Naantali' },
  { lon: 28.77, lat: 61.17, name: 'Imatra' },
  { lon: 26.03, lat: 61.20, name: 'Heinola' },
  { lon: 25.09, lat: 60.47, name: 'Järvenpää' },
  { lon: 24.25, lat: 60.40, name: 'Kirkkonummi' },
  { lon: 23.59, lat: 61.56, name: 'Ylöjärvi' },
  // Central Finland
  { lon: 27.27, lat: 61.69, name: 'Mikkeli' },
  { lon: 28.88, lat: 61.87, name: 'Savonlinna' },
  { lon: 27.14, lat: 62.30, name: 'Pieksämäki' },
  { lon: 27.87, lat: 62.32, name: 'Varkaus' },
  { lon: 25.73, lat: 62.60, name: 'Äänekoski' },
  { lon: 25.19, lat: 61.86, name: 'Jämsä' },
  { lon: 29.02, lat: 62.72, name: 'Outokumpu' },
  { lon: 29.14, lat: 63.54, name: 'Nurmes' },
  { lon: 29.52, lat: 64.12, name: 'Kuhmo' },
  { lon: 30.93, lat: 62.67, name: 'Ilomantsi' },
  { lon: 30.14, lat: 62.10, name: 'Kitee' },
  { lon: 27.19, lat: 63.56, name: 'Iisalmi' },
  // Ostrobothnia / west coast
  { lon: 22.84, lat: 62.79, name: 'Seinäjoki' },
  { lon: 23.13, lat: 63.84, name: 'Kokkola' },
  { lon: 24.48, lat: 64.68, name: 'Raahe' },
  { lon: 24.56, lat: 64.08, name: 'Ylivieska' },
  { lon: 23.95, lat: 64.26, name: 'Kalajoki' },
  { lon: 24.82, lat: 64.27, name: 'Oulainen' },
  // Northern Finland
  { lon: 27.73, lat: 64.23, name: 'Kajaani' },
  { lon: 28.89, lat: 64.88, name: 'Suomussalmi' },
  { lon: 24.14, lat: 65.85, name: 'Tornio' },
  { lon: 24.56, lat: 65.74, name: 'Kemi' },
  { lon: 27.43, lat: 66.71, name: 'Kemijärvi' },
  { lon: 26.59, lat: 67.42, name: 'Sodankylä' },
  { lon: 24.91, lat: 67.65, name: 'Kittilä' },
  { lon: 27.02, lat: 68.90, name: 'Inari' },
  { lon: 27.02, lat: 69.91, name: 'Utsjoki' },
];

// --- Determine hex grid bounds ---
const corners = [
  [LON_MIN, LAT_MIN], [LON_MAX, LAT_MIN],
  [LON_MIN, LAT_MAX], [LON_MAX, LAT_MAX],
];
let qMin = Infinity, qMax = -Infinity, rMin = Infinity, rMax = -Infinity;
for (const [lon, lat] of corners) {
  const { q, r } = geoToHexApprox(lon, lat);
  qMin = Math.min(qMin, q - 2);
  qMax = Math.max(qMax, q + 2);
  rMin = Math.min(rMin, r - 2);
  rMax = Math.max(rMax, r + 2);
}

console.log(`Grid bounds: q [${qMin}, ${qMax}], r [${rMin}, ${rMax}]`);
console.log(`Candidate hexes: ~${(qMax - qMin) * (rMax - rMin)}`);

// --- Haversine distance (km) between two [lon, lat] points ---
function haversineKm(lon1, lat1, lon2, lat2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Check if a point is inside any world land polygon ---
function isInsideAnyLand(lon, lat) {
  const pt = turf.point([lon, lat]);
  for (const feature of landFeatures) {
    if (turf.booleanPointInPolygon(pt, feature)) return true;
  }
  return false;
}

// --- River proximity function ---
function isNearRiver(lon, lat, thresholdDeg = 0.12) {
  const pt = turf.point([lon, lat]);
  for (const river of riverFeatures) {
    const line = river.geometry;
    const snapped = turf.nearestPointOnLine({ type: 'Feature', geometry: line }, pt, { units: 'degrees' });
    if (snapped.properties.dist < thresholdDeg) return true;
  }
  return false;
}

// --- Is inside lake ---
function isInLake(lon, lat) {
  const pt = turf.point([lon, lat]);
  for (const lake of lakeFeatures) {
    if (turf.booleanPointInPolygon(pt, lake)) return true;
  }
  return false;
}

// --- Terrain classification ---
function classifyTerrain(lon, lat) {
  // Lapland highlands (north of ~68°N)
  if (lat > 68.0) return 'mountain';
  // Lake
  if (isInLake(lon, lat)) return 'lake';
  // Southern agricultural belt
  if (lat < 61.5) return 'farm';
  // Default: forest (Finland is ~75% forested)
  return 'forest';
}

// --- Faction assignment for land tiles ---
function assignFaction(lon, lat) {
  // Uusimaa: southeastern coastal strip
  if (lat >= 59.8 && lat <= 61.5 && lon >= 24.0) return 'faction-lg-uusimaa';
  // Häme: south-central inland
  if (lat >= 60.3 && lat <= 63.5 && lon >= 22.0 && lon <= 27.5) return 'faction-lg-hame';
  return null;
}

// --- Generate tiles ---
const tiles = {};
const cityHexes = new Set();

// Deduplicate cities by name and cap at MAX_TOWNS
const uniqueCities = CITIES.filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i).slice(0, MAX_TOWNS);

// Pre-compute city hex positions
const cityTiles = uniqueCities.map(city => ({
  ...city,
  ...geoToHexApprox(city.lon, city.lat),
}));

// First pass: collect all Finland land tiles and their geo centres
const finlandLandCentres = [];
for (let r = rMin; r <= rMax; r++) {
  for (let q = qMin; q <= qMax; q++) {
    const [lon, lat] = hexToGeo(q, r);
    if (lon < LON_MIN - 1 || lon > LON_MAX + 1) continue;
    if (lat < LAT_MIN - 0.5 || lat > LAT_MAX + 0.5) continue;
    const pt = turf.point([lon, lat]);
    if (turf.booleanPointInPolygon(pt, finlandFeature)) {
      finlandLandCentres.push([lon, lat]);
    }
  }
}
console.log(`Finland land centres: ${finlandLandCentres.length}`);

const OCEAN_MAX_KM = 100;

function isWithinOceanRange(lon, lat) {
  for (const [flon, flat] of finlandLandCentres) {
    if (haversineKm(lon, lat, flon, flat) <= OCEAN_MAX_KM) return true;
  }
  return false;
}

let landCount = 0, oceanInBoundsCount = 0, skippedForeignLand = 0, skippedFarSea = 0;
for (let r = rMin; r <= rMax; r++) {
  for (let q = qMin; q <= qMax; q++) {
    const [lon, lat] = hexToGeo(q, r);

    // Skip if outside geographic bounds
    if (lon < LON_MIN - 1 || lon > LON_MAX + 1) continue;
    if (lat < LAT_MIN - 0.5 || lat > LAT_MAX + 0.5) continue;

    const key = toKey(q, r);
    const pt = turf.point([lon, lat]);
    const insideFinland = turf.booleanPointInPolygon(pt, finlandFeature);

    if (!insideFinland) {
      // Skip if inside another country's land (Sweden, Norway, Russia, etc.)
      if (isInsideAnyLand(lon, lat)) {
        skippedForeignLand++;
        continue;
      }
      // Skip if more than ~100km from Finnish coast
      if (!isWithinOceanRange(lon, lat)) {
        skippedFarSea++;
        continue;
      }
      tiles[key] = {
        q, r, terrain: 'ocean',
        hasRiver: false, hasRoad: false,
        riverBlocked: [], roadBlocked: [],
        hasTown: false, townName: '',
        portBlocked: [], factionId: null, notes: '',
      };
      oceanInBoundsCount++;
      continue;
    }

    const terrain = classifyTerrain(lon, lat);
    const hasRiver = (terrain !== 'lake') && isNearRiver(lon, lat);

    tiles[key] = {
      q, r, terrain,
      hasRiver,
      hasRoad: false,
      riverBlocked: [],
      roadBlocked: [],
      hasTown: false,
      townName: '',
      portBlocked: [],
      factionId: assignFaction(lon, lat),
      notes: '',
    };
    landCount++;
  }
}

console.log(`Generated ${landCount} land tiles, ${oceanInBoundsCount} ocean tiles`);
console.log(`Skipped: ${skippedForeignLand} foreign-land tiles, ${skippedFarSea} far-sea tiles`);

// Add surrounding ocean ring (tiles adjacent to land that aren't land)
const NEIGHBOR_DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
const oceanKeys = new Set();
for (const key of Object.keys(tiles)) {
  const [q, r] = key.split(',').map(Number);
  for (const [dq, dr] of NEIGHBOR_DIRS) {
    const nKey = toKey(q + dq, r + dr);
    if (!tiles[nKey] && !oceanKeys.has(nKey)) {
      oceanKeys.add(nKey);
      tiles[nKey] = {
        q: q + dq, r: r + dr,
        terrain: 'ocean',
        hasRiver: false, hasRoad: false,
        riverBlocked: [], roadBlocked: [],
        hasTown: false, townName: '',
        portBlocked: [], factionId: null, notes: '',
      };
    }
  }
}

console.log(`Added ${oceanKeys.size} ocean border tiles. Total: ${Object.keys(tiles).length}`);

// Place cities
for (const city of cityTiles) {
  const key = toKey(city.q, city.r);
  if (tiles[key]) {
    tiles[key].hasTown = true;
    tiles[key].townName = city.name;
    // Towns should be on land terrain
    if (tiles[key].terrain === 'lake' || tiles[key].terrain === 'ocean') {
      tiles[key].terrain = 'grass';
    }
    tiles[key].hasRiver = false;
    cityHexes.add(key);
    console.log(`Placed ${city.name} at ${key}`);
  } else {
    // Find nearest land tile
    let best = null, bestDist = Infinity;
    for (const tKey of Object.keys(tiles)) {
      if (tiles[tKey].terrain === 'ocean' || tiles[tKey].terrain === 'lake') continue;
      const [tq, tr] = tKey.split(',').map(Number);
      const dist = Math.abs(tq - city.q) + Math.abs(tr - city.r);
      if (dist < bestDist) { bestDist = dist; best = tKey; }
    }
    if (best) {
      tiles[best].hasTown = true;
      tiles[best].townName = city.name;
      tiles[best].hasRiver = false;
      cityHexes.add(best);
      console.log(`Placed ${city.name} at ${best} (nearest, was at ${toKey(city.q, city.r)})`);
    }
  }
}

// --- Print city coordinates summary for exampleMaps.js ---
console.log('\nCity hex coordinates:');
for (const key of cityHexes) {
  const tile = tiles[key];
  console.log(`  ${tile.townName}: q=${tile.q}, r=${tile.r} (key: ${key})`);
}

// --- Write output ---
const outPath = join(ROOT, 'src/data/large-map.json');
writeFileSync(outPath, JSON.stringify(tiles, null, 2));
console.log(`\nWrote ${Object.keys(tiles).length} tiles to ${outPath}`);

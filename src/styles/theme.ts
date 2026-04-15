import type { AppTheme } from '../types/theme';
import {
  GrassIcon,
  FarmIcon,
  ForestIcon,
  MountainIcon,
  LakeIcon,
  OceanIcon,
} from '../assets/icons/terrain';
import { RiverIcon, RoadIcon, PortIcon } from '../assets/icons/features';
import { LandIcon, NavalIcon } from '../assets/icons/army';
import { VillageIcon, TownIcon, CityIcon } from '../assets/icons/town';

export const theme: AppTheme = {
  // ── Chrome ────────────────────────────────────────────────────────────────────
  background: '#1a1a2e',
  panelBackground: '#16213e',
  panelBorder: '#0f3460',
  text: '#e0e0e0',
  textMuted: '#888',
  accent: '#e94560',

  // ── Surface opacity tokens ────────────────────────────────────────────────────
  surface: {
    base: 'rgba(255,255,255,0.02)',
    subtle: 'rgba(255,255,255,0.03)',
    card: 'rgba(255,255,255,0.05)',
    hoverWeak: 'rgba(255,255,255,0.06)',
    hover: 'rgba(255,255,255,0.08)',
    activeWeak: 'rgba(255,255,255,0.10)',
    active: 'rgba(255,255,255,0.12)',
    borderFaint: 'rgba(255,255,255,0.10)',
    border: 'rgba(255,255,255,0.15)',
    borderMedium: 'rgba(255,255,255,0.20)',
    borderStrong: 'rgba(255,255,255,0.25)',
    borderFocus: 'rgba(255,255,255,0.40)',
    overlayLight: 'rgba(0,0,0,0.30)',
    overlayMedium: 'rgba(0,0,0,0.50)',
    overlayHeavy: 'rgba(0,0,0,0.60)',
  },

  // ── Semantic UI colours ───────────────────────────────────────────────────────
  ui: {
    success: '#27ae60',
    successLight: '#2ecc71',
    successImport: '#50dc64',
    danger: '#c0392b',
    dangerLight: '#e74c3c',
    paintMode: '#9370db',
  },

  // ── Terrain tiles ─────────────────────────────────────────────────────────────
  terrain: {
    grass: { color: '#7ec850', label: 'Grass' },
    farm: { color: '#c8a96e', label: 'Farm' },
    forest: { color: '#2d6a4f', label: 'Forest' },
    mountain: { color: '#6b6b6b', label: 'Mountain' },
    lake: { color: '#1a78c2', label: 'Lake' },
    ocean: { color: '#0d3d6e', label: 'Ocean' },
  },

  // ── Tile chrome ───────────────────────────────────────────────────────────────
  tileStroke: '#111',
  selectedStroke: '#e94560',
  ghostFill: 'rgba(255,255,255,0.05)',
  ghostStroke: 'rgba(255,255,255,0.25)',

  // ── Water edge outlines ───────────────────────────────────────────────────────
  waterEdge: {
    oceanWidth: 4,
    lakeWidth: 3,
    opacity: 0.9,
  },

  // ── Rivers ───────────────────────────────────────────────────────────────────
  river: {
    color: '#4499cc',
    width: 6,
    linecap: 'round',
    tension: 0.7,
    poolRadius: 7,
  },

  // ── Roads ────────────────────────────────────────────────────────────────────
  road: {
    color: '#8B7355',
    width: 3,
    linecap: 'square',
    tension: 0.5,
    poolRadius: 5,
  },

  // ── Towns ────────────────────────────────────────────────────────────────────
  town: {
    color: '#f5a623',
    labelColor: '#f5a623',
    labelShadow: 'rgba(0,0,0,0.7)',
    groundColor: '#7ec850',
    buildingColor: '#012731',
    streetColor: '#a08060',
    courtyardColor: '#5aaa44',
    fortification: {
      none: {
        groundColor: '#7ec850',
      },
      palisade: {
        wallColor: '#8B5E3C',
        wallWidth: 4,
        markColor: '#5a3a1a',
        markCount: 20,
      },
      stone: {
        wallColor: '#8a8a8a',
        wallWidth: 6,
        markColor: '#555555',
        markCount: 16,
      },
    },
    size: {
      village: { radius: 20, buildingCount: 2 },
      town: { radius: 28, buildingCount: 3 },
      city: { radius: 38, buildingCount: 5 },
    },
  },

  // ── Garrison (town with armies) ───────────────────────────────────────────────
  garrison: {
    borderColor: '#921b1b',
    borderWidth: 2.5,
    nameColor: '#d4a017',
    nameShadow: 'rgba(0,0,0,0.75)',
  },

  // ── Ports / docks ─────────────────────────────────────────────────────────────
  port: {
    color: '#7a5c1e',
    plankWidth: 4,
    pilingWidth: 2.5,
    plankHalf: 10,
    pilingLen: 13,
  },

  // ── Causeways ─────────────────────────────────────────────────────────────────
  causeway: {
    color: '#8B7355', // same brown as road (continuous embankment appearance)
    width: 4, // slightly wider than road to suggest a raised structure
    linecap: 'square',
    notchColor: '#4499cc', // river blue — water flowing through the channels
    notchWidth: 2.5,
  },

  // ── Faction colour palette ────────────────────────────────────────────────────
  factionColors: [
    '#e94560',
    '#f5a623',
    '#f0e040',
    '#7ec850',
    '#2dc7a0',
    '#4499cc',
    '#9b59b6',
    '#e67e22',
    '#ec407a',
    '#80cbc4',
    '#a1887f',
    '#90a4ae',
  ],

  // ── Army tokens ───────────────────────────────────────────────────────────────
  army: {
    tokenFill: 'rgba(0,0,0,0.7)',
    tokenStroke: 'rgba(255,255,255,0.35)',
    selectedColor: '#e94560',
    movingColor: '#ffaa00',
    labelFill: '#e0e0e0',
    labelStroke: '#000',
    labelStrokeWidth: 2.5,
    ringDash: '5 3',
    tokenRadius: 14,
    ringRadius: 18,
    stackSpacing: 24,
  },

  // ── Z-index scale ─────────────────────────────────────────────────────────────
  terrainButtonMix: {
    hoverPercent: 65,
    activePercent: 45,
    focusPercent: 45,
  },

  zIndex: {
    toggle: 40,
    toolbar: 50,
    panel: 100,
    dropdown: 110,
    backdrop: 149,
    sheet: 150,
    langModal: 151,
    modal: 200,
  },

  // ── Icon component map ────────────────────────────────────────────────────────
  icons: {
    terrain: {
      grass: GrassIcon,
      farm: FarmIcon,
      forest: ForestIcon,
      mountain: MountainIcon,
      lake: LakeIcon,
      ocean: OceanIcon,
    },
    features: {
      river: RiverIcon,
      road: RoadIcon,
      port: PortIcon,
    },
    army: {
      land: LandIcon,
      naval: NavalIcon,
    },
    town: {
      village: VillageIcon,
      town: TownIcon,
      city: CityIcon,
    },
  },
};

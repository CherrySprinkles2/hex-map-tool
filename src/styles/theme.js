export const theme = {
  // ── Chrome ────────────────────────────────────────────────────────────────────
  background:      '#1a1a2e',
  panelBackground: '#16213e',
  panelBorder:     '#0f3460',
  text:            '#e0e0e0',
  textMuted:       '#888',
  accent:          '#e94560',

  // ── Terrain tiles ─────────────────────────────────────────────────────────────
  terrain: {
    grass:    { color: '#7ec850', label: 'Grass',    icon: '🌿' },
    farm:     { color: '#c8a96e', label: 'Farm',     icon: '🌾' },
    forest:   { color: '#2d6a4f', label: 'Forest',   icon: '🌲' },
    mountain: { color: '#6b6b6b', label: 'Mountain', icon: '⛰️'  },
    lake:     { color: '#1a78c2', label: 'Lake',     icon: '🏞️'  },
    ocean:    { color: '#0d3d6e', label: 'Ocean',    icon: '🌊'  },
  },

  // ── Tile chrome ───────────────────────────────────────────────────────────────
  tileStroke:     '#111',
  selectedStroke: '#e94560',
  ghostFill:      'rgba(255,255,255,0.05)',
  ghostStroke:    'rgba(255,255,255,0.25)',

  // ── Water edge outlines ───────────────────────────────────────────────────────
  waterEdge: {
    oceanWidth: 4,
    lakeWidth:  3,
    opacity:    0.9,
  },

  // ── Rivers ───────────────────────────────────────────────────────────────────
  river: {
    color:      '#4499cc',
    width:      4,
    linecap:    'round',
    tension:    0.7,
    poolRadius: 7,
  },

  // ── Roads ────────────────────────────────────────────────────────────────────
  road: {
    color:      '#8B7355',
    width:      3,
    linecap:    'square',
    tension:    0.5,
    poolRadius: 5,
  },

  // ── Towns ────────────────────────────────────────────────────────────────────
  town: {
    color:       '#f5a623',   // building fill (house / castle walls)
    labelColor:  '#f5a623',   // town name text
    door:        'rgba(0,0,0,0.45)',
    window:      'rgba(0,0,0,0.35)',
    labelShadow: 'rgba(0,0,0,0.7)',
  },

  // ── Garrison (town with armies) ───────────────────────────────────────────────
  garrison: {
    ringColor:      '#d4a017',   // dashed ring around the castle
    ringDash:       '5 3',
    ringWidth:      1.8,
    nameColor:      '#d4a017',   // single-army name label
    nameShadow:     'rgba(0,0,0,0.75)',
  },

  // ── Ports / docks ─────────────────────────────────────────────────────────────
  port: {
    color:       '#7a5c1e',   // pilings + plank
    plankWidth:  4,
    pilingWidth: 2.5,
    plankHalf:   10,          // half-length of the plank (pixels)
    pilingLen:   13,          // how far pilings extend inward
  },

  // ── Army tokens ───────────────────────────────────────────────────────────────
  army: {
    tokenFill:        'rgba(0,0,0,0.7)',
    tokenStroke:      'rgba(255,255,255,0.35)',  // idle outline
    selectedColor:    '#e94560',                 // ring + outline when selected
    movingColor:      '#ffaa00',                 // ring + outline when in move-mode
    labelFill:        '#e0e0e0',
    labelStroke:      '#000',
    labelStrokeWidth: 2.5,
    ringDash:         '5 3',
    tokenRadius:      14,                        // background circle radius
    ringRadius:       18,                        // pulsing ring radius
    stackSpacing:     24,                        // horizontal offset between stacked tokens
  },
};

export const theme = {
  background: '#1a1a2e',
  panelBackground: '#16213e',
  panelBorder: '#0f3460',
  text: '#e0e0e0',
  textMuted: '#888',
  accent: '#e94560',

  terrain: {
    grass:    { color: '#7ec850', label: 'Grass',    icon: '🌿' },
    farm:     { color: '#c8a96e', label: 'Farm',     icon: '🌾' },
    forest:   { color: '#2d6a4f', label: 'Forest',   icon: '🌲' },
    mountain: { color: '#6b6b6b', label: 'Mountain', icon: '⛰️'  },
    lake:     { color: '#1a78c2', label: 'Lake',     icon: '🏞️'  },
    ocean:    { color: '#0d3d6e', label: 'Ocean',    icon: '🌊'  },
  },

  river: { color: '#4499cc', width: 4, linecap: 'round',  tension: 0.7, poolRadius: 7  },
  road:  { color: '#8B7355', width: 3, linecap: 'square', tension: 0.5, poolRadius: 5  },

  ghostFill: 'rgba(255,255,255,0.05)',
  ghostStroke: 'rgba(255,255,255,0.25)',
  selectedStroke: '#e94560',
  tileStroke: '#111',
};

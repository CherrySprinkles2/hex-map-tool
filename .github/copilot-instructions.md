# Copilot Instructions — Hex Map Tool

## Working with the Owner

- **Always ask clarifying questions** before planning or designing any new feature. Do not assume intent.
- **Never begin implementation** without explicitly confirming with the owner that they are ready to proceed.
- **Never run or suggest any `git` commands** in this repository.

---

## Commands

```bash
npm start          # dev server (localhost:3000)
npm run build      # production build — use this to verify changes compile correctly
```

There is no test suite. Validate changes with `npm run build`.

---

## Architecture

A React + Redux hex grid map editor rendered entirely in SVG. The map is infinite — tiles live in a flat Redux object keyed by axial coordinate strings.

**State shape:**
```js
{
  tiles:    { "q,r": { q, r, terrain, hasRiver, hasRoad } },  // e.g. { "0,0": { q:0, r:0, terrain:"grass", hasRiver:false, hasRoad:false } }
  viewport: { x, y, scale },                // pan offset + zoom (0.2–4)
  ui:       { selectedTile: "q,r" | null }
}
```

**Data flow:**
- `index.js` → Redux `<Provider>` → `App.js` → styled-components `<ThemeProvider>`
- `AppInner` calls `useLocalStorageSync()` which auto-saves `tiles` to localStorage on every store change and loads on mount (key: `hex-map-tool-tiles`)
- `HexGrid` is the SVG canvas. It computes ghost tile positions at render time by iterating all tile neighbours that don't exist in state
- `WaterOverlay` renders on top of tiles inside the same SVG `<g>` transform group

**Rendering order inside HexGrid's transform group:**
1. `GhostTile` components (behind)
2. `HexTile` components
3. `WaterOverlay`

---

## Hex Coordinate System

All spatial logic uses **pointy-top axial coordinates (q, r)** — see `src/components/HexGrid/HexUtils.js`.

- Tile positions are stored and referenced as `"q,r"` string keys via `toKey(q, r)` / `fromKey(key)`
- `HEX_SIZE = 50` (center-to-corner radius in pixels)
- Axial → pixel: `x = size*(√3·q + √3/2·r)`, `y = size*(3/2·r)`
- The SVG `<g>` transform centers the grid: `translate(width/2 + x, height/2 + y) scale(scale)`
- When adding new hex math, import from `HexUtils.js` — don't inline formulas

---

## Key Conventions

### styled-components
- Custom (non-HTML) props are prefixed with `$` to avoid DOM forwarding warnings — e.g. `$open`, `$active`, `$color`
- Theme values accessed via `${({ theme }) => theme.property}` — never hardcode colours
- All theme colours and terrain data live in `src/styles/theme.js`; `GlobalStyles.js` applies resets and body styles

### Redux
- No custom selector functions — selectors are inline `useSelector` calls
- Reducers use Immer-style direct mutations (Redux Toolkit handles immutability)
- `importTiles(payload)` replaces the entire tiles state — used for both JSON import and localStorage restore

### Adding terrain types
All terrain metadata lives in one place: `theme.terrain` in `src/styles/theme.js`:
```js
terrain: {
  grass:    { color: '#7ec850', label: 'Grass',    icon: '🌿' },
  farm:     { color: '#c8a96e', label: 'Farm',     icon: '🌾' },
  forest:   { color: '#2d6a4f', label: 'Forest',   icon: '🌲' },
  mountain: { color: '#6b6b6b', label: 'Mountain', icon: '⛰️'  },
  lake:     { color: '#1a78c2', label: 'Lake',     icon: '🏞️'  },
  ocean:    { color: '#0d3d6e', label: 'Ocean',    icon: '🌊'  },
}
```
`TileEditPanel` derives its terrain picker from this object automatically. Adding a new terrain type requires:
1. An entry in `theme.terrain` in `src/styles/theme.js`
2. A matching `<pattern id="pattern-NAME">` SVG element in `src/components/HexGrid/TerrainPatterns.jsx`
3. For water-like types that should merge edges and suppress river visuals: add the terrain name to `DEEP_WATER` in `src/components/HexGrid/WaterOverlay.jsx`

### Tile properties
Each tile has the shape `{ q, r, terrain, hasRiver, hasRoad }`. `hasRiver` and `hasRoad` are booleans:
- Rivers auto-connect via bezier curves to adjacent tiles that also have `hasRiver: true`
- Roads do the same with `hasRoad: true`
- Isolated river/road tiles render a small pool dot at the tile centre
- River and road visuals are suppressed on lake/ocean tiles (they are covered by water caps)

### Tile interactions
- **Left-click ghost tile**: creates a tile using the most common neighbour terrain (tie-broken by most recently placed), then auto-selects it
- **Left-click existing tile**: selects it and opens the edit panel
- **Right-click existing tile**: immediately deletes it (and deselects if it was selected)
- **Drag**: pan the viewport
- **Scroll wheel**: zoom (scale range 0.2–4)

### Terrain textures
Tiles render two polygons: a solid base colour and an SVG `<pattern>` texture overlay. Icons are shown only in `TileEditPanel`, never on the canvas. `<TerrainPatterns />` must be rendered **outside** the `<g transform=...>` group in `HexGrid` — placing it inside causes patterns to scale with pan/zoom and break.

### Unused files
`src/features/counter/` and `src/App.css` are CRA template leftovers and can be deleted.

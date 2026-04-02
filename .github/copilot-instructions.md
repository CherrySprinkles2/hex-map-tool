# Copilot Instructions — Hex Map Tool

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
  tiles:    { "q,r": { q, r, terrain } },   // e.g. { "0,0": { q:0, r:0, terrain:"plain" } }
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
  grass:  { color: '#7ec850', label: 'Grass',  icon: '🌿' },
  farm:   { color: '#c8a96e', label: 'Farm',   icon: '🌾' },
  forest: { color: '#2d6a4f', label: 'Forest', icon: '🌲' },
  // ...
}
```
`TileEditPanel` and `WaterOverlay` derive their behaviour from this object — adding a new terrain type only requires adding an entry here. Special visual behaviour for water types (river connectors, lake edge merging) is handled explicitly in `WaterOverlay.jsx`.

### Unused files
`src/features/counter/` and `src/App.css` are CRA template leftovers and can be deleted.

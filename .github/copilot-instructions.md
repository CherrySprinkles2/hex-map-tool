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

A React + Redux hex grid map editor rendered entirely in SVG. The map is infinite — tiles live in a flat Redux object keyed by axial coordinate strings. Multiple named maps are supported; each is stored separately in localStorage.

**State shape:**
```js
{
  tiles:      { "q,r": { q, r, terrain, hasRiver, hasRoad, riverBlocked, roadBlocked, hasTown, townName, portBlocked } },
  armies:     { "army-id": { id, q, r, name, composition } },
  viewport:   { x, y, scale },                        // pan offset + zoom (0.2–4)
  ui:         {
    selectedTile:    "q,r" | null,
    selectedArmyId:  string | null,
    placingArmy:     boolean,           // unused entry point; army placement is via TileEditPanel
    movingArmyId:    string | null,     // army currently in move-mode
    screen:          'home' | 'editor',
  },
  currentMap: { id: string | null, name: string },
}
```

**Data flow:**
- `index.js` → Redux `<Provider>` → `App.js` → styled-components `<ThemeProvider>`
- `App.js` renders `<HomeScreen>` or `<EditorInner>` based on `ui.screen`
- `EditorInner` renders `<Toolbar>`, `<ArmyPanel>`, `<HexGrid>`, `<TileEditPanel>`
- `useLocalStorageSync()` auto-saves `tiles` and `armies` to localStorage on every store change and loads on mount; re-runs when `currentMap.id` changes
- `migrateFromLegacy()` is called once on mount to convert old single-map `hex-map-tool-tiles` data
- `HexGrid` is the SVG canvas. It computes ghost tile positions at render time by iterating all tile neighbours that don't exist in state
- `WaterOverlay` renders on top of tiles inside the same SVG `<g>` transform group
- `ArmyToken` components are rendered last (top layer) inside the `<g>` transform group, except on town tiles where a garrison visual is used instead

**Rendering order inside HexGrid's transform group:**
1. `GhostTile` components (behind)
2. `HexTile` components
3. `WaterOverlay` — rivers, roads, towns/garrisons, ports, water fills
4. `ArmyToken` components — only on non-town tiles

**Inside WaterOverlay rendering order:**
1. `renderFlagPaths` for rivers (below water caps)
2. `renderFlagPaths` for roads (below water caps)
3. `renderTowns(tiles, armiesByTile)` — house or castle+garrison-ring depending on armies present
4. Water caps (fill lake/ocean on top of above)
5. Water edge merging
6. `renderPorts` (on top of water fill)

---

## Multi-Map Storage

- **Index key**: `hex-map-tool-index` — JSON array of `{ id, name, updatedAt }`
- **Per-map tiles key**: `hex-map-tool-map-{id}` — JSON object of tile data
- **Per-map armies key**: `hex-map-tool-armies-{id}` — JSON object of army data
- All CRUD lives in `src/utils/mapsStorage.js`: `getAllMaps`, `createMap`, `deleteMap`, `loadMapTiles`, `saveMapTiles`, `loadMapArmies`, `saveMapArmies`, `touchMap`, `migrateFromLegacy`
- `deleteMap` removes both the tiles key and the armies key
- `migrateFromLegacy` checks for the old `hex-map-tool-tiles` key on first launch and converts it
- **Lazy example save**: opening a built-in example dispatches `loadMap({ id: null })` — no localStorage entry is created until the first tile or army change

---

## Hex Coordinate System

All spatial logic uses **pointy-top axial coordinates (q, r)** — see `src/components/HexGrid/HexUtils.js`.

- Tile positions are stored and referenced as `"q,r"` string keys via `toKey(q, r)` / `fromKey(key)`
- `HEX_SIZE = 50` (center-to-corner radius in pixels)
- Axial → pixel: `x = size*(√3·q + √3/2·r)`, `y = size*(3/2·r)`
- The SVG `<g>` transform centers the grid: `translate(width/2 + x, height/2 + y) scale(scale)`
- When adding new hex math, import from `HexUtils.js` — don't inline formulas

---

## Performance Architecture

- `React.memo` on `HexTile`, `GhostTile`, `WaterOverlay`, `WaterCap`, `ArmyToken` — prevents re-renders during pan/zoom
- Tile-specific `isSelected` selectors (`state.ui.selectedTile === key`) — only the affected tile re-renders on selection change
- `GhostTile` and `HexTile` use `useStore()` to read army/UI state on click — no subscriptions, no extra re-renders
- **Ref-based viewport**: `viewportRef` holds the live x/y/scale; pan and zoom write directly to the DOM via `groupRef.current.setAttribute('transform', …)` — zero React re-renders per frame. Redux viewport is only updated at drag end / after each zoom tick for persistence
- `useLayoutEffect` + `store.subscribe` syncs Redux → ref for external viewport changes (map load, reset)

---

## Key Conventions

### styled-components
- Custom (non-HTML) props are prefixed with `$` to avoid DOM forwarding warnings — e.g. `$open`, `$active`, `$color`
- Theme values accessed via `${({ theme }) => theme.property}` — never hardcode colours
- All theme colours and visual properties live in `src/styles/theme.js`; `GlobalStyles.js` applies resets and body styles

### Theme structure
`src/styles/theme.js` is the single source of truth for all visual properties. Key sections:
- `theme.terrain` — tile fill colours, labels, icons
- `theme.river` / `theme.road` — path colour, width, linecap, bezier tension, pool radius
- `theme.waterEdge` — border width for lake/ocean edges
- `theme.town` — building fill, label colour, door/window shading
- `theme.garrison` — ring colour, dash pattern, army name colour (garrisoned town visual)
- `theme.port` — dock colour, plank/piling widths and lengths
- `theme.army` — token fill, idle/selected/moving colours, label, ring size, stack spacing

### Redux
- No custom selector functions — selectors are inline `useSelector` calls
- Reducers use Immer-style direct mutations (Redux Toolkit handles immutability)
- `importTiles(payload)` / `importArmies(payload)` replace entire slices — used for JSON import and localStorage restore
- Selecting an army deselects any selected tile (and vice versa) — enforced in `uiSlice` reducers

### Army feature
- Armies are placed via **TileEditPanel** "⚔ Add Army to Tile" button (no canvas placing mode)
- `ArmyPanel` (left side on desktop, bottom sheet on mobile) shows when `selectedArmyId !== null`
- **Move mode** (Option B): tap army → "↪ Move Army" in panel → army pulses orange → tap any tile/ghost tile to move; Cancel or Escape exits without moving. `HexTile` and `GhostTile` check `store.getState().ui.movingArmyId` on click — no new subscriptions
- **Garrison visual**: when a town tile has armies, `renderTowns` renders a castle + gold dashed ring instead of a house. Single army → army name shown above. Multiple armies → ring only. Army tokens are suppressed on town tiles (HexGrid checks `tiles[key]?.hasTown`)
- Armies on town tiles appear listed in TileEditPanel under "Armies on this tile" with a Select button

### Adding terrain types
All terrain metadata lives in one place: `theme.terrain` in `src/styles/theme.js`.
`TileEditPanel` derives its terrain picker from this object automatically. Adding a new terrain type requires:
1. An entry in `theme.terrain` in `src/styles/theme.js`
2. A matching `<pattern id="pattern-NAME">` SVG element in `src/components/HexGrid/TerrainPatterns.jsx`
3. For water-like types (merge edges, suppress river visuals, enable ports, show ⛵ for armies): add the terrain name to `DEEP_WATER` in `src/components/HexGrid/WaterOverlay.jsx`

### Tile properties
Each tile has the shape:
```js
{ q, r, terrain, hasRiver, hasRoad, riverBlocked, roadBlocked, hasTown, townName, portBlocked }
```
- `hasRiver` / `hasRoad` — auto-connect via bezier curves to adjacent tiles with the same flag
- `riverBlocked` / `roadBlocked` — arrays of neighbour keys where the connection is manually suppressed (stored symmetrically on both tiles)
- `hasTown` — renders a house/castle icon + town name label on the canvas; suppressed on water tiles
- `townName` — string label rendered below the town icon
- `portBlocked` — array of water-tile keys where the automatic port/dock should NOT appear (stored only on the town tile — one-sided)
- Isolated river/road tiles (no connected neighbours) render a small pool dot at the tile centre
- River and road visuals are suppressed on lake/ocean tiles (covered by water caps)

### Connection blocking system
`tilesSlice` exports `blockConnection(q, r, flag, neighborKey)` and `unblockConnection(q, r, flag, neighborKey)`:

```js
const BLOCKED_KEY = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked', hasTown: 'portBlocked' };
const ONE_SIDED   = new Set(['hasTown']);
```

- **Symmetric flags** (`hasRiver`, `hasRoad`): block stored on **both** tiles
- **One-sided flags** (`hasTown`/port): block stored only on the **town tile**
- When `toggleTileFlag` turns a flag OFF, it clears that tile's blocked array and (for symmetric flags) removes this tile's key from all neighbours' blocked arrays

### Tile interactions
- **Left-click ghost tile**: creates a tile using the most common neighbour terrain (tie-broken by most recently placed), then auto-selects it — unless `movingArmyId` is set, in which case it creates the tile and moves the army there
- **Left-click existing tile**: selects it and opens the edit panel — unless `movingArmyId` is set, in which case the army moves there
- **Right-click existing tile**: immediately deletes it (and deselects if it was selected)
- **Left-click army token**: selects the army (deselects any tile), opens ArmyPanel
- **Right-click army token**: immediately deletes the army
- **Drag**: pan the viewport
- **Scroll wheel**: zoom centred on cursor position (scale range 0.2–4)

### Terrain textures
Tiles render two polygons: a solid base colour and an SVG `<pattern>` texture overlay. Icons are shown only in `TileEditPanel`, never on the canvas. `<TerrainPatterns />` must be rendered **outside** the `<g transform=...>` group in `HexGrid` — placing it inside causes patterns to scale with pan/zoom and break.

### Ports (docks)
`renderPorts()` in `WaterOverlay` automatically places a dock on every `DEEP_WATER` tile edge that borders a `hasTown` tile, unless the town tile's `portBlocked` array contains the water tile's key. Port control is exposed in `TileEditPanel` under the Town toggle — it lists adjacent water tiles with **Remove Port / Add Port** buttons.

### Example maps
- Small map data: `src/data/example-map.json`
- Large map (3 000 tiles, performance testing): `src/data/large-map.json`
- `src/data/exampleMaps.js` imports both, applies field defaults via `normalizeTile`, and exports `exampleMaps`
- Opening an example from the home screen loads tiles into Redux with `id: null` — no localStorage entry until the first real change

### Unused files
`src/features/counter/` and `src/App.css` are CRA template leftovers and can be deleted.



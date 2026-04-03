# Hex Map Tool

An interactive hex grid map editor built with React, Redux, and styled-components. Build, annotate, and manage multiple named hex maps — all rendered in SVG, saved in your browser.

## Features

- **Multiple maps** — home screen to create, open, and delete named maps; current map name shown in the editor header
- **Infinite hex grid** — click ghost tiles at the edges of existing tiles to expand the map in any direction
- **Terrain types** — Grass, Farm, Forest, Mountain, Lake, Ocean; each with a distinct SVG texture
- **Rivers & Roads** — per-tile boolean flags; auto-connect to adjacent tiles with bezier curves; connections can be individually disconnected via the edit panel
- **Towns** — place a named settlement on any non-water tile; town name appears as an SVG label on the canvas
- **Ports** — when a town tile borders a lake or ocean, a dock automatically appears on the water tile's edge; individual port connections can be removed from the edit panel
- **Lake & Ocean merging** — water tiles merge their edges visually and cover river/road paths that pass through them
- **Zoom to cursor** — scroll wheel zooms centred on the cursor position
- **Terrain inference** — new tiles default to the most common terrain among their neighbours
- **Right-click delete** — instantly remove a tile without opening the panel
- **Persistence** — maps auto-save to `localStorage` on every change
- **Import / Export** — save and load any map as JSON via the toolbar
- **Example map** — a built-in map is available on the home screen; opening it creates an editable copy

## Getting Started

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build
```

There is no test suite. Validate changes with `npm run build`.

## Controls

| Action | Input |
|--------|-------|
| Add tile | Left-click a ghost (faded) tile |
| Select / edit tile | Left-click an existing tile |
| Delete tile | Right-click an existing tile |
| Pan | Click and drag on the canvas |
| Zoom (to cursor) | Scroll wheel |
| Back to home | ← Maps button in the toolbar |

## Tech Stack

- **React 18** (Create React App)
- **Redux Toolkit** — tiles, viewport, UI, and currentMap state
- **styled-components v6** — theming and component styles
- **SVG** — all map rendering, including patterns and overlays

## Project Structure

```
src/
  app/                    Redux store
  components/
    HexGrid/              SVG canvas, hex math, tiles, ghost tiles, water overlay, terrain patterns
    HomeScreen/           Home screen (map cards, thumbnails)
    TileEditPanel/        Side panel for modifying a selected tile
    Toolbar/              Map name (inline-editable), back button, export/import JSON
  data/
    example-map.json      Bundled example map tile data
    exampleMaps.js        Loads and normalises example-map.json; exports exampleMaps array
  features/
    currentMap/           currentMapSlice (id, name of the open map)
    tiles/                tilesSlice (addTile, updateTile, toggleTileFlag, blockConnection, unblockConnection, deleteTile, importTiles)
    viewport/             viewportSlice (pan, zoom-to-cursor)
    ui/                   uiSlice (selectedTile, screen)
  hooks/                  useLocalStorageSync (scoped to current map id)
  styles/                 theme.js, GlobalStyles.js
  utils/                  mapsStorage.js (localStorage CRUD + migration)
```

## Extending

**Adding a terrain type:**
1. Add an entry to `theme.terrain` in `src/styles/theme.js`
2. Add a matching `<pattern id="pattern-NAME">` in `src/components/HexGrid/TerrainPatterns.jsx`
3. If it is a water type (merges edges, suppresses river visuals, enables ports): add its name to `DEEP_WATER` in `src/components/HexGrid/WaterOverlay.jsx`

**Connection blocking system:**
- `tilesSlice` exports `blockConnection(q, r, flag, neighborKey)` and `unblockConnection(q, r, flag, neighborKey)`
- `BLOCKED_KEY` maps each flag to its storage array: `hasRiver→riverBlocked`, `hasRoad→roadBlocked`, `hasTown→portBlocked`
- `ONE_SIDED` flags (currently `hasTown`) store the block only on the source tile; symmetric flags (river, road) store it on both tiles

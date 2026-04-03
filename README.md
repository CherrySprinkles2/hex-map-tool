# Hex Map Tool

An interactive hex grid map editor built with React, Redux, and styled-components. Build and annotate infinite hex maps with terrain types, rivers, and roads — all rendered in SVG.

## Features

- **Infinite hex grid** — click ghost tiles at the edges of existing tiles to expand the map in any direction
- **Terrain types** — Grass, Farm, Forest, Mountain, Lake, Ocean; each with a distinct SVG texture
- **Rivers & Roads** — per-tile boolean flags; auto-connect to adjacent tiles with bezier curves for a natural look
- **Lake & Ocean merging** — water tiles merge their edges visually and cover river/road paths that pass through them
- **Terrain inference** — new tiles default to the most common terrain among their neighbours
- **Tile editing** — click a tile to open a side panel; change terrain, toggle river/road
- **Right-click delete** — instantly remove a tile without opening the panel
- **Pan & zoom** — drag to pan, scroll wheel to zoom (0.2×–4×)
- **Persistence** — map auto-saves to `localStorage` on every change; reloads automatically on next visit
- **Import / Export** — save and load your map as JSON via the toolbar

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
| Select tile | Left-click an existing tile |
| Delete tile | Right-click an existing tile |
| Pan | Click and drag on the canvas |
| Zoom | Scroll wheel |

## Tech Stack

- **React 18** (Create React App)
- **Redux Toolkit** — tiles, viewport, and UI state
- **styled-components v6** — theming and component styles
- **SVG** — all map rendering, including patterns and overlays

## Project Structure

```
src/
  app/                    Redux store
  components/
    HexGrid/              SVG canvas, hex math, tiles, ghost tiles, water overlay, terrain patterns
    TileEditPanel/        Side panel for modifying a selected tile
    Toolbar/              Export / import JSON
  features/
    tiles/                tilesSlice (addTile, updateTile, toggleTileFlag, deleteTile, importTiles)
    viewport/             viewportSlice (pan, zoom)
    ui/                   uiSlice (selectedTile)
  hooks/                  useLocalStorageSync
  styles/                 theme.js, GlobalStyles.js
```

## Extending

**Adding a terrain type:**
1. Add an entry to `theme.terrain` in `src/styles/theme.js`
2. Add a matching `<pattern id="pattern-NAME">` in `src/components/HexGrid/TerrainPatterns.jsx`
3. If it is a water type (merges edges, suppresses river visuals), add its name to `DEEP_WATER` in `src/components/HexGrid/WaterOverlay.jsx`

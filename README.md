# Hex Map Tool

An interactive hex grid map editor built with React, Redux, and styled-components. Design worlds, place terrain, found towns, and command armies — all rendered live as SVG, saved in your browser.

## Features

- **Multiple maps** — home screen to create, open, rename, and delete named maps
- **Infinite hex grid** — click ghost tiles at the edges of existing tiles to expand in any direction
- **Terrain types** — Grass, Farm, Forest, Mountain, Lake, Ocean; each with a distinct SVG texture
- **Rivers & Roads** — per-tile boolean flags; auto-connect to adjacent tiles with bezier curves; individual connections can be blocked via the edit panel
- **Towns** — place a named settlement on any non-water tile; town name appears as an SVG label on the canvas
- **Ports** — when a town borders a lake or ocean, a dock automatically appears on the water tile's edge; individual port connections can be removed from the edit panel
- **Lake & Ocean merging** — water tiles merge their edges visually and cover river/road paths
- **Armies** — place military forces on any tile via the tile edit panel; armies display as ⚔️ tokens on land and ⛵ on water; edit name and composition in a floating panel; move armies using Move mode (select → Move → tap destination)
- **Garrison** — when an army occupies a town, the house icon becomes a castle with battlements and a gold garrison ring; a single army's name appears above the castle
- **Performance** — ref-based viewport management bypasses React on every pan/zoom frame; `React.memo` and `useMemo` on all tile components
- **Lazy example saves** — opening a built-in example map only creates a localStorage copy on the first edit
- **Zoom to cursor** — scroll wheel zooms centred on the cursor position
- **Terrain inference** — new tiles default to the most common terrain among their neighbours
- **Right-click delete** — instantly remove a tile or army
- **Persistence** — maps and armies auto-save to `localStorage` on every change
- **Import / Export** — save and load any map as JSON via the toolbar
- **Themeable** — all visual properties (colours, stroke widths, sizes) live in `src/styles/theme.js`

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
| Add army to tile | Select tile → "⚔ Add Army to Tile" in the edit panel |
| Select army | Left-click an army token |
| Move army | Select army → "↪ Move Army" → tap destination tile |
| Delete army | Right-click army token, or Delete button in Army Panel |
| Pan | Click and drag on the canvas |
| Zoom (to cursor) | Scroll wheel |
| Back to home | ← Maps button in the toolbar |

## Tech Stack

- **React 18** (Create React App)
- **Redux Toolkit** — tiles, armies, viewport, UI, and currentMap slices
- **styled-components v6** — theming and component styles
- **SVG** — all map rendering, including patterns, overlays, and army tokens

## Project Structure

```
src/
  app/                    Redux store
  components/
    ArmyPanel/            Floating left-side panel for editing a selected army
    HexGrid/              SVG canvas, hex math, tiles, ghost tiles, water overlay,
                          terrain patterns, army tokens
    HomeScreen/           Home screen (map cards, example maps)
    TileEditPanel/        Right-side panel for modifying a selected tile (incl. armies list)
    Toolbar/              Map name (inline-editable), back button, export/import JSON
  data/
    example-map.json      Small bundled example map
    large-map.json        3 000-tile performance test map
    exampleMaps.js        Loads and normalises example maps; exports exampleMaps array
  features/
    armies/               armiesSlice (addArmy, deleteArmy, moveArmy, updateArmy, importArmies)
    currentMap/           currentMapSlice (id, name of the open map)
    tiles/                tilesSlice (addTile, updateTile, toggleTileFlag, blockConnection, …)
    viewport/             viewportSlice (setViewport, MIN_SCALE, MAX_SCALE)
    ui/                   uiSlice (selectedTile, selectedArmyId, placingArmy, movingArmyId, screen)
  hooks/                  useLocalStorageSync (tiles + armies; lazy-save for example maps)
  styles/                 theme.js, GlobalStyles.js
  utils/                  mapsStorage.js (localStorage CRUD + armies I/O + migration)
```

## Theming

All visual properties are centralised in `src/styles/theme.js`. Key sections:

| Key | Controls |
|-----|----------|
| `theme.terrain` | Tile fill colours, labels, icons |
| `theme.river` / `theme.road` | Path colour, width, linecap, bezier tension, pool radius |
| `theme.town` | Building fill, label colour, door/window shading |
| `theme.garrison` | Ring colour, dash pattern, army name colour (garrisoned town) |
| `theme.port` | Dock colour, plank/piling widths and lengths |
| `theme.army` | Token fill, idle/selected/moving colours, label, ring size, stack spacing |
| `theme.waterEdge` | Border widths for lake/ocean edges |

## Extending

**Adding a terrain type:**
1. Add an entry to `theme.terrain` in `src/styles/theme.js`
2. Add a matching `<pattern id="pattern-NAME">` in `src/components/HexGrid/TerrainPatterns.jsx`
3. If it is a water type (merges edges, suppresses river visuals, enables ports, shows boat icon for armies): add its name to `DEEP_WATER` in `src/components/HexGrid/WaterOverlay.jsx`

**Connection blocking system:**
- `tilesSlice` exports `blockConnection(q, r, flag, neighborKey)` and `unblockConnection(q, r, flag, neighborKey)`
- `BLOCKED_KEY` maps each flag to its storage array: `hasRiver→riverBlocked`, `hasRoad→roadBlocked`, `hasTown→portBlocked`
- `ONE_SIDED` flags (currently `hasTown`) store the block only on the source tile; symmetric flags (river, road) store it on both tiles

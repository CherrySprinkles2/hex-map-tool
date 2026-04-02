# Hex Map Tool — Plan

## Overview
A hex grid tile system where users start with a single tile and grow a map by clicking ghost/placeholder hexes on empty edges. Tiles are editable with terrain types. The map persists via localStorage and can be exported/imported as JSON.

## Key Decisions

| Concern | Decision |
|---|---|
| Hex orientation | Pointy-top |
| Renderer | SVG |
| Coordinate system | Axial (q, r) — efficient for neighbour lookup |
| Adding tiles | Ghost/placeholder hexes shown at all empty edges |
| Editing tiles | Click tile → opens side panel |
| Zoom / Pan | Mouse wheel zoom + click-drag pan |
| Terrain types (v1) | Plain, Forest, Lake, River, Mountain |
| Water rendering | River tiles connect edge-to-edge with adjacent rivers; lakes merge visually when adjacent |
| Tile deletion | Via the edit panel |
| Persistence | Auto-save to localStorage; Export / Import as JSON |
| Map size | Infinite — no limits |

---

## Redux Store Shape

```js
{
  tiles: {
    // keyed by "q,r"
    "0,0": { q: 0, r: 0, terrain: "plain" }
  },
  viewport: { x: 0, y: 0, scale: 1 },
  ui: { selectedTile: null } // coordKey | null
}
```

---

## Folder Structure

```
src/
  app/
    store.js
  features/
    tiles/
      tilesSlice.js         — addTile, updateTile, deleteTile
    viewport/
      viewportSlice.js      — pan, zoom
    ui/
      uiSlice.js            — selectedTile
  components/
    HexGrid/
      HexGrid.jsx           — SVG canvas, pan/zoom handling
      HexTile.jsx           — single filled hex polygon
      GhostTile.jsx         — placeholder hex on empty neighbour edges
      HexUtils.js           — axial math & pointy-top geometry helpers
    TileEditPanel/
      TileEditPanel.jsx     — terrain picker + delete button
    Toolbar/
      Toolbar.jsx           — Export JSON / Import JSON
  hooks/
    useLocalStorageSync.js  — auto-saves tiles to localStorage on change
  styles/
    GlobalStyles.js         — styled-components global styles + app layout
    theme.js                — colour palette (terrain colours, etc.)
```

---

## Components

### HexGrid
- Renders an `<svg>` filling the viewport
- Applies a `<g transform="translate+scale">` driven by viewport state
- Mouse wheel → dispatch zoom; mousedown+drag → dispatch pan
- Computes the set of ghost tile positions: all neighbours of existing tiles that are not themselves tiles

### HexTile
- Renders a pointy-top `<polygon>` at axial position (q, r)
- Fill colour driven by terrain type from theme
- Click → dispatch `selectTile(coordKey)`

### GhostTile
- Same shape as HexTile but semi-transparent with dashed border
- Click → dispatch `addTile({ q, r, terrain: "plain" })`

### TileEditPanel
- Slides in from the right when a tile is selected
- Terrain picker: icon + colour swatch for each type
- Delete button → dispatch `deleteTile(coordKey)` then deselect

### Toolbar
- **Export:** Serialise `tiles` state → download as `.json` file
- **Import:** File picker → parse JSON → replace `tiles` state

### Water Connectivity (River + Lake)
- **River:** For each river tile, draw SVG lines from tile centre to the midpoint of each edge shared with an adjacent river tile
- **Lake:** Render a merged SVG outline by hiding shared edges between adjacent lake tiles

---

## Implementation Todos

| # | ID | Title | Depends on |
|---|---|---|---|
| 1 | `hex-utils` | Axial coordinate helpers | — |
| 2 | `tiles-slice` | Redux tiles slice | — |
| 3 | `viewport-slice` | Redux viewport slice | — |
| 4 | `ui-slice` | Redux UI slice | — |
| 5 | `theme` | Styled-components theme + terrain colours | — |
| 6 | `hex-tile` | HexTile SVG component | hex-utils, theme |
| 7 | `ghost-tile` | GhostTile SVG component | hex-utils, tiles-slice |
| 8 | `hex-grid` | HexGrid SVG canvas component | hex-utils, viewport-slice, tiles-slice |
| 9 | `water-connectivity` | Water connectivity rendering | hex-tile |
| 10 | `tile-edit-panel` | TileEditPanel component | ui-slice, tiles-slice, theme |
| 11 | `toolbar` | Toolbar component | tiles-slice |
| 12 | `localstorage-sync` | localStorage sync hook | tiles-slice |
| 13 | `global-styles` | Global styles + app layout | theme |

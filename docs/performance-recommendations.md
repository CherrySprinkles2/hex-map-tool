# Performance Recommendations: Scaling to 20K Hex Tiles

## Current State

The app renders hex tiles as SVG polygons in a React + Redux architecture. Viewport culling is already implemented for `HexTile` and `ArmyToken` components (tiles outside the viewport are not rendered to the DOM). Despite this, the app struggles at ~5K tiles due to several bottlenecks described below.

---

## High-Impact Changes

### 1. Cull overlays to the visible viewport

**Problem:** `WaterOverlay` receives **all** tiles and iterates every one of them to compute rivers, roads, towns, ports, and causeways — even tiles that are off-screen. At 5K tiles this is already the dominant cost; at 20K it would be catastrophic.

**Fix:** Pass only the culled visible tile set (plus a 1-tile border for edge continuity) to `WaterOverlay` and all its render helpers (`renderFlagPaths`, `renderRoadPaths`, `renderTownIcons`, etc.). The existing `useViewportCulling` hook already produces this set — it just isn't used for overlays.

**Expected impact:** Reduces overlay work from O(total tiles) to O(visible tiles). At a typical zoom level showing ~200-400 tiles, this is a 10-50x reduction.

---

### 2. Batch paint-stroke dispatches

**Problem:** When painting terrain with a brush, each tile in the stroke dispatches an individual Redux action. A single drag across 50 tiles fires 50 dispatches, each triggering a re-render cycle (HexGrid subscription fires, visible set recomputed, memoization checks run for all visible tiles).

**Fix:** Collect all tile mutations during a paint stroke into a single batched action. Add a `updateTiles` (plural) reducer that accepts an array of tile updates and applies them in one Immer draft. Dispatch once per `pointermove` event instead of once per tile.

**Expected impact:** Reduces render cycles during painting by ~10-50x depending on brush size and drag speed.

---

### 3. Avoid full HexGrid re-render on every tile change

**Problem:** `HexGrid` subscribes to the entire `tiles` object (`useAppSelector(state => state.tiles)`). Any single tile mutation causes HexGrid to re-render, which means re-running viewport culling, recomputing ghost tiles, and checking memoization on every visible `HexTile`.

**Fix options (pick one):**

- **Selector stabilization:** Use a selector that returns a stable reference when the set of tile keys hasn't changed (only the values). HexGrid only needs tile keys to decide _which_ components to render; each `HexTile` already subscribes to its own data.
- **Split concerns:** Have HexGrid subscribe only to `Object.keys(tiles)` (the key set) via a memoized selector. Tile data subscriptions stay in `HexTile`.

**Expected impact:** Eliminates unnecessary HexGrid re-renders when editing existing tiles (terrain changes, feature toggles, faction assignments). Only tile additions/deletions would trigger HexGrid.

---

### 4. Virtualize overlay SVG elements with spatial indexing

**Problem:** Even with viewport culling on the input data, the overlay helpers create individual React elements for every path segment. React's reconciliation must diff all of these on every update.

**Fix:** Pre-compute overlay paths into a spatial index (e.g., a simple grid of chunks). On render, only mount the SVG `<path>` elements for chunks that intersect the viewport. When the viewport moves, swap chunks in/out. This is conceptually similar to tile-based map rendering in game engines.

**Expected impact:** Reduces SVG DOM node count and React reconciliation work proportionally to viewport size rather than total map size.

---

## Medium-Impact Changes

### 5. Pre-compute and cache bezier paths

**Problem:** `renderFlagPaths` and `renderRoadPaths` recompute cubic bezier curves from scratch on every render. The path generation involves `computeConnectedDirs`, `pairDirections`, `buildSimpleCurve`, and (for roads) `intersectCubics` — all of which are pure functions of tile data.

**Fix:** Cache computed paths in a `Map<string, FeaturePath[]>` keyed by tile key. Invalidate only when a tile's relevant properties change (e.g., `hasRiver`, `riverBlocked`, or a neighbor's river state). This can be a simple memoization layer outside of React.

**Expected impact:** After initial computation, subsequent renders skip all bezier math for unchanged tiles. Particularly impactful for road-river intersections which are O(r x c) per tile.

---

### 6. Reduce SVG polygons per tile

**Problem:** Each `HexTile` renders 2-4 overlapping `<polygon>` elements (base fill, pattern fill, faction overlay, hover highlight). At 400 visible tiles, that's 800-1600 polygon elements just for tiles.

**Fix options:**

- Merge the base and pattern polygons into one using SVG compositing (e.g., `<use>` with the pattern as a mask).
- Only render the hover polygon on the single hovered tile (not all tiles).
- Only render the faction overlay polygon when in faction view mode.

**Expected impact:** 30-50% reduction in SVG DOM elements for the tile layer.

---

### 7. Use CSS `will-change` and layer promotion for the transform group

**Problem:** The main `<g>` element is transformed on every pan/zoom frame via `setAttribute`. The browser may not optimize this for GPU compositing.

**Fix:** Add `will-change: transform` to the transform group (or use a CSS class). This hints to the browser to promote the layer to its own compositing surface, enabling GPU-accelerated transforms.

**Expected impact:** Smoother panning and zooming, especially on integrated GPUs. Free performance with no architectural changes.

---

### 8. Throttle viewport culling more aggressively

**Problem:** Viewport culling currently runs every 4 frames (`FRAMES_PER_UPDATE = 4`). At 60fps that's 15 culling passes per second, each iterating all tiles.

**Fix:** Increase `FRAMES_PER_UPDATE` or switch to a debounced/throttled approach (e.g., recalculate only when the viewport has moved more than half a tile's width since the last calculation). Add a generous padding buffer so tiles don't pop in visibly.

**Expected impact:** Reduces culling overhead, especially during continuous panning. More impactful at 20K tiles where each culling pass iterates 20K entries.

---

### 9. Use a spatial index for culling instead of brute-force iteration

**Problem:** `useViewportCulling` iterates **every** tile on each culling pass, checking if its screen-space position is within bounds. At 20K tiles this is 20K position calculations per pass.

**Fix:** Use a spatial data structure (quadtree, grid hash, or even a sorted array by axial coordinate). For hex grids, a simple approach is to compute the axial coordinate range visible in the viewport and select tiles within that range — this is O(1) math to find the range, then O(visible) to collect tiles.

**Expected impact:** Culling drops from O(total) to O(visible), which at 20K tiles with ~400 visible is a 50x improvement per culling pass.

---

## Lower-Impact / Long-Term Changes

### 10. Canvas rendering for the tile layer

**Problem:** SVG DOM elements scale linearly — each visible tile is multiple DOM nodes that the browser must lay out, paint, and composite. Beyond ~2K visible elements, SVG performance degrades on most browsers.

**Fix:** Render the hex tile polygons to an HTML5 Canvas (or OffscreenCanvas in a worker). Keep SVG for interactive overlays (selection, hover effects) that benefit from DOM event handling. Libraries like `react-konva` or a custom canvas renderer could be used.

**Expected impact:** Order-of-magnitude improvement in raw rendering throughput. Canvas can comfortably handle 50K+ polygons at 60fps. This is the nuclear option — highest effort but removes the fundamental scaling ceiling.

---

### 11. Web Worker for path computation

**Problem:** Bezier path generation and road-river intersection detection are CPU-intensive pure computations that block the main thread.

**Fix:** Move `buildFeaturePaths`, `buildRoadPaths`, and `intersectCubics` into a Web Worker. Send tile data to the worker, receive computed SVG path strings back. The main thread renders the results without blocking user interaction.

**Expected impact:** Keeps the UI responsive during heavy computation. Most beneficial combined with recommendation #5 (caching) — the worker recomputes only changed paths.

---

### 12. Incremental overlay updates

**Problem:** When one tile changes, the entire overlay (all rivers, all roads, all towns) is recomputed from scratch.

**Fix:** Structure overlay data so that changing one tile only requires recomputing that tile's paths and its immediate neighbors' paths. Maintain a persistent overlay data structure that is patched incrementally.

**Expected impact:** Tile edits become O(1) instead of O(n) for overlay updates. Significant when frequently editing tiles on large maps.

---

### 13. Virtualize ghost tiles

**Problem:** Ghost tiles (the "add tile" placeholders around the map border) are computed from all visible tiles and their neighbors. On a 5K-tile map, there can be thousands of ghost tiles.

**Fix:** Apply the same viewport culling to ghost tiles — only compute and render ghosts for tiles near the visible viewport edge, not the entire map border.

**Expected impact:** Reduces ghost tile count from O(perimeter of map) to O(visible edge tiles). Moderate DOM reduction.

---

## Recommended Priority Order

For reaching the 20K tile target with reasonable effort:

| Priority | Recommendation                  | Effort    | Impact      |
| -------- | ------------------------------- | --------- | ----------- |
| 1        | Cull overlays to viewport (#1)  | Low       | Very High   |
| 2        | Batch paint dispatches (#2)     | Low       | High        |
| 3        | Stabilize HexGrid selector (#3) | Low       | High        |
| 4        | Spatial index for culling (#9)  | Medium    | High        |
| 5        | Cache bezier paths (#5)         | Medium    | Medium-High |
| 6        | CSS `will-change` (#7)          | Trivial   | Medium      |
| 7        | Reduce polygons per tile (#6)   | Low       | Medium      |
| 8        | Throttle culling smarter (#8)   | Low       | Medium      |
| 9        | Virtualize ghost tiles (#13)    | Low       | Low-Medium  |
| 10       | Spatial overlay chunking (#4)   | High      | High        |
| 11       | Canvas rendering (#10)          | Very High | Very High   |
| 12       | Web Worker paths (#11)          | Medium    | Medium      |
| 13       | Incremental overlays (#12)      | High      | High        |

Recommendations 1-3 are low-effort, high-impact changes that should be tackled first. Together they would likely get performance acceptable at 10-15K tiles. Adding recommendations 4-5 should reach the 20K target. Recommendations 10+ are architectural overhauls to consider only if the SVG approach hits a hard ceiling.

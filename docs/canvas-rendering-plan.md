# Canvas Rendering Migration Plan

Migrate the hex map from SVG to a single `<canvas>` element rendered with the raw Canvas 2D API, with an optional move into an OffscreenCanvas worker. The goal is to remove the SVG-DOM ceiling that limits how many hexes can be shown smoothly and to open the door to 20K+ tile maps.

This plan is self-contained: it does not assume any of the other recommendations in `performance-recommendations.md` have been completed.

---

## 1. Current SVG rendering — what we are replacing

A single `<SvgCanvas>` in `src/components/HexGrid/HexGrid.tsx` hosts everything under one `<g transform>` group whose `transform` is mutated imperatively on pan/zoom. Inside the group, per-tile React components are mounted only when inside the viewport (culled by `useViewportCulling`).

Per-visible-tile DOM cost (roughly):

| Layer              | Source                                                      | SVG nodes per tile (typical)                                                                         |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Base + pattern     | `HexTile.tsx`                                               | 2 `<polygon>` (fill + pattern), +1 faction, +1 hover                                                 |
| Ghost border       | `GhostTile.tsx`                                             | 1 `<polygon>` (only at viewport edge)                                                                |
| Rivers / roads     | `overlayHelpers.renderFlagPaths` / `renderRoadPaths`        | 1 `<g>` + 1 `<path>` per connected edge pair                                                         |
| Causeways          | `renderCausewayPaths`                                       | 1 embankment path + 1–6 notch lines                                                                  |
| Town icons         | `renderTownIcons` + `VillageIcon` / `TownIcon` / `CityIcon` | inline SVG icon (up to ~15 elements) + wall circle + up to 20 wall marks + kite shield (~8 elements) |
| Town + army labels | `renderTownLabels`                                          | 1–2 `<text>`                                                                                         |
| Ports              | `renderPorts`                                               | 4 `<line>` per water-adjacent edge                                                                   |
| Army tokens        | `ArmyToken.tsx`                                             | 2 `<circle>` + inline icon + optional ring + `<text>`                                                |
| Selection ring     | inline in HexGrid                                           | 1 animated `<polygon>` (CSS `marchingAnts`)                                                          |

At 400 visible tiles with a realistic mix of towns, rivers and roads this is easily 3K–6K live SVG nodes plus React's reconciliation pass on each update. That is what caps practical zoom-out scale on large maps.

### Non-rendering concerns the plan must preserve

- **Event model.** Hit-testing is currently done by the browser on per-element pointer events (per-tile `onClick`, `onContextMenu`, `onPointerDown`, `onPointerEnter`, `onMouseEnter`). Pan / zoom / pinch / wheel is handled on the `<svg>` root in `HexGrid.tsx`.
- **Paint stroke semantics.** `isPaintingRef` + `pointerEnter` currently drags terrain/faction/river/road brushes. `handleMouseMove` in HexGrid converts screen → axial and interpolates along `hexLine` when paint mode is active.
- **Ref-based transform.** `groupRef.current.setAttribute('transform', …)` updates pan/zoom at 60fps without re-rendering React. Canvas version must preserve zero-React-render panning.
- **Pattern compositing.** Each SVG pattern is a small transparent tile of marks (e.g. `rgba(0,80,0,0.28)` lines on transparent) painted over the tile base fill. Size varies per terrain (14×14 up to 50×18).
- **Transparent overlays.** Patterns are drawn with `opacity ~0.18–0.28` alpha marks, so the base fill bleeds through. Canvas parity requires drawing the pattern over the fill, not in place of it.
- **`data-testid` hooks.** Playwright tests use `hex-tile-{q},{r}` and `ghost-tile-{q},{r}` locators in 59 places across `e2e/`. Canvas has no DOM-addressable children; we need a replacement strategy (see §9 Testing).
- **Thumbnails.** `src/utils/captureThumbnail.ts` already uses canvas. Home-screen previews go through `MapThumbnail.tsx`. This path is mostly independent but can be unified with the new renderer in a later phase.
- **Deferred updates.** `WaterOverlay` uses `useDeferredValue(tiles)` so overlay recomputation yields to input. The canvas renderer needs an equivalent yielding strategy (dirty queue + rAF batching, or worker-side debouncing).

---

## 2. Target architecture

### 2.1 Single canvas, layered painter

Replace the `<SvgCanvas>` with a single `<canvas>` element, rendered by an imperative `HexRenderer` class. The canvas owns all drawing; React only owns the canvas element and surrounding chrome.

Paint order per frame (matches today's SVG stacking):

1. Background fill (theme.background).
2. Ghost tiles (dashed borders, only at viewport edge).
3. Base-fill hexes — filled with per-terrain cached color.
4. Pattern hexes — same geometry filled with a cached `CanvasPattern` on top of the base (alpha-blended).
5. Faction overlay ring (faction mode only).
6. Hover highlight (single tile, if any).
7. Rivers → roads → causeways (cubic beziers, stroked).
8. Town icons + walls + wall marks + kite shields.
9. Ports.
10. Army tokens (non-garrison tiles).
11. Town + army labels (text on top).
12. Selection ring (animated, drawn on a separate overlay canvas — see §2.3).

### 2.2 Coordinate system

The renderer draws in world (axial pixel) space and applies a `ctx.setTransform(dpr*scale, 0, 0, dpr*scale, dpr*(w/2 + x), dpr*(h/2 + y))` at the start of each frame. This:

- Mirrors the current SVG group transform 1:1 (so `axialToPixel` values remain unchanged).
- Handles `devicePixelRatio` automatically by baking it into the transform; all strokes/paths are specified in CSS pixels.
- Keeps the "ref-based viewport" model: pan/zoom updates `viewportRef` and schedules a repaint — no React re-render needed.

### 2.3 Two-canvas split (static vs. animated)

The selection ring (`marchingAnts`) and the selected army ring animate continuously. Re-painting the full map every frame just to advance a dashed stroke is wasteful.

Use two stacked canvases:

- **`mapCanvas`** — primary canvas. Repainted on pan/zoom/data changes. Handles all non-animated layers.
- **`overlayCanvas`** — transparent canvas positioned on top of `mapCanvas`. Hosts the selection ring, moving-army ring, and any future animated effects. Repainted on its own rAF loop with a dash-offset that advances each frame.

Both canvases share the same transform. The overlay canvas is small (only draws 1–few rings) so its rAF cost is negligible.

Pointer events are attached to the top `overlayCanvas`; hit-testing is mathematical (§2.6) and independent of which canvas the pointer lands on.

### 2.4 Pattern cache

For each terrain (built-in + custom):

1. At startup / on custom-terrain change, create an offscreen `document.createElement('canvas')` (or `OffscreenCanvas`) sized to the pattern's repeat unit (e.g. 14×14 for grass, 50×18 for ocean).
2. Draw the pattern marks onto it using Canvas 2D primitives (`beginPath`, `moveTo`, `lineTo`, `arc`, `stroke`, `fill`) that mirror each existing `*Pattern.tsx` exactly. Background stays transparent.
3. Store `ctx.createPattern(patternCanvas, 'repeat')` in a `Map<terrainId, CanvasPattern>`.

A tile is then drawn as: base color fill → set `ctx.fillStyle = cachedPattern` → fill same hex path.

This gives visual parity with the SVG patterns (which are also repeat-tiled marks over a base color). **Important:** Canvas patterns are not transformed automatically the way SVG `patternUnits="userSpaceOnUse"` patterns are; they track the current transform of the fill. Because we set the world transform once per frame and fill the hex in world coordinates, the pattern tiles will scale with zoom just like the SVG version — which matches current behavior.

Custom-terrain patterns are rebuilt whenever `state.terrainConfig.custom` changes (subscribe in `HexRenderer`).

### 2.5 Town icons, kite shields, ports

`VillageIcon`, `TownIcon`, `CityIcon`, `LandIcon`, `NavalIcon`, etc. are small SVG component files. Two options:

- **(a) Hand-port.** Rewrite each as a `drawTown(ctx, x, y, size, colors)` function using the same primitives. Pros: no bitmap blur at any zoom, full color theming, small. Cons: one-time porting cost (~8 icon files, each straightforward rects/circles/paths).
- **(b) Bake to offscreen bitmap.** `new Image()` from the SVG source, `drawImage` to offscreen canvas at several DPI tiers, pick the closest at draw time. Pros: minimal porting. Cons: bitmap scaling artifacts; theming color changes require re-bake.

**Recommendation: (a) hand-port.** The icons are simple, and faction-color tint on kite shields is already implemented in `renderKiteShield` as parameterized drawing. Hand-porting keeps all visual properties live-themed and vector-sharp at every zoom. Port the 3 town icons, 2 army icons, and the kite-shield / wall-mark logic. Everything else (rivers, roads, ports, causeway notches, town walls) is already imperative geometry in `overlayHelpers.tsx` and translates 1:1 to canvas calls.

### 2.6 Hit-testing

All interactivity is resolved in math on the main thread (no DOM events on sub-elements).

Hit test flow for a `pointerdown` at screen `(cx, cy)`:

1. Convert to world: `wx = (cx - w/2 - vx) / scale`, `wy = (cy - h/2 - vy) / scale`.
2. `const { q, r } = pixelToAxial(wx, wy)` (already exists in `hexUtils.ts`).
3. Build key `toKey(q, r)`. If present in `state.tiles` → tile click. Else if in `ghostKeys` → ghost click. Else → miss (deselect).
4. For army token hits: on tiles with armies, compute army token center (same formula as `ArmyToken.tsx`) and compare distance to `theme.army.tokenRadius`. Army hits take precedence over tile hits.
5. Dispatch the same Redux action the SVG version would have dispatched.

This removes the need for `<polygon>` / `<g>` pointer events entirely. Paint-stroke interpolation already uses `pixelToAxial` + `hexLine`, so no logic change is needed — only the entry point moves from per-tile `pointerEnter` to a single `pointermove` handler on the canvas root.

### 2.7 Dirty-region repaint

Full-frame repaints of ~400 visible hexes with cached patterns are cheap (sub-ms on modern hardware), so we do not need dirty-rect bookkeeping in the first cut. Repaint triggers:

- **Immediate repaint**: pan/zoom (already rAF-driven), selection change, hover tile change.
- **Debounced repaint** (via `requestAnimationFrame`): tile data changes (terrain, feature toggles, town edits). Collapsed into one frame per tick so bulk edits don't cause N paints.

Paint cycle is driven by a single `scheduleRepaint()` on the renderer. Multiple calls in the same frame coalesce to one.

### 2.8 Worker / OffscreenCanvas (Phase 7)

Once the main-thread renderer is stable and produces visual parity:

1. Transfer the main canvas to a dedicated worker via `canvas.transferControlToOffscreen()`.
2. Worker hosts the `HexRenderer` and maintains a mirror of the minimal state it needs (tiles, viewport, mapMode, selectedTile, hoveredTile, factions, armies, customTerrains).
3. Main thread posts diffs. For high-frequency updates (pan/zoom, hover), send via `postMessage` on every frame; because ownership of the canvas is already in the worker, no main-thread paint work competes.
4. Pointer events stay on the main thread (mandatory — no event loop in worker); hit-testing happens on the main thread from a cached copy of `tileKeys`. Only the result (dispatched actions) goes back into Redux as normal.
5. `overlayCanvas` (marching ants) stays on the main thread. The animation is tiny and keeping it there avoids worker round-trips for hover/selection feedback.

Fallback: browsers without OffscreenCanvas on workers (older Safari) fall back to the main-thread renderer. Because Phase 7 is additive, this just means that branch of `HexRenderer` isn't activated — all of the Phase 1–6 work stays as-is.

---

## 3. Migration phases

Each phase is independently shippable and leaves the app working. We keep the SVG stack alive behind a feature flag (`useCanvasRenderer`, read from local state or an env var) until Phase 6 removes it.

### Phase 0 — Scaffolding (no visual change)

- Add `src/components/HexGrid/canvas/HexRenderer.ts` (imperative class).
- Add `src/components/HexGrid/canvas/patternCache.ts` — terrain pattern pre-render + `CanvasPattern` cache. Unit-test by pixel-comparing a single tile against the SVG equivalent.
- Add `src/components/HexGrid/canvas/hitTest.ts` — `screenToTile`, `armyAt`, `ghostAt` helpers. Pure functions, easy to unit-test.
- Introduce `useCanvasRenderer` flag; default OFF.
- **Ship gate:** existing SVG path unchanged; new code is dead but compiled.

### Phase 1 — Base tiles on canvas (hybrid)

- Render `mapCanvas` below the existing SVG (same size, positioned absolute). When `useCanvasRenderer` is ON: canvas paints tile fills + patterns; SVG skips `<HexTile>` rendering but keeps ghost, overlays, army tokens, and selection.
- Wire up repaint on: viewport change (via `store.subscribe` + rAF coalesce), tile add/remove, tile terrain change, customTerrains change.
- Keep pattern cache warm for built-in terrains at module load.
- **Ship gate:** visual diff vs. SVG-only rendering is zero at 1× zoom for each terrain type; pan/zoom feels the same or better.

### Phase 2 — Ghost tiles + hover

- Move ghost tile drawing to canvas (dashed stroke using `setLineDash([6, 4])`).
- Move hover highlight to canvas (alpha overlay on the hovered tile).
- Hover state lives in the renderer, not Redux: a `hoveredKey: string | null` field updated on `pointermove`, with a local repaint. No React re-render.
- **Ship gate:** tiles and ghosts look identical; hover tracks cursor at 60fps.

### Phase 3 — Overlays (rivers, roads, causeways, town icons, ports, labels)

- Port `renderFlagPaths`, `renderRoadPaths`, `renderCausewayPaths`, `renderTownIcons`, `renderTownLabels`, `renderPorts` into canvas-drawing functions. Each becomes `drawRiversOn(ctx, tiles, visibleKeys, style)` etc., reusing the existing bezier path generators (`buildFeaturePaths`, `buildRoadPaths`) — the SVG path strings are thrown away; instead we call `ctx.beginPath()` / `ctx.moveTo` / `ctx.bezierCurveTo` / `ctx.stroke` with the same control points.
- Hand-port the three town icons, the kite shield, and wall marks (see §2.5).
- Remove `<WaterOverlay>` from the SVG tree when the flag is on.
- **Ship gate:** side-by-side screenshots at each zoom level show ≤1 px drift on terrain, rivers, roads, towns, ports, causeways.

### Phase 4 — Army tokens

- Port `ArmyToken.tsx` drawing (circle, stroke, faction dot, inline icon, name label) to canvas.
- Hit-testing: prioritize army token over tile click (§2.6).
- **Ship gate:** army tokens place, select, move, delete identically; right-click deletes as before.

### Phase 5 — Selection / faction / moving-army rings (animated)

- Introduce `overlayCanvas`.
- Port the marching-ants animation: rAF loop that advances a `lineDashOffset` and repaints only the selection + moving-army ring.
- Faction border (per tile, static) moves to `mapCanvas` since it doesn't animate.
- **Ship gate:** all rings visually match; no perf regression during idle.

### Phase 6 — Remove SVG

- Drop the SVG fallback. `HexGrid.tsx` hosts only the two canvases and the pointer handlers.
- Delete `HexTile.tsx`, `GhostTile.tsx`, `WaterOverlay.tsx`, `ArmyToken.tsx`, the pattern components in `src/assets/icons/patterns/`, and `TerrainPatterns.tsx`. Keep `overlayHelpers.tsx` only if canvas versions still import shared helpers (otherwise delete). Keep `pathGenerator.ts` — still used for bezier math.
- Delete the `useCanvasRenderer` flag.
- Update Playwright helpers (see §9).
- **Ship gate:** full test suite green; bundle size smaller; no SVG in DevTools elements tab over the map.

### Phase 7 — OffscreenCanvas in a worker (optional, additive)

- Introduce `src/components/HexGrid/canvas/renderWorker.ts`.
- Detect `HTMLCanvasElement.prototype.transferControlToOffscreen` at runtime; fall back to main-thread renderer otherwise.
- Benchmark before committing: if main-thread cost at 20K tiles is already well under a frame, worker adds complexity for marginal gain and can be deferred.

---

## 4. Module layout

```
src/components/HexGrid/
  HexGrid.tsx                  # now hosts <canvas> + pointer handlers
  canvas/
    HexRenderer.ts             # top-level orchestrator; owns transform, dirty-flag, draw loop
    patternCache.ts            # terrain fill pattern cache (offscreen canvases → CanvasPattern)
    hitTest.ts                 # screenToTile, armyAt, ghostAt
    drawTiles.ts               # base + pattern + faction + hover
    drawGhosts.ts
    drawRivers.ts              # uses buildFeaturePaths (existing)
    drawRoads.ts               # uses buildRoadPaths (existing)
    drawCauseways.ts
    drawTowns.ts               # hand-ported town icons, walls, kite shield
    drawPorts.ts
    drawArmies.ts              # hand-ported army icons
    drawLabels.ts
    drawOverlay.ts             # selection + moving rings (for overlayCanvas)
    renderWorker.ts            # Phase 7 only
```

`overlayHelpers.tsx` is fully replaced. `pathGenerator.ts`, `bezierIntersect.ts`, `hexUtils.ts` are reused unchanged.

---

## 5. State integration

The renderer subscribes to the Redux store directly (like the existing ref-based viewport loop does). It reads from `store.getState()` on each repaint and maintains small internal snapshots (last `tileKeys`, last `hoveredKey`, last `selectedTile`, `viewportRef`) to decide whether a repaint is actually needed.

No new Redux slices are required. The `ui` slice's selection / paint-mode / faction state is consumed read-only by the renderer.

One subtlety: today `WaterOverlay` uses `useDeferredValue(tiles)` to yield during heavy recomputation. The canvas equivalent is:

- On `tiles` mutation → enqueue repaint at next rAF.
- If a second mutation arrives before the rAF fires, coalesce.
- If a paint burst (bulk brush stroke) is in progress, skip repaints faster than 60fps (natural via rAF) and only paint the latest state.

This gives the same "stay interactive under a burst of changes" guarantee.

---

## 6. Visual parity

Visual parity is a **hard requirement**. Strategy:

1. **Per-primitive pixel tests.** Unit tests that render a single tile of each terrain + feature combination to a canvas, compare to a canonical image committed under `src/components/HexGrid/canvas/__fixtures__/`. Run on CI.
2. **Full-map screenshot diff.** Add a Playwright test that opens each bundled example map (`example-map.json`, `large-map.json`, `bahamas-map.json`), captures a screenshot at three zoom levels (0.5×, 1×, 2×), and compares against a stored baseline under a pixel-diff threshold (~0.1%).
3. **Feature-flag A/B harness.** A dev-only URL flag (`?renderer=svg` / `?renderer=canvas`) keeps both paths runnable until Phase 6. Used during development for side-by-side comparison.
4. **Pattern bake verification.** A one-off script that renders each SVG pattern in isolation and the canvas-baked equivalent, overlays them, and asserts equality. Run once per pattern when porting.

Known parity risks and how they're addressed:

| Risk                                        | Mitigation                                                                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text font metrics differ vs. SVG            | Use the same `font` string (`'bold 10px sans-serif'`). Pin `textAlign`/`textBaseline` (`'middle'`/`'middle'`) to mirror SVG `text-anchor: middle; dominant-baseline: middle`. Test labels at 1× and 2×. |
| Stroke antialiasing differs                 | Use half-pixel offsets where appropriate; avoid the "blurry 1px stroke" issue by flooring/adding 0.5 only where needed — canvas behaves consistently when DPR scaling is baked into the transform.      |
| Pattern alignment across adjacent tiles     | `CanvasPattern` is world-space (tied to the fill's current transform), so adjacent tiles share pattern phase identically to `patternUnits="userSpaceOnUse"`. Verify via the pattern-bake test.          |
| Marching-ants timing                        | Drive `lineDashOffset` from `performance.now()` so animation speed matches the CSS keyframes (1s period).                                                                                               |
| Kite shield color tinting                   | `renderKiteShield` already parameterizes fill; port 1:1 with `ctx.fillStyle = factionColor ?? '#3a3a6a'`.                                                                                               |
| Retina / DPR blur                           | `ctx.setTransform(dpr*scale, 0, 0, dpr*scale, …)` and `canvas.width = cssW * dpr`. Recompute on `ResizeObserver` + `window` devicePixelRatio change (via `window.matchMedia('(resolution: ...)')`).     |
| Ocean/lake pattern phase on very large maps | At extreme zoom-outs (scale < 0.3), pattern marks become sub-pixel; fall back to flat fill below a threshold to avoid moiré (an improvement over current SVG, which aliases).                           |

---

## 7. Performance targets & expected wins

Rough expectation after Phases 1–6:

| Map size     | SVG (today)             | Canvas (expected)                                 |
| ------------ | ----------------------- | ------------------------------------------------- |
| 500 tiles    | 60fps                   | 60fps                                             |
| 3,000 tiles  | ~30fps pan, laggy edits | 60fps                                             |
| 5,000 tiles  | ~15fps pan              | 60fps                                             |
| 20,000 tiles | unusable                | 45–60fps depending on viewport and edit frequency |

Main-thread cost per frame at 400 visible tiles with rivers/roads/towns is dominated by:

- ~400 hex path strokes + fills (base) → ~0.3ms
- ~400 hex pattern fills → ~0.4ms
- ~200 river/road beziers → ~0.4ms
- ~20 town icons → ~0.3ms
- Everything else → negligible

Total: ~1.5ms per frame on a mid-range laptop. 10× budget to spare.

Edit cost for a 50-tile brush stroke drops from "50 React reconciliations" to "1 rAF-batched repaint" — an order-of-magnitude reduction regardless of tile count.

Phase 7 (worker) further reduces main-thread jank during edits but is not required to hit the targets above.

---

## 8. Home-screen thumbnails

`src/utils/captureThumbnail.ts` already draws to canvas, but only terrain fills — no overlays, armies, or towns. Two options:

- **(a) Leave as-is.** Thumbnails remain a simplified terrain-only view; they are small and fast to generate. Recommended default.
- **(b) Unify with the new renderer.** Once the canvas renderer exists, reuse `drawTiles`/`drawOverlays`/`drawTowns` on an offscreen canvas at thumbnail resolution. Slightly richer previews; some CPU cost on save.

No change required for Phases 1–6. Revisit at the end of Phase 6.

---

## 9. Testing strategy & e2e impact

Playwright tests currently rely on `data-testid="hex-tile-{q},{r}"` and `"ghost-tile-{q},{r}"` (59 references across `e2e/`). Canvas has no per-tile DOM. Replacement approach:

### 9.1 Coordinate-based test helpers

Extend `e2e/pages/Editor.page.ts` with coordinate helpers that perform screen-space clicks derived from axial coords:

```ts
async clickTile(q: number, r: number) {
  const { x, y } = await this.page.evaluate(
    ({ q, r }) => (window as any).__hexClickPoint(q, r),
    { q, r }
  );
  await this.page.mouse.click(x, y);
}
```

Expose a small test-only helper on `window` in dev/test builds (guarded by `process.env.NODE_ENV !== 'production'`):

```ts
window.__hexClickPoint = (q, r) => {
  // converts axial → screen using current viewportRef
};
window.__hexTileExists = (q, r) => Boolean(store.getState().tiles[toKey(q, r)]);
window.__ghostTileExists = (q, r) => /* same via renderer's ghost set */;
```

This is the minimum shim needed to keep the existing tests meaningful. All 59 references can be mechanically rewritten to the new helpers — the change is concentrated in the 6 Page Objects, not the specs.

### 9.2 Visual regression tests

Add Playwright screenshot tests for each example map at three zoom levels. Run on CI. Baseline lives in `e2e/__screenshots__/`.

### 9.3 Feature flag during development

`useCanvasRenderer` defaulting to OFF until Phase 6 lets every intermediate ship land on `master` without breaking tests — tests continue to exercise the SVG path until we flip the flag + rewrite helpers in one commit at the end of Phase 6.

---

## 10. Risks & open questions

| Risk / question                                                                   | Plan                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Canvas context loss on mobile / tab-switch                                        | Listen for `contextlost` / `contextrestored`; on restore, rebuild pattern cache + full repaint.                                                                                                                                                                                                              |
| Keyboard focus / accessibility regressions                                        | Canvas is not a focusable tree. Keep keyboard shortcuts (`useKeyboardShortcuts`) at the document level — unchanged. Selection is already a Redux state, so screen-reader announcements would need a separate live region (not supported today either — no regression).                                       |
| `text-anchor` / font-family parity across platforms                               | Ship with a single font stack (`ui-sans-serif, system-ui, sans-serif`) in the canvas renderer; update theme labels accordingly if drift is visible.                                                                                                                                                          |
| Town icon palette changes live via theme — bitmap bake would require invalidation | Resolved by choosing hand-port (§2.5).                                                                                                                                                                                                                                                                       |
| Bundle size of new canvas modules                                                 | Net-positive: deleting 11 pattern components + HexTile/GhostTile/WaterOverlay/ArmyToken (React overhead) outweighs the small imperative renderer. Verified at Phase 6.                                                                                                                                       |
| Hit-testing precision on hex edges                                                | `pixelToAxial` + `hexRound` already nail the "nearest hex" problem; no change.                                                                                                                                                                                                                               |
| Playwright `dispatchEvent('click')` vs real `mouse.click`                         | Current helpers use `dispatchEvent` because SVG sub-elements are the target. Switching to `mouse.click` in Phase 6 means event ordering matches production — a correctness improvement, but may surface tests that relied on the synthetic path. Budget time to fix a handful of flakes when the flag flips. |

### Explicit non-goals

- No introduction of `react-konva`, Pixi, or any rendering library (per decision).
- No change to the Redux shape, keyboard shortcuts, or import/export format.
- No change to theme structure — only the point at which theme values are consumed moves from JSX to canvas calls.

---

## 11. Rough sizing

Very rough estimate of engineering effort:

| Phase                                          | Effort (engineer-days) |
| ---------------------------------------------- | ---------------------- |
| 0 — Scaffolding                                | 1                      |
| 1 — Base tiles + patterns                      | 2–3                    |
| 2 — Ghost + hover                              | 1                      |
| 3 — Overlays (rivers/roads/towns/ports/labels) | 4–5                    |
| 4 — Army tokens                                | 1                      |
| 5 — Animated overlay canvas                    | 1                      |
| 6 — Remove SVG + test helpers                  | 2                      |
| 7 — OffscreenCanvas worker (optional)          | 2–3                    |
| **Total (without worker)**                     | **12–14 days**         |

---

## 12. Decision summary (recorded inputs)

- Full canvas, including interactivity (mathematical hit-testing).
- Raw Canvas 2D API, no rendering library.
- Terrain patterns: pre-rendered to offscreen canvases once, used via `ctx.createPattern`.
- Hard requirement: visual parity with current SVG output.
- Plan stands alone (does not depend on other `performance-recommendations.md` items).
- Worker / OffscreenCanvas rendering is in-scope (Phase 7).
- No export/print feature; the one canvas-rendered thumbnail on the home screen is already canvas-based and can be unified later if desired.

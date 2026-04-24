# Hex Map Tool — Claude Instructions

## Working with the Owner

- **Always ask clarifying questions** before planning or designing any new feature. Do not assume intent.
- **Never begin implementation** without explicitly confirming with the owner that they are ready to proceed.
- **Never run or suggest any `git` commands** in this repository.
- The owner runs the dev server themselves — do not start `npm start` on their behalf.

---

## Commands

```bash
npm start              # dev server (localhost:3000)
npm run build          # production build — use this to verify changes compile correctly
npm run test:e2e       # run Playwright integration tests (headless)
npm run test:e2e:ui    # run Playwright tests in interactive UI mode
```

Validate source changes with `npm run build`. Integration tests live in `e2e/` and use Playwright; see **Integration Testing** below.

---

## Architecture

A React + Redux hex grid map editor rendered on an HTML5 `<canvas>`. The map is infinite — tiles live in a flat Redux object keyed by axial coordinate strings. Multiple named maps are supported; each is stored separately in localStorage.

**State shape:**

```js
{
  tiles:      { "q,r": { q, r, terrain, hasRiver, hasRoad, riverBlocked, roadBlocked, hasTown, townName, portBlocked, factionId, notes } },
  armies:     { "army-id": { id, q, r, name, composition, factionId } },
  factions:   [ { id, name, color, description } ],
  viewport:   { x, y, scale },                        // pan offset + zoom (0.2–4)
  ui:         {
    selectedTile:    "q,r" | null,
    selectedArmyId:  string | null,
    placingArmy:     boolean,
    movingArmyId:    string | null,
    screen:          'home' | 'editor' | 'help',
    mapMode:         'terrain' | 'faction' | 'terrain-paint',
    factionsOpen:    boolean,
    activeFactionId: string | null,
    activePaintBrush: string | null,    // terrain type key, or 'river-on/off', 'road-on/off'
    showShortcuts:   boolean,
    editingTownTile: "q,r" | null,
  },
  currentMap: { id: string | null, name: string },
}
```

**Data flow:**

- `index.tsx` → Redux `<Provider>` → `App.tsx` → styled-components `<ThemeProvider>`
- `App.tsx` renders `<HomeScreen>`, `<Editor>`, or `<HelpScreen>` based on `ui.screen`
- `Editor` renders `<Toolbar>`, `<ArmyPanel>`, `<HexGrid>`, `<MapModeToggle>`, `<TileEditPanel>`, `<FactionPaintPanel>`, `<FactionsPanel>`, `<KeyboardShortcutsPanel>`
- `index.tsx` imports `./i18n` before `App` renders — initialises i18next synchronously so `t()` is ready on first render
- `useLocalStorageSync()` auto-saves `tiles`, `armies`, `factions` to localStorage on every store change and loads on mount; re-runs when `currentMap.id` changes
- `migrateFromLegacy()` is called once on mount to convert old single-map / three-key localStorage layouts
- **Terrain paint mode** — `mapMode === 'terrain-paint'`; entered via "🖌 Paint Terrain" in `TileEditPanel`. `activePaintBrush` in `uiSlice` holds the selected terrain type key or `'river-on' / 'river-off' / 'road-on' / 'road-off'`. Exited via Escape or the "✕ Exit" button. Paint-drag uses pointerdown/move on the canvas interaction layer; `applyBrushAtScreenPos` interpolates along `hexLine` so fast drags don't skip tiles.

### Rendering (canvas)

`HexGrid.tsx` mounts three layers inside a `GridContainer`:

1. **Main `<canvas>`** — all static map content (tiles, ghosts, rivers, roads, causeways, towns, ports, labels, armies)
2. **Overlay `<canvas>`** — marching-ants selection ring + army ring; repainted every rAF while anything is selected/moving
3. **Interaction `<div>`** (`CanvasInteractionLayer`) — receives all pointer / wheel / touch events; both canvases have `pointer-events: none`

Rendering is driven by `HexRenderer` (`src/components/HexGrid/canvas/HexRenderer.ts`). The renderer:

- Subscribes to the Redux store directly and compares slice references on each tick. It only schedules a main-canvas repaint when something it paints has actually changed (tiles, armies, customTerrains, factions, uiMode, selection, etc.).
- Runs a dedicated rAF loop for the overlay canvas while any selection / move target exists.
- Applies a DPR-aware transform: `ctx.setTransform(dpr*scale, 0, 0, dpr*scale, dpr*(w/2+x), dpr*(h/2+y))`.
- Iterates the culled `visibleKeys` set (plus a one-ring neighbour expansion for overlay ops) rather than all tiles.

**Main canvas paint order:**

1. `drawTiles` — base colour + cached terrain pattern
2. `drawGhosts` — dashed placement guides for neighbour tiles of placed tiles
3. `drawRivers` — bezier curves (returns per-tile curves for road avoidance)
4. `drawRoads` — routed around river curves at 90°
5. `drawCauseways` — wider brown embankment + notches on deep-water road tiles
6. `drawTowns` — ground circle, clipped pixel icon, fortification ring + wall marks, kite shield when garrisoned
7. `drawPorts` — plank + three pilings on every deep-water edge of a town tile
8. `drawLabels` — haloed town name + single-garrisoned-army name
9. `drawArmies` — faction-tinted tokens with land / naval icon (suppressed on town tiles)

**Hit-testing** (`src/components/HexGrid/canvas/hitTest.ts`) — mathematical, no DOM involvement:

1. Army tokens (circle distance, skipping town tiles)
2. Placed tile via `pixelToAxial`
3. Ghost tile via `ghostKeys` set lookup
4. Otherwise background

Pattern caching (`src/components/HexGrid/canvas/patternCache.ts`): each built-in terrain SVG in `src/assets/patterns/` is loaded into an offscreen canvas via `src/utils/svgCache.ts` and wrapped in `ctx.createPattern(tile, 'repeat')`. Custom terrains reuse the same SVG but recolour every mark into a single tint derived from the base colour (via `source-in` composition). SVGs load asynchronously; until a pattern is ready, tiles render with just the base fill and `HexRenderer` repaints once it arrives.

---

## Multi-Map Storage

- **Index key**: `hex-map-tool-index` — JSON array of `{ id, name, updatedAt }`
- **Per-map data key**: `hex-map-tool-data-{id}` — JSON object `{ version: 1, tiles, armies, factions }`
- All CRUD lives in `src/utils/mapsStorage.ts`: `getAllMaps`, `createMap`, `renameMap`, `deleteMap`, `loadMapData`, `saveMapData`, `touchMap`, `migrateFromLegacy`
- `deleteMap` removes the consolidated data key (and cleans up any un-migrated legacy keys)
- `migrateFromLegacy` handles the old `hex-map-tool-tiles` single-map key and the old per-map three-key format
- **Lazy example save**: opening a built-in example dispatches `importTiles`, `importArmies`, `importFactions`, and `loadMap({ id: null })` — no localStorage entry is created until the first tile/army/faction change

---

## Hex Coordinate System

All spatial logic uses **pointy-top axial coordinates (q, r)** — see `src/utils/hexUtils.ts`.

- Tile positions are stored and referenced as `"q,r"` string keys via `toKey(q, r)` / `fromKey(key)`
- `HEX_SIZE = 50` (center-to-corner radius in pixels)
- Axial → pixel: `x = size*(√3·q + √3/2·r)`, `y = size*(3/2·r)`
- The canvas transform centers the grid at `(width/2 + viewport.x, height/2 + viewport.y)` with the viewport scale applied
- When adding new hex math, import from `hexUtils.ts` — do not inline formulas

---

## Performance Architecture

- **Zero React re-renders during pan/zoom**: `HexGrid` writes viewport changes to `viewportRef`, calls `renderer.onViewportChanged()`, and the renderer reschedules a paint. Redux viewport is only written at drag-end / after each zoom tick, for persistence.
- **Renderer-side store diffing**: `HexRenderer` tracks the last-seen reference of each slice (`tiles`, `armies`, `customTerrains`, `factions`, UI selection fields). A main repaint runs only when one of those references changes.
- **Viewport culling** (`src/hooks/useViewportCulling.ts`): throttled rAF loop computes the visible tile-key set; the renderer iterates only this set for every draw call. Maps with &lt;500 tiles skip culling entirely.
- **Pattern cache**: built-in terrain patterns are created once and reused across tiles of that type.
- **`Path2D` reuse**: river/road paths are built once per paint and cached for the causeway pass.
- **`createSelector`** on any `useSelector` call in surrounding panels that returns a new array or object, to prevent unnecessary re-renders outside the canvas.

---

## Key Conventions

### styled-components

- Custom (non-HTML) props are prefixed with `$` to avoid DOM forwarding warnings — e.g. `$open`, `$active`, `$color`
- Theme values accessed via `${({ theme }) => theme.property}` — never hardcode colours
- All theme colours and visual properties live in `src/styles/theme.ts`; `GlobalStyles.ts` applies resets and body styles

### Theme structure

`src/styles/theme.ts` is the single source of truth for visual properties used by chrome, panels, and canvas draw code. Key sections:

- `theme.terrain` — tile fill colours, labels, preview icons (React SVG components used by panel UI, not by the map)
- `theme.river` / `theme.road` — path colour, width, linecap, bezier tension, pool radius
- `theme.waterEdge` — border width for lake/ocean edges
- `theme.town` — building fill, label colour, door/window shading
- `theme.garrison` — ring colour, dash pattern, army name colour
- `theme.port` — dock colour, plank/piling widths and lengths
- `theme.causeway` — embankment colour, width, notch colour
- `theme.army` — token fill, idle/selected/moving colours, label, ring size, stack spacing

### Editing map visuals

The canvas renderer reads its terrain patterns, town icons, and army icons from plain SVG files under `src/assets/`. A designer can edit those directly — no code changes needed; CRA's dev server picks up the new file on reload.

- **Terrain fill patterns**: edit the files in `src/assets/patterns/` (`grass.svg`, `forest.svg`, `ocean.svg`, …). Each SVG's `viewBox` defines the pattern's repeat tile; keep the existing viewBox sizes so the rasterised canvas still lines up with `createPattern(tile, 'repeat')`. If you add a brand-new pattern, also register it in `PATTERNS` inside `src/components/HexGrid/canvas/patternCache.ts`.
- **Town / village / city icons**: edit `src/assets/town/{village,town,city}.svg`. Each is a 60×60 viewBox with buildings and streets on a transparent background — they're drawn clipped inside the ground circle that `drawTowns.ts` paints procedurally.
- **Army land / naval glyphs**: edit `src/assets/army/{land,naval}.svg`. Each is a 24×24 viewBox with white strokes; the renderer draws them at 85% opacity over the faction-tinted token circle.
- **Colours, widths, dash patterns** (rivers, roads, causeways, ports, overlays, fortification rings, kite shield): edit `src/styles/theme.ts`. All canvas draw modules read from this object.
- **River / road / causeway geometry**: edit `src/utils/pathGenerator.ts`. Its `buildFeaturePaths` / `buildRoadPaths` output is consumed by `drawRivers.ts`, `drawRoads.ts`, and `drawCauseways.ts`.
- **Ground circle, fortification ring, kite shield**: procedural — edit `src/components/HexGrid/canvas/drawTowns.ts`.
- **UI preview icons** (panels, terrain picker, town editor previews): edit the React SVG components in `src/assets/icons/{terrain,features,town,army,help}/`. These are attached to theme entries via the `icon` field and are not used by the canvas renderer. If you change canvas appearance via the SVG source files, update the matching TSX preview by hand.
- After any of the above changes, reload the browser — the renderer picks up new SVGs on the next repaint via `svgCache`, and pattern-cache entries are rebuilt.

### Redux

- No custom selector functions — selectors are inline `useSelector` calls
- Reducers use Immer-style direct mutations (Redux Toolkit handles immutability)
- `importTiles(payload)` / `importArmies(payload)` / `importFactions(payload)` replace entire slices — used for JSON import and localStorage restore
- Selecting an army deselects any selected tile (and vice versa) — enforced in `uiSlice` reducers
- **JSON export envelope**: `{ name, tiles, armies, factions }` — one file. Import detects new envelope vs legacy (raw tiles object) for backwards compatibility. Map name is applied on import with `(2)`, `(3)` deduplication against saved map names.

### Code quality

- **Prettier** — `.prettierrc`: `singleQuote: true`, `trailingComma: "es5"`, `printWidth: 100`
- **husky + lint-staged** — pre-commit hook runs `prettier --write` on all staged `*.{ts,tsx,json,css,md}` files
- **ESLint** — `.eslintrc.js` extends `react-app` and adds `arrow-body-style: ["error", "always"]`; all arrow functions must use explicit `{ return }` bodies
- **TypeScript** — `strict: true`, `allowJs: false`, `isolatedModules: true`, `resolveJsonModule: true`. Use `useAppDispatch` / `useAppSelector` / `useAppStore` from `src/app/hooks.ts` instead of raw react-redux hooks. Minimise `any` — prefer explicit interfaces from `src/types/`.
- **Memoized selectors** — use `createSelector` from `@reduxjs/toolkit` for any `useSelector` call that returns a new array or object reference; inline selectors returning primitives are fine without memoization

### Army feature

- Armies are placed via **TileEditPanel** "⚔ Add Army to Tile" button (no canvas placing mode)
- Army shape includes `factionId: string | null`; `setArmyFaction({ id, factionId })` in `armiesSlice` updates it
- `ArmyPanel` shows when `selectedArmyId !== null`; includes a faction `<select>` (hidden when no factions exist) that dispatches `setArmyFaction`. When open it suppresses `FactionPaintPanel`.
- Faction-tinted ring around the army token is drawn by `drawArmies.ts` when a faction is assigned
- **Move mode**: tap army → "↪ Move Army" in panel → army pulses orange → tap any tile/ghost to move; Cancel or Escape exits. `handleCanvasClick` checks `ui.movingArmyId` and dispatches `moveArmy` + `stopMovingArmy`.
- **Garrison visual**: when a town tile has armies, `drawTowns` draws a kite shield over the town icon instead of the army token. Single army → name shown above (`drawLabels`). Army tokens are suppressed on town tiles.
- Armies on town tiles appear listed in `TileEditPanel` under "Armies on this tile" with a Select button

### Toolbar

- Adds `padding-right: 296px` on desktop when `rightPanelOpen` is true (terrain / faction mode, shortcuts open, or an army is selected) to prevent the right panel from obscuring the Settings button
- Desktop-only `⌨` button toggles `showShortcuts` (dispatches `openShortcuts` / `closeShortcuts`)
- Desktop-only **EN / FI** segmented toggle calls `i18n.changeLanguage(lang)` directly — no Redux
- On mobile, the Settings sheet contains a 🌐 "Language / Kieli" item that opens a `ModalBackdrop` + `ModalCard` with `LangOption` buttons

### Internationalisation (i18n)

- **Library**: `react-i18next` + `i18next` + `i18next-browser-languagedetector`
- **Initialisation**: `src/i18n/index.ts` — imported once in `src/index.tsx` before the React tree renders
- **Locale files**: `src/i18n/locales/en.json` (default fallback) and `src/i18n/locales/fi.json`
- **Single namespace**: all keys live in one flat-ish JSON per language
- **In functional components**: `const { t } = useTranslation();` then `t('section.key')`
- **In class components** (ErrorBoundary only): `withTranslation()` HOC; access via `this.props.t('key')`
- **Terrain labels** in the UI: `t('terrain.{type}')` — `theme.terrain[type].label` is no longer rendered
- **Direction labels**: `dir.E/NE/NW/W/SW/SE` (Finnish `I/KO/LU/L/LO/KA`)
- **Language persistence**: `i18next-browser-languagedetector` reads from `localStorage` (key `i18nextLng`) then `navigator.language`; changing language writes back automatically

### Adding terrain types

All terrain metadata lives in one place: `theme.terrain` in `src/styles/theme.ts`. `TileEditPanel` derives its terrain picker from this object automatically. To add a new built-in terrain type:

1. Add an entry to `theme.terrain` (colour, label, `icon` React component for the UI picker)
2. Register the `PatternKey` in `src/types/domain.ts`, add a matching `<key>.svg` under `src/assets/patterns/`, and add an entry to `PATTERNS` in `src/components/HexGrid/canvas/patternCache.ts` with the SVG's viewBox size
3. For water-like types (merge edges, suppress river visuals, enable ports, show ⛵ for armies): add the terrain name to `DEEP_WATER` in `src/utils/hexUtils.ts`

Custom terrain types can also be added at runtime via the Terrain Types panel; they reuse the built-in pattern builders with a derived mark colour and are persisted with the map.

### Tile properties

```js
{
  q, r, terrain,
  hasRiver, hasRoad,
  riverBlocked, roadBlocked,        // arrays of neighbour keys where the connection is suppressed
  hasTown, townName, portBlocked,   // portBlocked stored only on the town tile
  factionId, notes,
}
```

- `hasRiver` / `hasRoad` auto-connect via bezier curves to adjacent tiles with the same flag
- `riverBlocked` / `roadBlocked` store block symmetrically on both tiles
- `hasTown` renders an icon + name; suppressed on water tiles
- Isolated river/road tiles (no connected neighbours) render a small pool dot at the tile centre
- River / road visuals are suppressed on lake/ocean tiles (covered by water caps drawn as part of `drawTiles`)

### Connection blocking system

`tilesSlice` exports `blockConnection(q, r, flag, neighborKey)` and `unblockConnection(q, r, flag, neighborKey)`:

```js
const BLOCKED_KEY = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked', hasTown: 'portBlocked' };
const ONE_SIDED = new Set(['hasTown']);
```

- **Symmetric flags** (`hasRiver`, `hasRoad`): block stored on **both** tiles
- **One-sided flags** (`hasTown`/port): block stored only on the **town tile**
- When `toggleTileFlag` turns a flag OFF, it clears that tile's blocked array and (for symmetric flags) removes this tile's key from all neighbours' blocked arrays
- `setTileFeature(q, r, flag, value)` is a lower-level action used by paint mode; it also clears blocked arrays when turning a flag off

### Tile interactions

Handled in `handleCanvasClick` / `handleCanvasContextMenu` in `HexGrid.tsx`, driven by `hitTest`:

- **Left-click ghost tile**: creates a tile with the terrain chosen by `inferTerrain` (most common neighbour terrain, tie-broken by most recently placed) and auto-selects it — unless `movingArmyId` is set, in which case it creates the tile and moves the army there
- **Left-click existing tile**: selects it and opens the edit panel — unless `movingArmyId` is set, in which case the army moves there
- **Right-click existing tile**: deletes it (and deselects if it was selected)
- **Left-click army token**: selects the army (deselects any tile), opens `ArmyPanel`
- **Right-click army token**: deletes the army
- **Drag**: pan the viewport
- **Scroll wheel**: zoom centred on cursor position (scale range 0.2–4)

### Example maps

- Small map data: `src/data/example-map.json`
- Large map (3 000 tiles, performance testing): `src/data/large-map.json`
- Bahamas archipelago: `src/data/bahamas-map.json`
- All example maps include factions and armies
- `src/data/exampleMaps.ts` imports each, applies field defaults via `normalizeTile` / `normalizeArmy`, and exports `exampleMaps`
- Opening an example from HomeScreen dispatches `importTiles`, `importArmies`, `importFactions`; `id: null` — no localStorage entry until the first real change

### Page title

`App.tsx` sets `document.title` via `useEffect`:

- Home screen or unsaved example (`currentMap.id === null`): `"Hex Map Tool"`
- Saved map open: `"<map name> — Hex Map Tool"`

---

## Utility Modules

| File                            | Purpose                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/hexUtils.ts`         | Axial coordinate math — `toKey`, `fromKey`, `axialToPixel`, `pixelToAxial`, `hexRound`, `hexLine`, `hexCorners`, `getNeighbors`, `DEEP_WATER` |
| `src/utils/mapsStorage.ts`      | localStorage CRUD: `getAllMaps`, `createMap`, `renameMap`, `deleteMap`, `loadMapData`, `saveMapData`, `touchMap`, `migrateFromLegacy`         |
| `src/utils/pathGenerator.ts`    | Programmatic bezier generator for rivers and roads (also used by causeways)                                                                   |
| `src/utils/bezierIntersect.ts`  | Cubic-bezier intersection math used by `pathGenerator` to keep road/river crossings at 90°                                                    |
| `src/utils/inferTerrain.ts`     | Picks a terrain for a newly placed tile from its existing neighbours (most common, tie-broken by most recently placed)                        |
| `src/utils/patternColor.ts`     | Derives a contrasting mark colour from a terrain's base colour (used by custom terrain patterns)                                              |
| `src/utils/captureThumbnail.ts` | Renders a simplified map to an offscreen canvas for HomeScreen map cards                                                                      |
| `src/utils/generateId.ts`       | Creates unique IDs with a given prefix (e.g. `army_12345`)                                                                                    |
| `src/utils/historyManager.ts`   | In-memory undo/redo stack: `pushSnapshot`, `undo`, `redo`, `clearHistory`                                                                     |

## Custom Hooks

| Hook                   | Purpose                                                                                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useKeyboardShortcuts` | Listens for Escape (deselect tile + army), Delete/Backspace (delete selected tile), `r` (reset viewport), Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo)                                                                                                                 |
| `useLocalStorageSync`  | Auto-saves `tiles`, `armies`, `factions` to localStorage on every store change; loads on mount; re-runs when `currentMap.id` changes; skips saves when `id === null` (unsaved examples)                                                                             |
| `useLanguage`          | Returns `{ language, changeLanguage }` wrapping `i18n.changeLanguage` — use this in components instead of calling `i18n` directly                                                                                                                                   |
| `useViewportCulling`   | Returns the set of visible tile keys under the current viewport (element rect + pan/zoom + padding margin). Refs are stable; the returned Set reference only changes when the visible set actually differs. Skips the rAF loop entirely on maps with &lt;500 tiles. |

---

## Integration Testing (Playwright)

Tests live in `e2e/` at the repo root, separate from `src/`. Run with `npm run test:e2e` (headless) or `npm run test:e2e:ui` (interactive). Tests run in parallel with two projects: `chromium` (1280×900 desktop) and `mobile` (iPhone 12 emulation, 390×844, touch).

```
e2e/
  fixtures/app.fixture.ts        # custom test() — clears localStorage, navigates to app, waits for HomeScreen
  helpers/storage.ts             # clearStorage, readStorage, readStorageJson, getMapIndex
  pages/
    HomeScreen.page.ts           # new map, open map, delete map, open example
    Editor.page.ts               # tile clicks, rename, export, goBack
    TileEditPanel.page.ts        # terrain, flags, paint mode, army, notes
    ArmyPanel.page.ts            # name, move, delete
    FactionsPanel.page.ts        # add, name, delete factions
  tests/                         # one spec per feature area
playwright.config.ts             # baseURL, webServer (npm start), chromium + mobile projects
```

### Canvas test hooks (IMPORTANT)

The canvas renderer does **not** emit per-tile DOM elements. `hex-tile-{q,r}` and `ghost-tile-{q,r}` `data-testid`s no longer exist. Tests that previously dispatched click events on those locators need to be migrated to coordinate-based interactions:

- Use `page.mouse.click(x, y)` at the centre of a tile, computing the pixel position from `axialToPixel` and the `GridContainer` rect.
- Or dispatch a synthetic `PointerEvent` on the `CanvasInteractionLayer` at the desired client coordinates.
- For assertions that a tile exists, read the Redux store via `window.__REDUX_STORE__` (if exposed) or via `localStorage` through the existing `readStorageJson` helper.

The `Editor.page.ts` helpers currently still reference the old SVG testids and will need to be updated before the Playwright suite can pass against the canvas renderer.

### `data-testid` convention

Playwright selectors use `data-testid` on key interactive elements. All spec files import `test`/`expect` from the custom fixture, not directly from `@playwright/test`. Currently instrumented elements include:

- `new-map-card`, `map-card-{id}`, `delete-map-{id}`, `example-card-{id}` — HomeScreen cards
- `back-btn`, `map-name-input`, `factions-btn`, `mobile-factions-btn`, `export-json-btn`, `import-json-btn` — Toolbar (desktop / mobile settings sheet variants)
- `terrain-btn-{type}`, `flag-toggle-{flag}`, `paint-terrain-btn`, `exit-paint-btn`, `paint-brush-{type}` — TileEditPanel
- `add-army-btn`, `select-army-{id}`, `delete-tile-btn`, `notes-textarea`, `town-name-input` — TileEditPanel
- `army-name-input`, `move-army-btn`, `delete-army-btn` — ArmyPanel
- `add-faction-btn`, `faction-name-{id}`, `faction-delete-{id}` — FactionsPanel

### Mobile-specific patterns

- `factions-btn` is desktop-only. On mobile, `FactionsPanel.page.ts` opens it by first clicking the Settings gear, then `mobile-factions-btn`.
- Right-click tests (tile deletion via context menu) are skipped on mobile (`test.skip(isMobile)`).
- Desktop-only tests use `test.skip(({ browserName }) => browserName !== 'chromium')`.
- File download tests use `page.waitForEvent('download')`.
- The app is entirely client-side — no network calls need stubbing.

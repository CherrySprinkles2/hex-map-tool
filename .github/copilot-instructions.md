# Copilot Instructions — Hex Map Tool

## Working with the Owner

- **Always ask clarifying questions** before planning or designing any new feature. Do not assume intent.
- **Never begin implementation** without explicitly confirming with the owner that they are ready to proceed.
- **Never run or suggest any `git` commands** in this repository.

---

## Commands

```bash
npm start              # dev server (localhost:3000)
npm run build          # production build — use this to verify changes compile correctly
npm run test:e2e       # run Playwright integration tests (headless)
npm run test:e2e:ui    # run Playwright tests in interactive UI mode
```

Validate source changes with `npm run build`. Integration tests live in `e2e/` and use Playwright; see the **Integration Testing** section below for the full test architecture.

---

## Architecture

A React + Redux hex grid map editor rendered entirely in SVG. The map is infinite — tiles live in a flat Redux object keyed by axial coordinate strings. Multiple named maps are supported; each is stored separately in localStorage.

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
    placingArmy:     boolean,           // unused entry point; army placement is via TileEditPanel
    movingArmyId:    string | null,     // army currently in move-mode
    screen:          'home' | 'editor',
    mapMode:         'terrain' | 'faction' | 'terrain-paint',
    factionsOpen:    boolean,
    activeFactionId: string | null,
    activePaintBrush: string | null,    // terrain type key, or 'river-on/off', 'road-on/off'
    showShortcuts:   boolean,             // controls KeyboardShortcutsPanel visibility
  },
  currentMap: { id: string | null, name: string },
}
```

**Data flow:**

- `index.tsx` → Redux `<Provider>` → `App.tsx` → styled-components `<ThemeProvider>`
- `App.tsx` renders `<HomeScreen>` or `<Editor>` based on `ui.screen`
- `Editor` renders `<Toolbar>`, `<ArmyPanel>`, `<HexGrid>`, `<MapModeToggle>`, `<TileEditPanel>`, `<FactionPaintPanel>`, `<FactionsPanel>`, `<KeyboardShortcutsPanel>`
- `index.tsx` imports `./i18n` before `App` renders — initialises i18next synchronously so `t()` is ready on first render
- `useLocalStorageSync()` auto-saves `tiles`, `armies`, and `factions` to localStorage on every store change and loads on mount; re-runs when `currentMap.id` changes
- `migrateFromLegacy()` is called once on mount to convert old single-map `hex-map-tool-tiles` data
- `HexGrid` is the SVG canvas. It computes ghost tile positions at render time by iterating all tile neighbours that don't exist in state
- `WaterOverlay` renders on top of tiles inside the same SVG `<g>` transform group
- `ArmyToken` components are rendered last (top layer) inside the `<g>` transform group, except on town tiles where a garrison visual is used instead
- `KeyboardShortcutsPanel` — slide-in right panel (desktop) / bottom sheet (mobile) listing all keyboard shortcuts. Controlled by `ui.showShortcuts`. Opened via toolbar `⌨` button (desktop only) or settings dropdown (mobile). Suppresses `TileEditPanel` while open without deselecting the tile.
- **Terrain paint mode** — `mapMode === 'terrain-paint'`; entered via "🖌 Paint Terrain" in `TileEditPanel`. `isPaintingRef` (from `PaintContext`) gates pan suppression and drag-painting. `activePaintBrush` in `uiSlice` holds the selected terrain type key or `'river-on'` / `'river-off'` / `'road-on'` / `'road-off'`. Exited via Escape or the "✕ Exit" button. `TileEditPanel` stays open during paint mode. `HexTile` uses `onPointerDown`/`onPointerEnter` for drag-to-paint (desktop only — guarded by `isTouchDevice`); click-to-paint works on both platforms.

**Rendering order inside HexGrid's transform group:**

1. `GhostTile` components (behind)
2. `HexTile` components
3. `WaterOverlay` — rivers, roads, towns/garrisons, ports, water fills
4. `ArmyToken` components — only on non-town tiles

**Inside WaterOverlay rendering order:**

1. Water edge merging (lake, then ocean) — drawn first so they sit beneath everything
2. `renderFlagPaths` for rivers
3. `renderFlagPaths` for roads
4. `renderTowns(tiles, armiesByTile)` — house or castle+garrison-ring depending on armies present
5. Water caps (fill lake/ocean on top of rivers/roads)
6. `renderPorts` (on top of water fill)

---

## Multi-Map Storage

- **Index key**: `hex-map-tool-index` — JSON array of `{ id, name, updatedAt }`
- **Per-map data key**: `hex-map-tool-data-{id}` — JSON object `{ version: 1, tiles, armies, factions }`
- All CRUD lives in `src/utils/mapsStorage.ts`: `getAllMaps`, `createMap`, `renameMap`, `deleteMap`, `loadMapData`, `saveMapData`, `touchMap`, `migrateFromLegacy`
- `deleteMap` removes the consolidated data key (and cleans up any un-migrated legacy keys)
- `migrateFromLegacy` checks for the old `hex-map-tool-tiles` key (and old per-map `hex-map-tool-map-{id}` / `hex-map-tool-armies-{id}` / `hex-map-tool-factions-{id}` keys) on first launch and converts them to the consolidated format
- **Lazy example save**: opening a built-in example dispatches `importTiles`, `importArmies`, `importFactions`, and `loadMap({ id: null })` — no localStorage entry is created until the first tile, army, or faction change

---

## Hex Coordinate System

All spatial logic uses **pointy-top axial coordinates (q, r)** — see `src/utils/hexUtils.ts`.

- Tile positions are stored and referenced as `"q,r"` string keys via `toKey(q, r)` / `fromKey(key)`
- `HEX_SIZE = 50` (center-to-corner radius in pixels)
- Axial → pixel: `x = size*(√3·q + √3/2·r)`, `y = size*(3/2·r)`
- The SVG `<g>` transform centers the grid: `translate(width/2 + x, height/2 + y) scale(scale)`
- When adding new hex math, import from `hexUtils.ts` — don't inline formulas

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
- All theme colours and visual properties live in `src/styles/theme.ts`; `GlobalStyles.ts` applies resets and body styles

### Theme structure

`src/styles/theme.ts` is the single source of truth for all visual properties. Key sections:

- `theme.terrain` — tile fill colours, labels, icons
- `theme.river` / `theme.road` — path colour, width, linecap, bezier tension, pool radius
- `theme.waterEdge` — border width for lake/ocean edges
- `theme.town` — building fill, label colour, door/window shading
- `theme.garrison` — ring colour, dash pattern, army name colour (garrisoned town visual)
- `theme.port` — dock colour, plank/piling widths and lengths
- `theme.causeway` — embankment colour, width, notch colour (water channels through causeways)
- `theme.army` — token fill, idle/selected/moving colours, label, ring size, stack spacing

### Redux

- No custom selector functions — selectors are inline `useSelector` calls
- Reducers use Immer-style direct mutations (Redux Toolkit handles immutability)
- `importTiles(payload)` / `importArmies(payload)` replace entire slices — used for JSON import and localStorage restore
- Selecting an army deselects any selected tile (and vice versa) — enforced in `uiSlice` reducers
- **JSON export envelope**: `{ name, tiles, armies, factions }` — all data in one file. Import detects new envelope vs legacy (raw tiles object) for backwards compatibility. Map name is applied on import with `(2)`, `(3)` deduplication against saved map names.

### Code quality

- **Prettier** — `.prettierrc` at project root: `singleQuote: true`, `trailingComma: "es5"`, `printWidth: 100`
- **husky + lint-staged** — pre-commit hook runs `prettier --write` on all staged `*.{ts,tsx,json,css,md}` files automatically
- **ESLint** — `.eslintrc.js` extends `react-app` and adds `arrow-body-style: ["error", "always"]`; all arrow functions must use explicit `{ return }` bodies. The `eslintConfig` block has been removed from `package.json`.
- **TypeScript** — `strict: true`, `allowJs: false`, `isolatedModules: true`, `resolveJsonModule: true`. Use typed Redux hooks `useAppDispatch`/`useAppSelector` from `src/app/hooks.ts` instead of raw react-redux hooks. Minimise `any` — prefer explicit interfaces from `src/types/`.
- **Memoized selectors** — use `createSelector` from `@reduxjs/toolkit` for any `useSelector` call that returns a new array or object reference; inline selectors returning primitives are fine without memoization

### Army feature

- Armies are placed via **TileEditPanel** "⚔ Add Army to Tile" button (no canvas placing mode)
- Army shape includes `factionId: string | null`; `setArmyFaction({ id, factionId })` reducer in `armiesSlice` updates `army.factionId`
- `ArmyPanel` (right side on desktop, bottom sheet on mobile) shows when `selectedArmyId !== null`; includes a faction `<select>` dropdown (hidden when no factions exist) that dispatches `setArmyFaction`. When open, it suppresses `FactionPaintPanel` (passed as `suppressed` prop from `Editor`).
- `ArmyToken` accepts `factionId` and renders a faction-coloured ring around the token when a faction is assigned
- **Move mode** (Option B): tap army → "↪ Move Army" in panel → army pulses orange → tap any tile/ghost tile to move; Cancel or Escape exits without moving. `HexTile` and `GhostTile` check `store.getState().ui.movingArmyId` on click — no new subscriptions
- **Garrison visual**: when a town tile has armies, `renderTowns` renders a castle + gold dashed ring instead of a house. Single army → army name shown above. Multiple armies → ring only. Army tokens are suppressed on town tiles (HexGrid checks `tiles[key]?.hasTown`)
- Armies on town tiles appear listed in TileEditPanel under "Armies on this tile" with a Select button

### Toolbar

- Adds `padding-right: 296px` on desktop when `rightPanelOpen` is true (i.e. `mapMode === 'terrain'`, `mapMode === 'faction'`, `showShortcuts === true`, or `selectedArmyId !== null`) to prevent the right panel from obscuring the Settings button
- Has a desktop-only `⌨` button that toggles `showShortcuts`; dispatches `openShortcuts` / `closeShortcuts` from `uiSlice`
- Has a desktop-only **EN / FI** segmented language toggle (`LangToggle`) that calls `i18n.changeLanguage(lang)` directly — no Redux involvement
- On mobile, the Settings sheet contains a 🌐 "Language / Kieli" item (`$desktopHide`) that opens a centred `ModalBackdrop` + `ModalCard` with `LangOption` buttons for each language

### Internationalisation (i18n)

- **Library**: `react-i18next` + `i18next` + `i18next-browser-languagedetector`
- **Initialisation**: `src/i18n/index.ts` — imported once in `src/index.tsx` before the React tree renders
- **Locale files**: `src/i18n/locales/en.json` (default fallback) and `src/i18n/locales/fi.json`
- **Single namespace**: all keys live in one flat-ish JSON per language (no namespaces — app is small enough)
- **In functional components**: `const { t } = useTranslation();` then `t('section.key')`
- **In class components** (ErrorBoundary only): `withTranslation()` HOC; access via `this.props.t('key')`
- **Terrain labels**: rendered as `t('terrain.{type}')` — the `theme.terrain[type].label` English string is no longer used in the UI (kept in theme only for any future non-i18n tooling)
- **Direction labels**: compass abbreviations are translated (`dir.E/NE/NW/W/SW/SE`); Finnish equivalents are `I/KO/LU/L/LO/KA`
- **Language persistence**: `i18next-browser-languagedetector` reads from `localStorage` (key `i18nextLng`) then `navigator.language`; changing language writes back to localStorage automatically
- **Adding a string**: add the key to both `en.json` and `fi.json`, use `t('your.key')` in the component
- **Adding a language**: add `src/i18n/locales/{code}.json`, register it in `src/i18n/index.ts` under `resources`, and add a `LangOption` button in `Toolbar.tsx`

### Adding terrain types

All terrain metadata lives in one place: `theme.terrain` in `src/styles/theme.ts`.
`TileEditPanel` derives its terrain picker from this object automatically. Adding a new terrain type requires:

1. An entry in `theme.terrain` in `src/styles/theme.ts`
2. A matching `<pattern id="pattern-NAME">` SVG element in `src/components/HexGrid/TerrainPatterns.tsx`
3. For water-like types (merge edges, suppress river visuals, enable ports, show ⛵ for armies): add the terrain name to `DEEP_WATER` in `src/utils/hexUtils.ts`

### Tile properties

Each tile has the shape:

```js
{
  (q,
    r,
    terrain,
    hasRiver,
    hasRoad,
    riverBlocked,
    roadBlocked,
    hasTown,
    townName,
    portBlocked,
    factionId,
    notes);
}
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
const ONE_SIDED = new Set(['hasTown']);
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
- Both example maps include factions and armies
- `src/data/exampleMaps.ts` imports both, applies field defaults via `normalizeTile` and `normalizeArmy` (ensures all army fields have safe defaults including `factionId: null`), and exports `exampleMaps`; reads `name`, `tiles`, `armies`, `factions` directly from each JSON via `fromEnvelope()`
- Opening an example from HomeScreen dispatches `importTiles`, `importArmies`, AND `importFactions`; `id: null` — no localStorage entry until the first real change

### Page title

`App.tsx` sets `document.title` via `useEffect`:

- Home screen or unsaved example (`currentMap.id === null`): `"Hex Map Tool"`
- Saved map open: `"<map name> — Hex Map Tool"`

---

## Utility Modules

| File                           | Purpose                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/hexUtils.ts`        | Axial coordinate math — `toKey`, `fromKey`, `axialToPixel`, `hexPointsString`, `getNeighbors`, `NEIGHBOR_DIRS`, `DEEP_WATER`. Always import hex math from here — do not inline formulas. |
| `src/utils/mapsStorage.ts`     | localStorage CRUD: `getAllMaps`, `createMap`, `renameMap`, `deleteMap`, `loadMapData`, `saveMapData`, `touchMap`, `migrateFromLegacy`                                                    |
| `src/utils/overlayHelpers.tsx` | Renders SVG water edges, town icons/labels, ports, river pools on top of tiles — used by `WaterOverlay`                                                                                  |
| `src/utils/routeLookup.ts`     | Maps road/river connection bitmasks to canonical SVG path data and transforms — used by `WaterOverlay` for rendering bezier curves                                                       |
| `src/utils/generateId.ts`      | Creates unique IDs with a given prefix (e.g. `army_12345`)                                                                                                                               |
| `src/utils/historyManager.ts`  | In-memory undo/redo stack: `pushSnapshot`, `undo`, `redo`, `clearHistory`                                                                                                                |

## Custom Hooks

| Hook                   | Purpose                                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useKeyboardShortcuts` | Listens for Escape (deselect/cancel), Delete/Backspace (delete tile), `R` (reset viewport), Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo)                                                   |
| `useLocalStorageSync`  | Auto-saves `tiles`, `armies`, `factions` to localStorage on every store change; loads on mount; re-runs when `currentMap.id` changes; skips saves when `id === null` (unsaved examples) |
| `useLanguage`          | Returns `{ language, changeLanguage }` wrapping `i18n.changeLanguage` — use this in components instead of calling `i18n` directly                                                       |

---

## Integration Testing (Playwright)

Tests live in `e2e/` at the repo root, separate from `src/`. Run with `npm run test:e2e` (headless) or `npm run test:e2e:ui` (interactive). Tests run in parallel with two projects: `chromium` (1280×900 desktop) and `mobile` (iPhone 12 emulation, 390×844, touch).

```
e2e/
  fixtures/app.fixture.ts        # custom test() — clears localStorage, navigates to app, waits for HomeScreen
  helpers/storage.ts             # clearStorage, readStorage, readStorageJson, getMapIndex
  pages/
    HomeScreen.page.ts           # Page Object: new map, open map, delete map, open example
    Editor.page.ts               # Page Object: tile clicks, rename, export, goBack
    TileEditPanel.page.ts        # Page Object: terrain, flags, paint mode, army, notes
    ArmyPanel.page.ts            # Page Object: name, move, delete
    FactionsPanel.page.ts        # Page Object: add, name, delete factions
  tests/
    home-screen.spec.ts          # HomeScreen CRUD, example maps
    tile-placement.spec.ts       # tile creation, editing (terrain/river/road/town/notes), reload persistence
    paint-mode.spec.ts           # paint mode entry/exit, brush selection, terrain painting
    armies.spec.ts               # add, edit, move, delete armies; garrison visual
    factions.spec.ts             # add, edit, delete factions
    import-export.spec.ts        # JSON export shape, import, duplicate-name dedup
    multi-map.spec.ts            # isolation between maps, switching, deletion
    language.spec.ts             # EN/FI toggle (desktop), settings sheet (mobile)
playwright.config.ts             # baseURL, webServer (npm start), chromium + mobile projects
```

### `data-testid` convention

Playwright selectors use `data-testid` on key elements. All spec files import `test`/`expect` from the custom fixture, not directly from `@playwright/test`. When adding new interactive elements that tests may need to reach, add a `data-testid`.

Currently instrumented elements include:

- `hex-tile-{q},{r}` / `ghost-tile-{q},{r}` — SVG tile elements (on the `<g>` and `<polygon>` respectively)
- `new-map-card`, `map-card-{id}`, `delete-map-{id}`, `example-card-{id}` — HomeScreen cards
- `back-btn`, `map-name-input`, `factions-btn`, `mobile-factions-btn`, `export-json-btn`, `import-json-btn` — Toolbar (desktop / mobile settings sheet variants)
- `terrain-btn-{type}`, `flag-toggle-{flag}`, `paint-terrain-btn`, `exit-paint-btn`, `paint-brush-{type}` — TileEditPanel
- `add-army-btn`, `select-army-{id}`, `delete-tile-btn`, `notes-textarea`, `town-name-input` — TileEditPanel
- `army-name-input`, `move-army-btn`, `delete-army-btn` — ArmyPanel
- `add-faction-btn`, `faction-name-{id}`, `faction-delete-{id}` — FactionsPanel

### SVG interaction

`EditorPage.clickTile()` and `clickGhost()` use `locator.dispatchEvent('click')` rather than `.click()`. This fires the event directly on the element, bypassing browser hit-testing. It is required because on mobile the TileEditPanel and ArmyPanel are bottom sheets that physically overlap the SVG canvas; a coordinate-based click (even with `force: true`) would be intercepted by the sheet.

### Mobile-specific patterns

- `factions-btn` is a desktop-only button. On mobile, `FactionsPanel.page.ts` opens it by first clicking the Settings gear, then clicking `mobile-factions-btn` in the slide-up sheet.
- Right-click tests (tile deletion via context menu) are skipped on mobile (`test.skip(isMobile)`).
- Desktop-only tests (EN/FI toggle) use `test.skip(({ browserName }) => browserName !== 'chromium')`. Mobile-only tests use `test.skip(({ isMobile }) => !isMobile)`.
- File download tests use `page.waitForEvent('download')`.
- The app is entirely client-side — no network calls need stubbing.

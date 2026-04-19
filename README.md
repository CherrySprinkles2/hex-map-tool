# Hex Map Tool

Hex Map Tool is a browser-based map editor for building worlds on a hexagonal grid. It is suited for tabletop RPG campaign planning, wargame scenario design, fantasy world-building, and strategic planning. No installation or account is required. Maps are saved automatically in the browser and can be exported as JSON files for backup or cross-device transfer.

---

## Features

**Terrain.** Each tile can be assigned one of six built-in terrain types — Grass, Farm, Forest, Mountain, Lake, and Ocean — each rendered with a distinct fill texture. Lake and Ocean are deep-water types: their edges merge visually with adjacent water tiles, river and road paths are suppressed, and port icons are enabled on neighbouring town tiles. Additional terrain types can be defined with custom names, colours, fill patterns, and optional icons.

**Rivers and roads.** A river or road can be toggled on any non-water tile. The feature automatically connects with neighbouring tiles that share the same flag, forming smooth curved paths across the landscape. Individual connections between specific tiles can be blocked. Roads placed on water tiles render as causeways.

**Towns.** Any non-water tile can be designated as a town with a name, a size (village, town, or city), and an optional fortification level (no wall, palisade, or stone wall). When a town tile borders a water tile, a port icon is rendered automatically on that edge; individual ports can be removed from the tile edit panel. Each tile also has a free-text notes field for annotations that appear only in the editor.

**Armies.** Named armies can be placed on any tile. Each army has a name, a composition field, and optional notes. Armies can be moved to any tile. When an army occupies a town tile, the town displays a garrison visual; if a single army is present, its name is shown above the icon.

**Factions.** Tiles can be painted to show territorial control by named factions, each assigned a colour. Armies can be assigned to factions. Faction colours appear as a tint over terrain textures.

**Multiple maps.** The home screen manages any number of named maps, each stored independently in the browser.

**Export and import.** Maps can be exported as JSON files and reimported, enabling backups and cross-device transfer.

---

## Getting started

Open the application in a browser. No installation is required.

From the home screen, create a new blank map, open a built-in example, or import a previously exported JSON file.

---

## Controls

| Action                      | How                                                                         |
| --------------------------- | --------------------------------------------------------------------------- |
| Add a tile                  | Left-click a ghost (faded border) tile                                      |
| Select / edit a tile        | Left-click a solid tile                                                     |
| Delete a tile               | Right-click a tile, or select it and press Delete / Backspace               |
| Pan                         | Click and drag on the canvas                                                |
| Zoom                        | Scroll wheel (centres on cursor)                                            |
| Reset view                  | R                                                                           |
| Add an army                 | Select tile → Add Army to Tile in the right panel                           |
| Select an army              | Left-click an army token                                                    |
| Move an army                | Select army → Move Army → click destination tile                            |
| Delete an army              | Right-click army token, or Delete Army in the left panel                    |
| Undo                        | Ctrl+Z (Cmd+Z on Mac)                                                       |
| Redo                        | Ctrl+Y or Ctrl+Shift+Z                                                      |
| Deselect / cancel           | Escape                                                                      |
| Switch language             | EN / FI toggle in the toolbar (desktop) or Settings → Language (mobile)     |
| Keyboard shortcut reference | ⌨ button in the toolbar (desktop) or Settings → Keyboard Shortcuts (mobile) |
| Help                        | ? button in the toolbar (desktop) or Settings → Help (mobile)               |
| Return to home screen       | ← Maps button in the toolbar                                                |

---

## Keyboard shortcuts

| Key                   | Action                                  |
| --------------------- | --------------------------------------- |
| Ctrl+Z (Cmd+Z)        | Undo                                    |
| Ctrl+Y / Ctrl+Shift+Z | Redo                                    |
| Escape                | Deselect tile or army; cancel move mode |
| Delete / Backspace    | Delete the selected tile                |
| R                     | Reset viewport to origin                |

---

---

# Developer guide

## Requirements and setup

```bash
npm install
npm start              # development server at http://localhost:3000
npm run build          # production build
npm run deploy         # deploy to GitHub Pages
npm run test:e2e       # run Playwright integration tests (headless)
npm run test:e2e:ui    # run Playwright tests in interactive UI mode
```

Validate source changes with `npm run build`. Playwright runs against a live development server started automatically; see `CLAUDE.md` for the test architecture.

---

## Tech stack

- **React 19** (Create React App / react-scripts 5)
- **Redux Toolkit** — tiles, armies, factions, viewport, UI, and currentMap slices
- **styled-components v6** — chrome, panels, and toolbar styling
- **Canvas 2D** — all map rendering. Two stacked `<canvas>` elements (main + overlay) and one transparent `<div>` for pointer events. The renderer subscribes to the Redux store directly and schedules repaints via `requestAnimationFrame`; React never re-renders for pan, zoom, or map data changes.
- **react-i18next + i18next** — internationalisation (EN + FI); `i18next-browser-languagedetector` auto-detects from browser and caches to localStorage
- **Playwright** — end-to-end integration tests (`e2e/`)
- **Prettier** — `singleQuote`, `trailingComma: es5`, `printWidth: 100`; enforced via a husky pre-commit hook
- **ESLint** — extends `react-app`; adds `arrow-body-style: ["error", "always"]`

---

## Project structure

```
e2e/
  fixtures/app.fixture.ts        Playwright custom fixture (clears localStorage, navigates to app)
  helpers/storage.ts             localStorage helpers for tests
  pages/                         Page Object Models for each UI area
  tests/                         Playwright spec files (one per feature area)
playwright.config.ts             Playwright config: baseURL, webServer, chromium + mobile projects

src/
  app/                    Redux store + typed hooks (useAppDispatch, useAppSelector, useAppStore)
  assets/
    icons/
      help/               SVG icon components for the help screen cards (one per section)
      features/           River, road, port icon components (UI previews only)
      terrain/            Terrain type icon components (UI previews only)
      town/               Village, town, city icon components (UI previews only)
      army/               Land, naval army icon components (UI previews only)
  components/
    ArmyPanel/            Panel for editing a selected army (name, composition, faction, move/delete)
    Editor/               Top-level editor layout — composes Toolbar, HexGrid, all side panels
    ErrorBoundary/        React error boundary with localised fallback UI
    FactionPaintPanel/    Right-side panel for painting faction territories
    FactionsPanel/        Faction management (create, edit, delete factions)
    HelpScreen/           Standalone help page — card grid landing and per-section views
    HexGrid/              Canvas rendering host (HexGrid.tsx) + draw modules under canvas/ —
                          HexRenderer, drawTiles, drawGhosts, drawRivers, drawRoads,
                          drawCauseways, drawPorts, drawTowns, drawLabels, drawArmies,
                          drawOverlay, hitTest, patternCache
    HomeScreen/           Home screen (map cards, example maps, import)
    KeyboardShortcutsPanel/ Slide-in reference panel listing all keyboard shortcuts
    MapModeToggle/        Fixed toggle button (bottom-right) to switch Terrain / Faction mode
    TerrainConfigModal/   Modal for managing custom terrain type definitions
    TileEditPanel/        Right-side panel for editing the selected tile
    Toolbar/              Map name (inline-editable), back, export/import, ⌨ shortcuts button,
                          ? help button, EN/FI language toggle (desktop), settings sheet (mobile)
    TownEditPanel/        Sub-panel for town name, size, and fortification configuration
    shared/               UI primitives: SidePanel, DragHandle, PanelHeader, SectionLabel,
                          StyledTextarea, CloseButton, SettingsButton, sheet.ts, modal.ts,
                          LanguageToggle, LanguageModal
  data/
    example-map.json      Small bundled example map
    large-map.json        3 000-tile performance test map
    bahamas-map.json      Bahamas archipelago example map
    exampleMaps.ts        Loads, normalises, and exports all bundled example maps
  features/
    armies/               armiesSlice — addArmy, deleteArmy, moveArmy, updateArmy, setArmyFaction, importArmies
    currentMap/           currentMapSlice — id + name of the open map
    factions/             factionsSlice — addFaction, updateFaction, deleteFaction, importFactions
    tiles/                tilesSlice — addTile, updateTile, toggleTileFlag, setTileFeature, blockConnection,
                          unblockConnection, setTileFaction, setTownName, setTileNotes, deleteTile, importTiles
    viewport/             viewportSlice — setViewport, resetViewport (scale range 0.2–4)
    ui/                   uiSlice — selectedTile, selectedArmyId, movingArmyId, screen, mapMode,
                          factionsOpen, activeFactionId, showShortcuts, activePaintBrush,
                          navigateToHelp, navigateBackFromHelp, …
    history/              historyActions — restoreSnapshot (used by undo/redo across all data slices)
  hooks/
    useKeyboardShortcuts  Ctrl+Z/Y undo/redo, Escape deselect/cancel, Delete tile, R reset viewport
    useLanguage           Returns { language, changeLanguage } wrapping i18n
    useLocalStorageSync   Auto-saves tiles, armies, factions on every change; lazy for examples
  i18n/
    index.ts              i18next init — LanguageDetector, EN + FI resources, localStorage cache
    locales/en.json       English translation strings (includes help.* section content)
    locales/fi.json       Finnish translation strings
  styles/                 theme.ts (all visual properties), GlobalStyles.ts (resets + body)
  types/
    domain.ts             TerrainType, TileFlag, Tile, Army, Faction, MapEntry, MapData, MapEnvelope, ExampleMap
    history.ts            HistorySnapshot
    state.ts              TilesState, ArmiesState, FactionsState, MapMode, Screen, UiState, …
    theme.ts              AppTheme interface
  utils/
    bezierIntersect.ts    Cubic-bezier intersection math used by pathGenerator
    captureThumbnail.ts   Renders a simplified map to an offscreen canvas for HomeScreen previews
    generateId.ts         Creates unique IDs with a given prefix (e.g. army_12345)
    hexUtils.ts           Axial coordinate math, toKey/fromKey, NEIGHBOR_DIRS, DEEP_WATER
    historyManager.ts     Snapshot-based undo/redo (past/future stacks)
    inferTerrain.ts       Picks a terrain for a new tile from its existing neighbours
    mapsStorage.ts        localStorage CRUD for maps, tiles, armies, factions + legacy migration
    pathGenerator.ts      Programmatic bezier path generator for rivers and roads
    patternColor.ts       Derives a contrasting mark colour from a terrain base colour
```

---

## Redux state shape

```js
{
  tiles:      { "q,r": { q, r, terrain, hasRiver, hasRoad, riverBlocked, roadBlocked,
                          hasTown, townName, portBlocked, factionId, notes } },
  armies:     { "army-id": { id, q, r, name, composition, factionId } },
  factions:   [ { id, name, color, description } ],
  viewport:   { x, y, scale },
  ui: {
    selectedTile:       "q,r" | null,
    selectedArmyId:     string | null,
    movingArmyId:       string | null,
    screen:             'home' | 'editor' | 'help',
    helpReturnScreen:   'home' | 'editor' | 'help',
    mapMode:            'terrain' | 'faction' | 'terrain-paint',
    factionsOpen:       boolean,
    activeFactionId:    string | null,
    activePaintBrush:   string | null,
    showShortcuts:      boolean,
    editingTownTile:    "q,r" | null,
  },
  currentMap: { id: string | null, name: string },
}
```

---

## Key conventions

- **TypeScript** — `strict: true`, `allowJs: false`. Use `useAppDispatch`/`useAppSelector` from `src/app/hooks.ts` instead of raw react-redux hooks. Shared types live in `src/types/`. Minimise `any`.
- **styled-components props** — custom (non-HTML) props are prefixed with `$` to avoid DOM forwarding warnings (e.g. `$open`, `$active`, `$rightPanelOpen`).
- **Theming** — always access theme values via `${({ theme }) => theme.property}`; never hardcode colours.
- **Redux selectors** — inline `useSelector` calls throughout; no custom selector files. Where a selector returns a new array or object, use `createSelector` from `@reduxjs/toolkit` to avoid spurious re-renders.
- **Reducers** — Immer-style direct mutation (Redux Toolkit handles immutability).
- **Arrow functions** — `arrow-body-style: always` is enforced by ESLint; all arrow functions must use explicit `{ return }` bodies.
- **Mobile breakpoint** — `601px` (`min-width`).

---

## Rendering pipeline

`HexGrid.tsx` mounts two `<canvas>` layers (main + overlay) plus a transparent interaction `<div>` on top. On mount, it constructs a `HexRenderer` (`src/components/HexGrid/canvas/HexRenderer.ts`) and attaches both canvases. The renderer subscribes to the Redux store directly and schedules repaints via `requestAnimationFrame` — React never re-renders for pan, zoom, or map-data changes.

**Main canvas (repainted only on dirty flags):**

1. `drawTiles` — base fill + cached terrain pattern
2. `drawGhosts` — dashed placement guides for neighbour tiles
3. `drawRivers` — bezier curves (returns a map of curves for roads to dodge)
4. `drawRoads` — routed around river curves at 90°
5. `drawCauseways` — embanked roads through deep water with notch accents
6. `drawTowns` — ground circle, clipped SVG icon (village/town/city from `src/assets/town/`), fortification ring + wall marks, kite shield when garrisoned
7. `drawPorts` — plank + pilings on every deep-water edge of a town tile
8. `drawLabels` — haloed town and single-garrisoned-army names
9. `drawArmies` — faction-tinted tokens with land / naval icon from `src/assets/army/` (suppressed on town tiles)

**Overlay canvas (repainted every rAF while anything is selected or moving):**

- `drawOverlay` — marching-ants selection ring on the selected tile, marching-ants ring on the selected / moving army

Hit-testing for pointer events is mathematical (`canvas/hitTest.ts` — `pixelToAxial` for tiles/ghosts, circle-distance for armies). No DOM hit-testing.

---

## Performance

- **Store subscription in the renderer, not React**: `HexRenderer` diffs slice references (`state.tiles`, `state.armies`, etc.) each store tick and only repaints when something relevant actually changes.
- **Dirty-flag repaint**: the main canvas repaints via a coalesced rAF, and only when the renderer's last-seen references disagree with the current store.
- **Pan / zoom never cross React**: viewport changes write to a ref, the renderer recomputes the DPR-aware transform, and a repaint is scheduled. Redux viewport is only written at drag-end / after each zoom tick for persistence.
- **DPR-aware transform**: `ctx.setTransform(dpr*scale, 0, 0, dpr*scale, dpr*(w/2+x), dpr*(h/2+y))` — crisp on HiDPI displays, no manual pixel scaling in draw code.
- **Pattern cache**: built-in terrain SVGs under `src/assets/patterns/` are rasterised once into an offscreen canvas (via `src/utils/svgCache.ts`) and wrapped in `ctx.createPattern(tile, 'repeat')`; the `CanvasPattern` is reused across every tile of that terrain. Custom terrains reuse the same SVG tinted into a single mark colour via `source-in` composition.
- **Path2D reuse**: rivers and roads construct `Path2D` objects once per paint; causeways reuse the river / road geometry from `pathGenerator`.
- **Viewport hex culling** (`src/hooks/useViewportCulling.ts`): tiles outside the visible viewport plus a padding margin are skipped. The renderer iterates the visible-key set for every draw call, so draw work scales with visible tile count, not total tile count. Small maps (&lt;500 tiles) skip the rAF culling loop entirely.
- **`createSelector`** is used for any selector that returns a new array or object, to prevent spurious downstream re-renders in the surrounding panels.

---

## Theming

All visual properties are centralised in `src/styles/theme.ts`. `GlobalStyles.ts` applies resets and body styles.

| Key                          | Controls                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| `theme.terrain`              | Tile fill colours, labels, icons                                  |
| `theme.river` / `theme.road` | Path colour, width, linecap, bezier tension, pool radius          |
| `theme.waterEdge`            | Border widths for lake/ocean edges                                |
| `theme.town`                 | Building fill, label colour, door/window shading                  |
| `theme.garrison`             | Ring colour, dash pattern, army name colour                       |
| `theme.port`                 | Dock colour, plank/piling widths and lengths                      |
| `theme.army`                 | Token fill, idle/selected/moving colours, label, ring size        |
| `theme.causeway`             | Causeway terrain colour and notch styling                         |
| `theme.zIndex`               | Layering: toolbar (50), panels (100), backdrop (149), sheet (150) |

---

## Extending — adding a terrain type

1. Add an entry to `theme.terrain` in `src/styles/theme.ts` (colour + label + `icon` React component for the UI picker). Create a matching `<Name>Icon` in `src/assets/icons/terrain/` if you need a new preview icon.
2. Register the terrain's `PatternKey` in `src/types/domain.ts`, add a matching `<key>.svg` under `src/assets/patterns/`, and add an entry to `PATTERNS` in `src/components/HexGrid/canvas/patternCache.ts` with the SVG's viewBox size.
3. For water types (edge merging, river/road suppression, port eligibility, ⛵ army icon): add the terrain name to `DEEP_WATER` in `src/utils/hexUtils.ts`.

The terrain picker in `TileEditPanel` is derived automatically from `theme.terrain` — no component changes needed.

Custom terrain types can also be added at runtime via the Terrain Types panel in the editor; these are stored in the `terrainConfig` Redux slice and persisted with the map. Custom terrains reuse the built-in pattern SVGs, recolouring every mark to a contrasting tone derived from the base colour via `source-in` composition (see `patternColor.ts` for the tint logic).

---

## Multi-map localStorage schema

| Key                      | Contents                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| `hex-map-tool-index`     | `[{ id, name, updatedAt }]` — map index                           |
| `hex-map-tool-data-{id}` | `{ version: 1, tiles, armies, factions }` — all data for map `id` |

Legacy keys (`hex-map-tool-map-{id}`, `hex-map-tool-armies-{id}`, `hex-map-tool-factions-{id}`) from the old three-key format are migrated automatically to the consolidated key on first read.

The legacy key `hex-map-tool-tiles` (single-map format) is migrated automatically on first load via `migrateFromLegacy()` in `src/utils/mapsStorage.ts`.

---

## Keyboard shortcuts

Defined in `src/hooks/useKeyboardShortcuts.ts`.

| Key                   | Action                               |
| --------------------- | ------------------------------------ |
| Ctrl+Z (Cmd+Z)        | Undo                                 |
| Ctrl+Y / Ctrl+Shift+Z | Redo                                 |
| Escape                | Deselect tile/army; cancel move mode |
| Delete / Backspace    | Delete selected tile                 |
| R                     | Reset viewport to origin             |

---

## Internationalisation (i18n)

The app uses **react-i18next** with bundled JSON locale files. Language is auto-detected from the browser and cached to localStorage under i18next's default key.

**Supported languages:** English (`en`, default fallback) and Finnish (`fi`).

**Key files:**

| File                       | Purpose                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `src/i18n/index.ts`        | i18next init — attaches `LanguageDetector` and `initReactI18next`, registers both locales |
| `src/i18n/locales/en.json` | English strings                                                                           |
| `src/i18n/locales/fi.json` | Finnish strings                                                                           |

**Using translations in components:**

```tsx
// Functional component
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
// …
<span>{t('tilePanel.title')}</span>;

// Class component (e.g. ErrorBoundary)
import { withTranslation } from 'react-i18next';
// access via this.props.t(…)
export default withTranslation()(MyClass);
```

**Language switcher:**

- **Desktop** — EN / FI segmented toggle in the `Toolbar` bar (desktop-only via CSS).
- **Mobile** — Settings menu item 🌐 "Language / Kieli" opens a centred modal with flag + language name buttons.
- Changing language calls `i18n.changeLanguage(lang)` from `../../i18n`; the choice persists in localStorage.

**Adding a new string:** Add the key to both `en.json` and `fi.json`, then use `t('your.key')` in the component.

**Adding a new language:** Add a new locale JSON file in `src/i18n/locales/`, register it in `src/i18n/index.ts` under `resources`, and add a button to the language switcher in `Toolbar.tsx`.

---

## Connection blocking system

`tilesSlice` exports `blockConnection(q, r, flag, neighborKey)` and `unblockConnection(q, r, flag, neighborKey)`.

- `BLOCKED_KEY` maps each flag to its storage field: `hasRiver → riverBlocked`, `hasRoad → roadBlocked`, `hasTown → portBlocked`.
- **Symmetric flags** (`hasRiver`, `hasRoad`): block stored on both tiles.
- **One-sided flags** (`hasTown` / port): block stored only on the town tile.
- When `toggleTileFlag` turns a flag off, it clears that tile's blocked array and (for symmetric flags) removes this tile's key from all neighbours' blocked arrays.

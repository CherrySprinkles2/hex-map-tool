# Hex Map Tool

---

# PART 1 — FOR NON-TECHNICAL USERS

## What is Hex Map Tool?

Hex Map Tool is a free, browser-based map editor for creating worlds on a hexagonal grid. Whether you're planning a tabletop RPG campaign, designing a wargame scenario, building a fantasy world, or just sketching out a fictional continent — this tool gives you an intuitive visual canvas to work with.

There is nothing to install and no account to create. Your maps save automatically inside your browser, and you can export them as files to back them up or share them with others.

---

## What can you do with it?

**Switch language.** The app supports English and Finnish. On desktop, use the **EN / FI** toggle in the toolbar. On mobile, open the Settings menu and tap **Language / Kieli** to choose your preferred language. The choice is remembered in your browser.

**Paint terrain.** Every tile on the map can be set to one of six terrain types — Grass, Farm, Forest, Mountain, Lake, or Ocean — each rendered with its own distinct texture so your map looks like a map, not a spreadsheet.

**Draw rivers and roads.** Toggle a river or road on any tile and it will automatically connect with neighbouring tiles that share the same flag, forming smooth curved paths across your landscape. You can even block individual connections if a river shouldn't flow between two specific tiles.

**Found towns.** Mark any non-water tile as a town, give it a name, and a settlement icon appears on the canvas with the name below it. If the town sits on the coast, a dock (port) automatically appears on the water's edge beside it. You can remove individual ports from the tile edit panel if needed.

**Place armies.** Select any tile and add a named army to it. Each army has a name and a composition field where you can note its units (e.g. "3 infantry, 1 cavalry"). Armies appear as ⚔ tokens on land tiles and ⛵ on water tiles.

**Assign factions.** Use Faction mode (the mode toggle in the toolbar) to create coloured political groups — kingdoms, empires, warbands, whatever suits your world. Paint tiles to show which faction controls that territory, and assign each army to a faction so you can see at a glance who controls what.

**Garrison towns.** When an army occupies a town tile, the house icon automatically upgrades to a castle with a gold garrison ring around it. If there's only one army there, its name is shown above the castle.

**Manage multiple maps.** The home screen lets you create as many named maps as you like, switch between them, rename them, and delete them. All maps are stored separately in your browser.

**Export and import.** You can save any map to a JSON file on your computer and reload it later — useful for backups, sharing with others, or moving maps between browsers.

**Explore built-in examples.** The home screen includes example maps you can open right away to explore the features before building your own.

---

## How to use it

1. **Open the app.** You'll land on the home screen. From here you can create a new blank map, open an existing one, or load a built-in example.

2. **The canvas.** When you open a map you'll see a small cluster of tiles in the centre of the screen. Around the edges of that cluster you'll notice faded, semi-transparent tiles — these are "ghost" tiles. **Left-click any ghost tile to add it to your map.** New tiles will automatically take on the most common terrain type from their neighbours, so painting spreads naturally.

3. **Selecting and editing a tile.** Left-click any solid tile to select it. The panel on the right will open showing that tile's properties — terrain picker, river toggle, road toggle, town name field, and a list of armies on the tile. Make changes there and they take effect immediately.

4. **Deleting a tile.** Right-click any tile to delete it instantly. You can also select the tile first and then press **Delete** or **Backspace** on your keyboard.

5. **Working with armies.** Select a tile, then click "⚔ Add Army to Tile" in the right panel. A new army appears on the tile. Left-click its token on the canvas to select the army and open the army panel on the left, where you can edit its name, composition, and faction. To move the army, click "↪ Move Army" in the left panel, then click any tile on the canvas (including a ghost tile) as the destination.

6. **Navigating the map.** Click and drag anywhere on the canvas to pan. Use the scroll wheel to zoom in and out (it zooms toward wherever your cursor is). Press **R** to snap the view back to the centre.

7. **Factions.** Click the map mode toggle in the toolbar to switch to Faction mode. From there you can create factions, give them names and colours, and paint tiles to show territorial control. Switch back to Terrain mode to continue editing the landscape.

8. **Saving.** Everything saves automatically to your browser as you work. No save button needed. To make a backup or share the map, use the Export JSON button in the toolbar.

---

## Controls

| Action                | How                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------- |
| Add a tile            | Left-click a faded (ghost) tile at the map edge                                       |
| Select / edit a tile  | Left-click an existing tile                                                           |
| Delete a tile         | Right-click a tile, or select it and press Delete / Backspace                         |
| Pan the map           | Click and drag on the canvas                                                          |
| Zoom                  | Scroll wheel (zooms toward cursor)                                                    |
| Reset view            | Press R                                                                               |
| Add an army to a tile | Select tile → "⚔ Add Army to Tile" in the right panel                                 |
| Select an army        | Left-click an army token (⚔ or ⛵)                                                    |
| Move an army          | Select army → "↪ Move Army" in the left panel → click destination                     |
| Delete an army        | Right-click an army token, or use the Delete button in the left panel                 |
| Undo                  | Ctrl+Z (Cmd+Z on Mac)                                                                 |
| Redo                  | Ctrl+Y or Ctrl+Shift+Z                                                                |
| Deselect / cancel     | Escape                                                                                |
| Switch language       | **EN / FI** toggle in the toolbar (desktop) or Settings → Language (mobile)           |
| See all shortcuts     | Click the ⌨ button in the toolbar (desktop) or Settings → Keyboard Shortcuts (mobile) |
| Back to home          | ← Maps button in the toolbar                                                          |

---

## Keyboard shortcuts

The toolbar includes a **⌨** button (on desktop) that opens a slide-in reference panel listing every keyboard shortcut in one place. On mobile, the same panel is accessible via the Settings menu. It's always there if you forget a shortcut.

---

## Factions

Factions are political groups — kingdoms, factions, warbands, or any other power you want to represent on the map. Switch to Faction mode using the map mode toggle in the toolbar, then create factions and give each one a name and colour. You can paint individual tiles to show territorial control, and assign each army to a faction via the army panel. Faction colours appear as a tint on controlled tiles so you can see the political landscape at a glance alongside the terrain.

---

## Saving and exporting

Your maps save automatically to your browser's local storage every time you make a change — no manual save needed. This storage stays on your device; clearing your browser data will erase your maps.

To keep a permanent backup or share a map with someone else, use the **Export JSON** button in the toolbar. This downloads the map as a `.json` file you can store anywhere. To restore it later, use **Import JSON** and select the file. You can also use exported files to move a map to a different browser or computer.

---

---

# PART 2 — FOR DEVELOPERS

## Getting started

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build
npm run deploy   # deploy to GitHub Pages
```

There is no test suite. Validate changes with `npm run build`.

---

## Tech stack

- **React 19** (Create React App / react-scripts 5)
- **Redux Toolkit** — tiles, armies, factions, viewport, UI, and currentMap slices
- **styled-components v6** — theming and component styles
- **SVG** — all map rendering (patterns, overlays, tokens)
- **react-i18next + i18next** — internationalisation (EN + FI); `i18next-browser-languagedetector` auto-detects from browser and caches to localStorage
- **Prettier** — `singleQuote`, `trailingComma: es5`, `printWidth: 100`; enforced via a husky pre-commit hook
- **ESLint** — extends `react-app`; adds `arrow-body-style: ["error", "always"]`

---

## Project structure

```
src/
  app/                    Redux store
  components/
    ArmyPanel/            Left-side panel for editing a selected army (name, composition, faction)
    FactionPaintPanel/    Right-side panel for painting faction territories
    FactionsPanel/        Faction management (create, edit, delete factions)
    HexGrid/              SVG canvas — hex math, tiles, ghost tiles, water overlay,
                          terrain patterns, water caps, army tokens
    HomeScreen/           Home screen (map cards, example maps)
    KeyboardShortcutsPanel/ Slide-in reference panel listing all keyboard shortcuts
    MapModeToggle/        Terrain / Faction mode switcher
    TileEditPanel/        Right-side panel for editing the selected tile
    Toolbar/              Map name (inline-editable), back, export/import, ⌨ shortcuts button,
                          EN/FI language toggle (desktop), language modal (mobile)
  data/
    example-map.json      Small bundled example (Finnish-themed, 208 tiles, 2 factions, 5 armies)
    large-map.json        3 000-tile performance test map (4 factions, 10 armies)
    exampleMaps.js        Loads, normalises, and exports both example maps
  features/
    armies/               armiesSlice — addArmy, deleteArmy, moveArmy, updateArmy, setArmyFaction, importArmies
    currentMap/           currentMapSlice — id + name of the open map
    factions/             factionsSlice — addFaction, updateFaction, deleteFaction, importFactions
    tiles/                tilesSlice — addTile, updateTile, toggleTileFlag, blockConnection, importTiles, …
    viewport/             viewportSlice — setViewport, resetViewport (scale range 0.2–4)
    ui/                   uiSlice — selectedTile, selectedArmyId, movingArmyId, screen, mapMode,
                          factionsOpen, activeFactionId, showShortcuts, activePaintBrush
    history/              historyActions — restoreSnapshot (used by undo/redo)
  hooks/
    useKeyboardShortcuts  Ctrl+Z/Y undo/redo, Escape deselect, Delete tile, R reset viewport
    useLocalStorageSync   Auto-saves tiles, armies, factions on every change; lazy for examples
  i18n/
    index.js              i18next init — LanguageDetector, EN + FI resources, localStorage cache
    locales/en.json       English translation strings
    locales/fi.json       Finnish translation strings
  styles/                 theme.js, GlobalStyles.js
  utils/
    hexUtils.js           Axial coordinate math, toKey/fromKey, NEIGHBOR_DIRS, DEEP_WATER
    historyManager.js     Snapshot-based undo/redo (past/future stacks)
    mapsStorage.js        localStorage CRUD for maps, tiles, armies, factions + legacy migration
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
    selectedTile:    "q,r" | null,
    selectedArmyId:  string | null,
    movingArmyId:    string | null,
    screen:          'home' | 'editor',
    mapMode:         'terrain' | 'faction',
    factionsOpen:    boolean,
    activeFactionId: string | null,
    showShortcuts:   boolean,
  },
  currentMap: { id: string | null, name: string },
}
```

---

## Key conventions

- **styled-components props** — custom (non-HTML) props are prefixed with `$` to avoid DOM forwarding warnings (e.g. `$open`, `$active`, `$rightPanelOpen`).
- **Theming** — always access theme values via `${({ theme }) => theme.property}`; never hardcode colours.
- **Redux selectors** — inline `useSelector` calls throughout; no custom selector files. Where a selector returns a new array or object, use `createSelector` from `@reduxjs/toolkit` to avoid spurious re-renders.
- **Reducers** — Immer-style direct mutation (Redux Toolkit handles immutability).
- **Arrow functions** — `arrow-body-style: always` is enforced by ESLint; all arrow functions must use explicit `{ return }` bodies.
- **Mobile breakpoint** — `601px` (`min-width`).

---

## Rendering pipeline

Inside HexGrid's SVG `<g transform>` group, components render in this order:

1. `GhostTile` components (bottom layer)
2. `HexTile` components
3. `WaterOverlay` — water edge merge → rivers → roads → towns/garrisons → water caps → ports
4. `ArmyToken` components — suppressed on town tiles (garrison visual is used instead)

`<TerrainPatterns />` must be rendered **outside** the `<g transform>` group — placing it inside causes patterns to scale with pan/zoom and break.

---

## Performance

- `React.memo` on `HexTile`, `GhostTile`, `WaterOverlay`, `WaterCap`, and `ArmyToken`.
- **Ref-based viewport**: pan and zoom write directly to the DOM via `groupRef.current.setAttribute('transform', …)` — zero React re-renders per frame. Redux viewport state is only updated at drag-end and after each zoom tick, for persistence.
- Tile-specific `isSelected` selectors (`state.ui.selectedTile === key`) mean only the affected tile re-renders on selection change.
- `createSelector` is used for any selector that returns a new array or object, to prevent spurious downstream re-renders.

---

## Theming

All visual properties are centralised in `src/styles/theme.js`. `GlobalStyles.js` applies resets and body styles.

| Key                          | Controls                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| `theme.terrain`              | Tile fill colours, labels, icons                                  |
| `theme.river` / `theme.road` | Path colour, width, linecap, bezier tension, pool radius          |
| `theme.waterEdge`            | Border widths for lake/ocean edges                                |
| `theme.town`                 | Building fill, label colour, door/window shading                  |
| `theme.garrison`             | Ring colour, dash pattern, army name colour                       |
| `theme.port`                 | Dock colour, plank/piling widths and lengths                      |
| `theme.army`                 | Token fill, idle/selected/moving colours, label, ring size        |
| `theme.zIndex`               | Layering: toolbar (50), panels (100), backdrop (149), sheet (150) |

---

## Extending — adding a terrain type

1. Add an entry to `theme.terrain` in `src/styles/theme.js`.
2. Add a `<pattern id="pattern-NAME">` SVG element in `src/components/HexGrid/TerrainPatterns.jsx`.
3. For water types (edge merging, river/road suppression, port eligibility, ⛵ army icon): add the terrain name to `DEEP_WATER` in `src/utils/hexUtils.js`.

The terrain picker in `TileEditPanel` is derived automatically from `theme.terrain` — no component changes needed.

---

## Multi-map localStorage schema

| Key                      | Contents                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| `hex-map-tool-index`     | `[{ id, name, updatedAt }]` — map index                           |
| `hex-map-tool-data-{id}` | `{ version: 1, tiles, armies, factions }` — all data for map `id` |

Legacy keys (`hex-map-tool-map-{id}`, `hex-map-tool-armies-{id}`, `hex-map-tool-factions-{id}`) from the old three-key format are migrated automatically to the consolidated key on first read.

The legacy key `hex-map-tool-tiles` (single-map format) is migrated automatically on first load via `migrateFromLegacy()` in `src/utils/mapsStorage.js`.

---

## Keyboard shortcuts

Defined in `src/hooks/useKeyboardShortcuts.js`.

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
| `src/i18n/index.js`        | i18next init — attaches `LanguageDetector` and `initReactI18next`, registers both locales |
| `src/i18n/locales/en.json` | English strings                                                                           |
| `src/i18n/locales/fi.json` | Finnish strings                                                                           |

**Using translations in components:**

```js
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

**Adding a new language:** Add a new locale JSON file in `src/i18n/locales/`, register it in `src/i18n/index.js` under `resources`, and add a button to the `LangOption` list in `Toolbar.jsx`.

---

## Connection blocking system

`tilesSlice` exports `blockConnection(q, r, flag, neighborKey)` and `unblockConnection(q, r, flag, neighborKey)`.

- `BLOCKED_KEY` maps each flag to its storage field: `hasRiver → riverBlocked`, `hasRoad → roadBlocked`, `hasTown → portBlocked`.
- **Symmetric flags** (`hasRiver`, `hasRoad`): block stored on both tiles.
- **One-sided flags** (`hasTown` / port): block stored only on the town tile.
- When `toggleTileFlag` turns a flag off, it clears that tile's blocked array and (for symmetric flags) removes this tile's key from all neighbours' blocked arrays.

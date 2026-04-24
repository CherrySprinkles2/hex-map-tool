# Documentation Plan

## Scope

Two parallel workstreams:

1. **README rewrite** — audit and rewrite `README.md` in place
2. **In-app help page** — new `HelpScreen` component accessible from the editor toolbar (desktop) and settings dropdown (mobile)

---

## Part 1 — README Rewrite

### Goals

- Single document; remove the `PART 1 / PART 2` split and replace with a natural heading hierarchy
- Remove all condescending or audience-excluding language (`"For non-technical users"`, `"There is nothing to install"`, etc.)
- Neutral technical documentation tone throughout — no marketing language, no assumptions about the reader's background
- Verify every feature description against the current codebase and correct anything outdated

### Proposed structure

```
# Hex Map Tool
  (one-paragraph description of what the application is)

## Features
  (prose or bullet list covering every feature group)

## Getting started
  (link to the hosted app; brief note on export/import for cross-device use)

## Controls
  (the existing controls table, cleaned up)

## Keyboard shortcuts
  (the existing shortcuts table)

## Developer guide
  ## Requirements & setup
  ## Tech stack
  ## Project structure
  ## Redux state shape
  ## Key conventions
  ## Rendering pipeline
  ## Performance
  ## Theming
  ## Extending — adding a terrain type
  ## Internationalisation (i18n)
  ## Connection blocking system
  ## Multi-map localStorage schema
  ## Integration testing
```

### Specific changes identified

| Location          | Current text                                                              | Issue                            | Proposed change                                                                                                                |
| ----------------- | ------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Part 1 heading    | `# PART 1 — FOR NON-TECHNICAL USERS`                                      | Condescending; creates a barrier | Remove; replace with natural `## Overview` / `## Features` sections                                                            |
| Part 2 heading    | `# PART 2 — FOR DEVELOPERS`                                               | Unnecessary split                | Replace with `## Developer guide`                                                                                              |
| Installation note | `"There is nothing to install and no account to create"`                  | Condescending framing            | Rewrite as a neutral factual statement: `"Hex Map Tool runs entirely in the browser. No installation or account is required."` |
| How to use §2     | `"you'll notice faded, semi-transparent tiles — these are 'ghost' tiles"` | Informal                         | Keep as terminology explanation, tighten phrasing                                                                              |
| Army section      | `"Click '⚔ Add Army to Tile'"`                                            | Emoji in prose                   | Replace with `"Click **Add Army to Tile**"`                                                                                    |

### Content gaps to fill

The following features exist in the codebase but are absent or incomplete in the README:

- **Custom terrains** — `TerrainConfigModal` allows users to add custom terrain types; not mentioned anywhere in the README
- **Town fortifications** — `TownEditPanel` has fortification levels; not mentioned
- **Causeways** — referenced in `theme.ts` and the rendering pipeline; the user-facing concept is not explained
- **Tile notes** — `TileEditPanel` has a notes/description field; not mentioned
- **Bahamas example map** — a second example map was added recently; the README only implies one

---

## Part 2 — In-App Help Page

### Architecture

The app uses a Redux `screen` state (`'home' | 'editor'`) rendered in `src/App.tsx` to switch between views. The help page will be a third screen value.

**Changes required:**

| File                                                            | Change                                                                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/types/state.ts`                                            | Add `'help'` to the `Screen` union type                                                                    |
| `src/features/ui/uiSlice.ts`                                    | No reducer changes needed; `setScreen('help')` already works generically                                   |
| `src/App.tsx`                                                   | Add `screen === 'help'` branch rendering `<HelpScreen />`                                                  |
| `src/components/Toolbar/Toolbar.tsx`                            | Add `?` / Help button (desktop-only, consistent with `⌨` shortcuts button); dispatches `setScreen('help')` |
| `src/components/shared/SettingsButton.tsx` or Settings dropdown | Add Help menu item (mobile); dispatches `setScreen('help')`                                                |
| `src/i18n/locales/en.json`                                      | Add all help page string keys                                                                              |
| `src/i18n/locales/fi.json`                                      | Add Finnish translations for all help page string keys                                                     |

### New component: `HelpScreen`

Location: `src/components/HelpScreen/HelpScreen.tsx`

#### Layout — Option B: card grid → single section view

The help screen has two internal views managed by local React state (no Redux needed):

**Landing view (card grid)**

- Fixed header bar: app name / "Help" title on the left; **Back** button on the right that dispatches `setScreen` to wherever the user came from. The `uiSlice` should store a `helpReturnScreen: Screen` value set at the same time as navigating to help.
- Below the header: a responsive grid of topic cards, one per section.
- Each card contains: a section illustration (React SVG component), the section title, and a one-sentence description.
- Desktop: 3-column grid. Mobile: 1-column stack.
- Clicking any card transitions to the section view for that topic.

**Section view (single section)**

- Same fixed header bar, but the Back button now returns to the card grid landing (not to the editor/home). A breadcrumb or subtitle below the title shows which section is open.
- Content area: full-width scrollable column, max-width capped for readability (~740px centred).
- Image sits at the top of the section below the title, full-width with a subtle border/shadow.
- Body text follows the image as structured prose with sub-headings where needed.
- A **Previous / Next** pair of buttons at the bottom of each section allows sequential browsing without returning to the grid.

**State model**

```ts
// Local state inside HelpScreen — no Redux slice needed
type HelpView = { kind: 'grid' } | { kind: 'section'; sectionId: HelpSectionId };
```

**Transitions**

```
Editor / Home
  → (Help button) → HelpScreen: grid view
      → (card click) → HelpScreen: section view
          → (back) → HelpScreen: grid view
          → (prev/next) → HelpScreen: adjacent section view
  → (back from grid) → Editor / Home
```

**Theme**
The dark app theme carries through to the help screen. Card backgrounds, header bar, and section content area all use existing theme tokens rather than introducing new colour values. Body text uses the same font stack and colour as the rest of the app.

### Section illustrations

One SVG illustration per section, each wrapped as a React component. Location: `src/assets/icons/help/`. Each illustration is simple and monochromatic — it should read clearly at the card thumbnail size (~48px) and also scale up acceptably if reused as a section header decoration.

| Section              | Illustration concept                                          |
| -------------------- | ------------------------------------------------------------- |
| The canvas           | A small hex grid with one highlighted tile                    |
| Terrain              | A hex tile showing a terrain fill (e.g. stylised trees)       |
| Rivers and roads     | Two hex tiles with a curved line crossing the shared edge     |
| Towns                | A hex tile with a simple building/house shape                 |
| Armies               | A sword or shield token                                       |
| Factions             | Two hex tiles in different colours with a border between them |
| Saving and exporting | A downward arrow into a file/box shape                        |
| Keyboard shortcuts   | A stylised key cap                                            |
| Multiple maps        | Two overlapping document/map outlines                         |
| Overview             | The hex map tool logo / a simple hex shape                    |

### Content sections (with image placeholders)

Each section below lists the content to write and where a screenshot/image is needed. Screenshots should be placed in `src/components/HelpScreen/images/` as optimised PNGs once provided.

---

#### 1. Overview

Short paragraph — what the application is and what it is used for.  
_No image needed._

---

#### 2. The canvas

- How tiles are laid out on a hexagonal grid
- Ghost tiles (adding new tiles by clicking the faded border)
- Left-click to select; right-click to delete
- Pan (click-drag) and zoom (scroll wheel)
- Reset view (R key)

**Image requested:** annotated screenshot of the canvas showing a ghost tile, a selected tile, and the surrounding terrain.

---

#### 3. Terrain

- The terrain types available (Grass, Farm, Forest, Mountain, Hills, Lake, Ocean, and any custom types)
- How to change a tile's terrain via the tile edit panel
- Custom terrain types — opening the terrain config modal, adding a custom entry

**Image requested:** screenshot of the tile edit panel open on a tile, with the terrain picker visible.

---

#### 4. Rivers and roads

- Toggling a river or road on a tile
- How connections form automatically between neighbouring tiles
- Blocking individual connections
- Causeways — roads on water tiles

**Image requested:** screenshot of a river and road meeting on a tile (demonstrating the offset anchor behaviour).

---

#### 5. Towns

- Marking a tile as a town
- Town sizes (village / town / city) and how the icon changes
- Setting a town name (label displayed on canvas)
- Fortification levels
- Ports — automatic dock rendering when a town borders water; how to block individual ports
- Tile notes field

**Image requested:** screenshot of a town tile with a name label visible, next to a water tile with a port.

---

#### 6. Armies

- Adding an army to a tile
- The army panel — name and composition fields
- Moving an army (move mode, click destination)
- Deleting an army
- Army tokens on the canvas (land ⚔ vs naval ⛵)
- Garrison — when an army occupies a town tile

**Image requested:** screenshot of a town tile with a garrison visual and the army panel open on the left.

---

#### 7. Factions

- Switching to Faction mode via the toolbar toggle
- Creating a faction (name and colour)
- Painting tiles with a faction colour
- Assigning armies to factions
- How faction colours appear as a territory tint

**Image requested:** screenshot of the map in Faction mode with two coloured territories visible.

---

#### 8. Saving and exporting

- Auto-save to browser local storage (no manual save required)
- Export JSON — downloading a `.json` backup
- Import JSON — restoring a map from file
- Note that clearing browser data removes local maps; export is the recommended backup mechanism

_No image needed._

---

#### 9. Keyboard shortcuts

Rendered as the same reference table that exists in `KeyboardShortcutsPanel`, reused or extracted into a shared data structure so both places stay in sync.

_No image needed._

---

#### 10. Multiple maps

- The home screen — map cards, create new, rename, delete
- Opening built-in example maps
- Using export/import to move maps between browsers or devices

**Image requested:** screenshot of the home screen showing two map cards and the example maps section.

---

### Localisation

All string content in `HelpScreen` will use `t('help.*')` keys. Section headings, body paragraphs, and image alt text will all be translated.

Finnish translations will be provided alongside English — the scope of Finnish translation should be confirmed before implementation begins, as the body paragraphs are substantially longer than the existing translation strings.

**Question for the developer before work begins:** Should the Finnish translation of the help page body text be written as part of this task, or deferred and left as English fallback strings initially?

---

### Images

The following screenshots are needed before the help page can be considered complete. Please provide these as PNG files (ideally at 2× resolution for retina displays, cropped to show only the relevant UI area):

| #   | Description                                            | Suggested filename        |
| --- | ------------------------------------------------------ | ------------------------- |
| 1   | Canvas with ghost tile, selected tile, terrain visible | `canvas-overview.png`     |
| 2   | Tile edit panel open, terrain picker visible           | `tile-edit-panel.png`     |
| 3   | River and road on adjacent tiles                       | `river-road.png`          |
| 4   | Town tile with name label and adjacent port            | `town-port.png`           |
| 5   | Town with garrison visual, army panel open             | `garrison-army-panel.png` |
| 6   | Map in faction mode with coloured territories          | `faction-mode.png`        |
| 7   | Home screen with map cards                             | `home-screen.png`         |

---

## Order of work

1. **README audit** — read every section of the current README against the codebase; produce a list of corrections and omissions
2. **README rewrite** — rewrite in place following the proposed structure above
3. **State / type changes** — add `'help'` to `Screen`, add `helpReturnScreen` to `UiState`
4. **Toolbar and settings entry points** — add the Help button (desktop) and menu item (mobile)
5. **HelpScreen scaffold** — create the component with section structure and all `t()` keys wired up
6. **English strings** — write all `en.json` help content
7. **Finnish strings** — write all `fi.json` help content (or stub with English fallback pending confirmation)
8. **Images** — integrate provided screenshots once supplied; add alt text
9. **Polish** — responsive layout review on mobile viewport

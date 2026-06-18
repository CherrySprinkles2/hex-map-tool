# New Features — Planning Document

High-level planning overview for upcoming features. Each feature is a numbered
section. This is a living document — review and edit freely; implementation will
not begin until each feature is explicitly confirmed.

---

## 1. Foraging — moved

➡️ **Moved to `map-overlays-plan.md` (Forage overlay).** Foraging is now
implemented as an overlay rather than a standalone map mode; see that document
for the data model, interaction, and display.

---

## 2. Razed Settlements

A way to mark a settlement (town) as razed, shown with a flame on its icon.

### Overview

- Add a **"Razed"** checkbox to the settlement controls in `TileEditPanel`
  (visible only for tiles that have a town).
- When ticked, a **flame symbol** is drawn on top of the settlement icon on the
  map.

### Data model

- Add `razed: boolean` (default `false`) to the tile shape, stored only on town
  tiles, persisted with the map and normalised via `normalizeTile`.
- Toggled by a new/extended tile-flag action in `tilesSlice`.

### Interaction

- Checkbox in the `TileEditPanel` town section toggles `razed` for the selected
  tile. Only shown when `hasTown` is true.

### Map display

- A new **flame SVG asset** (e.g. `src/assets/town/razed.svg`) is drawn over the
  town icon by `drawTowns`, consistent with the existing town/army glyph
  approach. Size/position read from `theme.town` (or a new `theme.razed`) so it
  is themeable.
- **Cosmetic only:** razing does not change any other settlement behaviour —
  town name, ports, garrison, and fortification ring all render as normal.

### Confirmed decisions

- Flame rendered as an SVG asset drawn on the canvas (not an emoji).
- Razed is purely cosmetic.

---

## 3. Notes — moved

➡️ **Moved to `map-overlays-plan.md` (Notes overlay).** Notes is now implemented
as an overlay rather than a standalone map mode; see that document for the data
model, interaction, and display.

---

## 4. Mode-Aware PNG Export

Improve the existing Export PNG modal so the output reflects the active map mode
and the user can preview the image before exporting.

### Overview

- The exported PNG is rendered **in the currently selected map mode**, so it
  carries that mode's visuals — e.g. exporting from Notes mode produces a
  greyscale image with only noted tiles in colour; Foraging mode shows the
  heatmap tint; Faction mode shows faction colouring/borders.
- The modal becomes **significantly larger** and shows a **live preview** of the
  image that will be exported.

### Behaviour

- **Mode source:** export always follows the map mode active when the modal is
  opened (no in-modal mode picker).
- **Preview:** a **static, fit-to-map** preview scaled to fit the (larger) modal;
  it updates whenever export options change. No independent pan/zoom in the
  preview.
- Respects the existing **"current view"** export option as well as full-map
  export — the preview reflects whichever extent option is selected.
- Transient UI (selection ring, ghost guides, army move pulse) is excluded from
  the export, as today.
- The modal shows the active overlay as a label (e.g. "Exporting: Notes view")
  so the user understands why the preview looks the way it does; the overlay
  cannot be changed from within the modal.

### Implementation notes

- Reuse the existing canvas draw passes, parameterised by `uiMode`, to render
  into the offscreen export canvas so the PNG matches on-screen rendering for
  every mode (including the new Foraging tint and Notes greyscale).
- The preview is the same offscreen render scaled down into the modal, keeping a
  single source of truth for what gets exported.

### Confirmed decisions

- Export follows the current map mode (no mode picker in the modal).
- Preview is static, fit-to-map, and honours the existing "current view" option.

---

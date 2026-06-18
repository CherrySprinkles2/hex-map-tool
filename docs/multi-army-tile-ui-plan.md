# Multi-Army Tile UI — Design Plan

## Overview

Three connected improvements to how multiple armies on the same tile are displayed and managed:

1. **Hide army names when 2+ armies share a tile** — shown on hover (desktop) or selection (mobile)
2. **Expanded tile editor** — a modal showing a blown-up hex tile where armies can be dragged to spatial positions; also sets inside/outside status on town tiles
3. **Remove the kite shield** — armies on town tiles render as normal army tokens

---

## 1. State Changes

### `src/types/state.ts` — Army shape

Add two optional fields to `Army`:

```ts
export interface Army {
  id: string;
  q: number;
  r: number;
  name: string;
  composition: string;
  factionId: string | null;
  subTileX?: number; // relative position within expanded view, range roughly -1..1
  subTileY?: number; // relative position within expanded view, range roughly -1..1
  insideTown?: boolean; // only meaningful when the army's tile has hasTown === true
}
```

`subTileX` / `subTileY` are normalised to the unit hex (center = 0,0; corners at ±1 approx). They are only used by the expanded view — the main map renderer ignores them.

### `src/features/armies/armiesSlice.ts`

Add a new action:

```ts
setArmySubTilePosition({ id, subTileX, subTileY });
setArmyInsideTown({ id, insideTown });
```

Both are simple field-update reducers (Immer direct mutation).

---

## 2. Remove the Kite Shield

### `src/components/HexGrid/canvas/drawTowns.ts`

- Remove the kite-shield drawing branch entirely.
- Remove the garrison-suppression guard from `drawArmies.ts` so that army tokens render on town tiles the same as on any other tile.
- Remove the single-garrisoned-army name logic from `drawLabels.ts` (name hiding is now handled uniformly by the hover rule in §3).

---

## 3. Army Name Hiding + Hover

### Main map — `drawLabels.ts`

- **0 or 1 army on tile**: render the army name above the token as today.
- **2+ armies on tile**: render no names.

### Hover highlight — `HexGrid.tsx` (interaction layer)

Add `mousemove` handling on `CanvasInteractionLayer`:

- On each move event, run army hit-testing (`hitTest`) to find which army token the cursor is over.
- Store the result in a ref (`hoveredArmyId`).
- If it changes, call `renderer.onHoveredArmyChanged(id | null)` — the overlay canvas repaints and draws the hovered army's name above its token.

### Mobile

- No hover state on mobile.
- When an army is **selected** (`selectedArmyId`) and 2+ armies share the tile, the overlay canvas renders that army's name above its token (same overlay repaint path).

---

## 4. Expanded Tile Editor

### Trigger

A button **"⊞ Arrange Armies"** added to `TileEditPanel`, visible whenever the selected tile has 1 or more armies. Dispatches no Redux action — opens a local React modal.

### Modal structure — `src/components/TileArrangeModal/`

```
TileArrangeModal.tsx         — modal shell (backdrop + card)
TileArrangeCanvas.tsx        — canvas inside the modal
useTileArrangeDrag.ts        — drag logic hook
```

#### Canvas layout

The modal canvas renders a single hex tile at roughly 4× the main map scale (so `HEX_SIZE * 4 ≈ 200px` radius). It reuses:

- The same terrain pattern fill from `patternCache`
- The same town/river/road draw calls, scaled up
- Army tokens at the same relative size

**For town tiles**, the canvas additionally draws a **semi-transparent inner zone** (a circle or rounded polygon inside the hex, representing the town interior). The boundary is visual only — armies dragged inside it have `insideTown: true`; armies outside have `insideTown: false`.

**For non-town tiles**, no zone is drawn — armies can be placed freely anywhere within the hex boundary.

#### Initial positions

When the modal opens:

- If `subTileX` / `subTileY` are already set on the army, use them.
- Otherwise, distribute armies evenly in a ring around the tile center (same as the current stacking offset logic).

#### Drag interaction

`useTileArrangeDrag`:

1. `pointerdown` on an army token starts a drag.
2. `pointermove` updates a local React state `{ draggingId, offsetX, offsetY }` — the canvas repaints each frame.
3. `pointerup` / `pointercancel`:
   - Clamp position to inside the hex boundary.
   - Determine `insideTown` (is the drop point inside the town zone?).
   - Dispatch `setArmySubTilePosition` and `setArmyInsideTown`.

#### Close / cancel

- Clicking the backdrop or an "✕ Close" button closes the modal.
- Changes are dispatched immediately on each drop (not batched on close), so undo works naturally.

### Modal presentation

- Rendered via a React portal into `document.body`.
- Styled with `styled-components`, reusing panel colour tokens from `theme`.
- Width: `min(480px, 90vw)`. Canvas fills the upper portion; army name list below for reference.
- Works on mobile (touch events go through `pointer` API).

---

## 5. Inside/Outside Visual on Main Map

The main map does **not** change army token positions based on `subTileX`/`subTileY`. However, `insideTown` is reflected:

- **Outside army** (`insideTown: false` or unset, on a town tile): token drawn as normal.
- **Inside army** (`insideTown: true`, on a town tile): token drawn with a **dashed ring** (using the existing `theme.garrison` ring colour) to indicate it is sheltered inside the town walls. This is the only main-map visual distinction.

The token position on the main map continues to use the existing stacking offset regardless of `insideTown`.

---

## 6. `uiSlice` Changes

No new Redux state needed for the modal — it is controlled by local React state in `TileEditPanel` (`const [arrangeOpen, setArrangeOpen] = useState(false)`).

---

## 7. Persistence

`subTileX`, `subTileY`, and `insideTown` are part of the `armies` slice, which is already saved to localStorage by `useLocalStorageSync` and included in JSON export/import. No extra persistence work needed.

`normalizeArmy` in `src/data/exampleMaps.ts` should default both position fields to `undefined` and `insideTown` to `false`.

---

## 8. Files Changed / Created

| File                                                    | Change                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/types/state.ts`                                    | Add `subTileX`, `subTileY`, `insideTown` to `Army`                    |
| `src/features/armies/armiesSlice.ts`                    | Add `setArmySubTilePosition`, `setArmyInsideTown` actions             |
| `src/components/HexGrid/canvas/drawTowns.ts`            | Remove kite shield branch                                             |
| `src/components/HexGrid/canvas/drawArmies.ts`           | Remove town-tile suppression; add dashed ring for `insideTown` armies |
| `src/components/HexGrid/canvas/drawLabels.ts`           | Only render army name when 1 army on tile; overlay handles hover name |
| `src/components/HexGrid/HexGrid.tsx`                    | Add `mousemove` handler; track `hoveredArmyId`; pass to renderer      |
| `src/components/HexGrid/canvas/HexRenderer.ts`          | Add `onHoveredArmyChanged`; overlay repaints hovered army name        |
| `src/components/TileEditPanel/TileEditPanel.tsx`        | Add "Arrange Armies" button; local `arrangeOpen` state                |
| `src/components/TileArrangeModal/TileArrangeModal.tsx`  | New — modal shell                                                     |
| `src/components/TileArrangeModal/TileArrangeCanvas.tsx` | New — blown-up hex canvas                                             |
| `src/components/TileArrangeModal/useTileArrangeDrag.ts` | New — drag hook                                                       |
| `src/data/exampleMaps.ts`                               | Update `normalizeArmy` defaults                                       |
| `src/i18n/locales/en.json` + `fi.json`                  | New keys: `arrangeArmies`, `insideTown`, `outsideTown`                |

---

## 9. Out of Scope

- Sub-tile positions do **not** affect main map rendering positions.
- No gameplay rules are enforced by the tool (e.g. maximum garrison size) — that is left to the user.
- The expanded view does not support adding or deleting armies (use `TileEditPanel` for that).

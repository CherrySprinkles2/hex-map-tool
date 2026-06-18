# Map Overlays — Planning Document

A larger redesign that consolidates the "view" features (Foraging, Notes) and
the existing map modes into a single, discoverable **overlay system**, driven by
a floating panel in the bottom-right of the editor.

> Related: the **Foraging** and **Notes** features have been fully migrated into
> this document (see the Forage and Notes overlay sections) — this is now their
> source of truth. In `new-features-plan.md`, Feature 4 (overlay-aware PNG
> export) should follow whatever the active overlay is, and Feature 2 (Razed) is
> independent of overlays.

---

## Concept

Today, "what a click does" and "what the map shows" are the same thing — a
single exclusive **map mode**. Each new capability adds another mode, which
crowds the toggle and traps new users in a mode they didn't mean to enter.

Instead, introduce **overlays**: named ways of viewing the map, chosen from a
**floating panel anchored bottom-right**. Proposed overlays:

1. **Terrain** — full-colour map, default view, terrain editing enabled.
2. **Factions**
3. **Army**
4. **Forage**
5. **Notes**

To keep each overlay focused, an overlay may **greyscale** the parts of the map
that aren't relevant to it, so the relevant data stands out (e.g. Notes greys
everything except annotated tiles; Forage greys terrain detail under the
heatmap). We will decide the exact display per overlay, one at a time, in the
sections below.

---

## Open question: editing vs. viewing

Quick editing of terrain, factions, and armies is still essential, but it gets
confusing once overlays exist (a click might edit something you can't clearly
see). We need to decide how the active overlay relates to what a click does.
Candidate models:

### Model A — Overlay _is_ the tool (one control) — ✅ CHOSEN

The bottom-right panel selection is the single source of truth.

- **Terrain (default):** full-colour map with terrain editing on click —
  identical to today's Terrain mode.
- **Terrain / Factions / Army:** show that view _and_ enable that edit tool on
  click (exactly like today's modes, just relocated into the overlay panel).
- **Forage / Notes:** show their view; editing happens via canvas (+/− for
  forage) and/or the side panel (notes), as already specced.

Pros: one thing to learn, no hidden second state, smallest change from today.
Cons: can't view one overlay while editing with another.

### Model B — Decoupled tool + overlay (two controls)

A separate "edit tool" selector (Terrain / Faction / Army / None) independent of
the active overlay. Powerful (e.g. edit terrain while viewing the Forage
heatmap) but two states to track and higher risk of "I clicked and edited
something unexpected."

### Model C — View overlays + on-demand edit tools (hybrid)

Overlays are **view-only** (Normal / Forage / Notes / Faction view). The edit
tools (Terrain / Faction / Army) are invoked separately and, while active,
temporarily force their matching view. Forage/Notes edits happen only via their
panel, so those overlays stay safe to browse.

**Decision: Model A** — the bottom-right overlay panel is the single control.
Terrain / Factions / Army overlays double as their edit tool (Terrain is the
default full-colour view); Forage / Notes edit via canvas (+/−) and/or the side
panel.

---

## Floating overlay panel

- Anchored **bottom-right** of the editor, floating above the canvas.
- **Desktop:** always expanded — all five overlays shown as a persistent
  vertical stack, each a button with an **icon + text label** (e.g. 🌲 Terrain).
- **Mobile:** collapses to a single button showing the active overlay; tapping
  expands the list, tapping a choice collapses it again.
- Replaces (or absorbs) the current `MapModeToggle`.

---

## Per-overlay display (to decide one by one)

### Terrain (default)

- Full-colour map with everything drawn (terrain, rivers, roads, towns, ports,
  armies). No greyscale.
- The default overlay when the editor opens.
- Click enables terrain editing — behaviourally identical to today's Terrain
  mode (opens `TileEditPanel`, paint terrain, etc.).
- Merges the earlier "Normal" idea: there is no separate view-only mode.

### Factions

- Full-colour, no greyscale — identical display to today's Faction mode
  (terrain in colour with faction tints/borders drawn over it).
- Unowned tiles stay in their normal terrain colour.
- Click enables faction painting / editing, as today.

### Army

- **Greyscale** the map; tiles that have one or more armies render in full
  colour so occupied tiles stand out.
- Army tokens themselves always draw in full colour (faction-tinted), including
  their faction ring.
- Click enables army editing — place/select/move armies, as today.
- Shares the greyscale render treatment with the Notes overlay.

### Forage

_(Migrated from `new-features-plan.md` Feature 1 — this is now the source of
truth for foraging.)_

**Display**

- **Greyscale** the terrain base; the **heatmap tint** (cap 5) is drawn over it
  so the forage levels read cleanly.
- Tiles with **forage level 0** appear greyscale (no tint) — only foraged tiles
  stand out, deepening with level.
- Rendered as a new canvas draw pass (e.g. `drawForaging`) gated on the Forage
  overlay, reading tint colours/steps from a new `theme.foraging` section so the
  palette is themeable.
- Shares the greyscale render treatment with the Army and Notes overlays.

**Data model**

- Add `forageLevel: number` (default `0`) to the tile shape in `tilesSlice`.
- Persisted with the map like any other tile property (localStorage + JSON
  export envelope) and normalised via `normalizeTile`.
- **Fixed cap of 5**; the level is clamped to `0–5`. Cap defined in one place.

**Interaction**

- Canvas (Forage overlay only): left-click a tile → `forageLevel + 1`;
  right-click → `forageLevel − 1` (both clamped to `0–5`).
- Forage edit panel (selected tile): `+` / `−` buttons, a **Clear** button
  (reset to `0`), and a readout of the current level and cap.
- **Eligibility:** all tiles can be foraged, including water / deep-water.

### Notes

_(Migrated from `new-features-plan.md` Feature 3 — this is now the source of
truth for notes.)_

**Display**

- **Greyscale** the whole map (terrain, rivers, roads, towns, armies all
  desaturated); tiles that have notes (non-empty `notes`) render in full colour
  so annotated tiles stand out.
- Shares the greyscale render treatment with the Army and Forage overlays.

**Data model**

- Reuses the existing `notes` field on the tile shape — no new tile property.
- A tile is "highlighted" when its `notes` string is non-empty.

**Interaction**

- Click a tile to select it; the side panel shows its notes in an **editable**
  textarea (same behaviour as the `TileEditPanel` notes field). Editing
  immediately flips a tile between greyscale and colour.

---

## Cross-cutting decisions still open

- (none currently — see Resolved below.)

### Resolved

- Greyscale is a **single shared render treatment**, reused by the Army, Forage,
  and Notes overlays ("relevant tiles in colour, everything else desaturated").
  Terrain and Factions never greyscale.
- Floating panel: **always expanded** on desktop, **icon + text label** per
  overlay; **collapsible** on mobile only.
- PNG export modal shows the active overlay as a label (e.g. "Exporting: Notes
  view"); no overlay switching from within the modal.

---

## Step-by-step implementation plan

Ordered so each phase builds on the previous one and the app stays shippable
between phases. Run `npm run build` after each phase, and add/adjust Playwright
coverage as noted.

### Phase 1 — Overlay framework (foundation)

1. **Overlay state.** Replace `ui.mapMode` with an `overlay` value
   (`'terrain' | 'faction' | 'army' | 'forage' | 'notes'`, default `'terrain'`)
   in `uiSlice`. Update all existing `mapMode` readers/dispatchers. Selecting an
   overlay clears any selection that doesn't apply, mirroring current mode
   behaviour.
2. **Floating overlay panel.** New component anchored bottom-right, replacing
   `MapModeToggle`. Desktop: always-expanded vertical stack of icon + text
   buttons. Mobile: collapses to a single button showing the active overlay,
   expands on tap. Wire each button to set the overlay.
3. **Shared greyscale treatment.** Add one reusable render mechanism in
   `HexRenderer` / the draw passes that desaturates any tile failing the active
   overlay's "is this tile relevant?" predicate. Overlays without greyscale
   (Terrain, Factions) pass an always-true predicate.

_Verify: overlay switching works; Terrain/Factions/Army still behave as before._

### Phase 2 — Map existing modes onto overlays

4. **Terrain overlay** = today's terrain editing, default, full colour.
5. **Factions overlay** = today's faction mode, full colour.
6. **Army overlay** = today's army editing, now with the shared greyscale
   predicate "tile has ≥1 army" (tokens always full colour).

_Verify: existing Playwright tile/faction/army specs pass against the panel._

### Phase 3 — Forage overlay (new data + behaviour)

7. **Data.** Add `forageLevel` to the tile shape, `normalizeTile`, and reducers
   (increment / decrement / clear / set), clamped `0–5`. Confirm persistence and
   JSON export round-trip.
8. **Render.** Add `theme.foraging` palette + a `drawForaging` heatmap pass over
   the greyscaled base; level-0 tiles stay greyscale.
9. **Interaction.** Canvas left/right-click ±1 in the Forage overlay; a Forage
   edit panel with `+` / `−` / **Clear** and a level readout.

_Verify: new Playwright spec — forage up/down/clear, persistence, cap at 5._

### Phase 4 — Notes overlay

10. **Render.** Greyscale the map except tiles with non-empty `notes` (reuses
    the Phase 1 shared treatment).
11. **Panel.** Notes edit panel with an editable textarea; selecting a tile
    loads its notes; edits flip the tile between greyscale and colour live.

_Verify: new Playwright spec — note highlight + edit flips colour._

### Phase 5 — Razed settlements (independent)

12. Implement Feature 2 from `new-features-plan.md` (tile `razed` flag, panel
    checkbox, flame SVG over the town icon). Not dependent on overlays — can be
    done any time.

### Phase 6 — Overlay-aware PNG export

13. Enlarge the export modal and add the static fit-to-map **preview**.
14. Render the export/preview through the overlay-parameterised draw passes so
    the PNG matches each overlay (incl. greyscale + forage tint), honouring the
    existing "current view" extent option.
15. Show the active-overlay label in the modal.

_Verify: existing export download test still passes; preview renders per
overlay._

### Cross-cutting (every phase)

- i18n: add labels/keys for the panel, overlays, and the Forage panel in
  `en.json` / `fi.json`.
- Keep `theme.ts` the single source of truth for new colours (forage palette,
  greyscale treatment, razed flame).

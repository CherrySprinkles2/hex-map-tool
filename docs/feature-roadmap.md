# Feature Roadmap — June 2026

A lightweight plan for three upcoming pieces of work, in proposed implementation order.
Details are intentionally rough; each feature gets fleshed out at implementation time.

## Proposed order

1. **Faction-mode right-click bug fix** — smallest change, fixes a destructive bug
2. **Nation border rendering** — renderer work in faction mode, builds context for…
3. **PNG export** — the largest piece, reuses the same renderer draw modules

---

## 1. Bug fix: right-click in faction mode deletes the tile

**Goal.** In faction mode (`mapMode === 'faction'`), right-clicking a tile currently falls
through to the default context-menu behaviour and deletes the tile. It should instead
**unassign the tile's faction** (`factionId → null`), leaving terrain and all other tile
properties untouched.

**Scope & decisions.**

- Fix applies to faction mode only. Right-click in terrain mode keeps deleting tiles;
  terrain-paint mode is unchanged.
- Right-clicking a tile with no faction assigned is a no-op (no deletion, no error).

**Rough approach.** Branch on `mapMode` in `handleCanvasContextMenu` in `HexGrid.tsx`:
when faction mode is active, dispatch the faction-clearing action on the hit tile instead
of the delete action. Add a Playwright spec (desktop only — right-click tests are skipped
on mobile per existing convention).

---

## 2. Faction mode: nation border rendering toggle

**Goal.** A "political map" view: instead of filling every owned tile with its faction
colour, draw only the **outline of each faction's territory**. A nation of 200 tiles
renders as one border line; disconnected exclaves each get their own outline.

**Scope & decisions.**

- Toggle lives in `FactionPaintPanel`.
- With the toggle on, territory interiors render as **plain terrain** — the faction
  colour appears only on the border line.
- The preference is **session-only UI state** in `uiSlice` (e.g. `factionBorderMode`);
  it resets to per-tile fill on reload. Not persisted with the map.

**Rough approach.** Edge-based: for each faction-owned tile, draw any hex edge whose
neighbour is not owned by the same faction in the faction colour. Interior edges between
same-faction tiles are skipped, so contiguous territory naturally produces a single
outline and exclaves fall out for free. This per-tile formulation also plays nicely with
viewport culling (each visible tile knows its own border edges). Border width/colour
styling goes in `theme.ts` alongside the other canvas draw properties.

**Added during implementation.** The border also gets an inward colour fade (~half a
tile) so large territories stay readable. Implemented as an inner glow: each faction's
border edges are stroked once with a blurred shadow, clipped to the union of the
faction's tiles, so the fade is smooth around corners. Tunable via
`theme.factionBorder` (`width`, `fadeRadius`, `fadeAlpha`).

**Open question (investigate during the work).** Is faction _painting_ still usable while
border mode is on? A freshly painted interior tile produces no visible change. If it's
confusing in practice, decide between e.g. briefly highlighting painted tiles or
disabling/discouraging painting while border mode is active.

---

## 3. PNG export of the map

**Goal.** Export the current map as a PNG, downloaded from the top toolbar on desktop or
the Settings sheet on mobile.

**Scope & decisions.**

- An export dialog offers a choice of area:
  - **Entire map** — auto-fit to the bounding box of all placed tiles, regardless of
    current pan/zoom. Rendered at full quality but automatically scaled down so the
    longest side stays under a browser-safe cap (~8192 px). No user-facing size options.
  - **Current viewport** — exactly what's on screen, at the current zoom.
- **Transparent background** — only hexes and features are opaque.
- **Full map render**: tiles, rivers, roads, causeways, towns, ports, labels, armies.
  No ghost tiles and no selection/move overlays.

**Rough approach.** Render to an offscreen canvas reusing the existing draw modules
(`drawTiles` → `drawArmies`), skipping `drawGhosts` and the overlay pass, and skipping
the background fill for transparency. The full-map path ignores viewport culling and
iterates all tiles; the transform is computed from the tile bounding box and the size
cap. Output via `canvas.toBlob('image/png')` with the map name as the filename. Add a
Playwright download test (`page.waitForEvent('download')` per existing convention).

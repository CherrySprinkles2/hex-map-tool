# Theming Audit & Refactor Plan

## Goals

Make it possible to swap the entire visual theme — colours, zIndex stack, and icon set — by editing a single file (`src/styles/theme.ts`) and recompiling. No runtime switching is required.

## Constraints & Decisions

| Topic                                                     | Decision                                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Surface opacity tints (`rgba(255,255,255,0.05)` etc.)     | Move to `theme.surface.*` semantic tokens                                                                    |
| Pattern tile textures (GrassPattern, ForestPattern, etc.) | Leave hardcoded — they are relative texture overlays, not brand colours                                      |
| Icons linked to theme                                     | Theme exports a `theme.icons` map; consumers import from theme rather than directly from `src/assets/icons/` |
| Semantic colours (success, danger, paint mode)            | Grouped under `theme.ui` namespace                                                                           |
| z-index local raises (`z-index: 1` in button groups)      | Stay as literal `1` — these are structural, not global-layer values                                          |
| Static SVG files (town/village/city)                      | Convert to React TSX components; accept theme colour props                                                   |
| ErrorBoundary inline styles                               | Leave outside — intentionally avoids styled-components in case the style engine itself has failed            |
| Runtime theme switching                                   | Out of scope for now                                                                                         |

---

## Current State Audit

### Theme file today (`src/styles/theme.ts`)

Top-level keys already in theme:

```
background, panelBackground, panelBorder, text, textMuted, accent
terrain (Record<string, { color, label }>)
tileStroke, selectedStroke, ghostFill, ghostStroke
waterEdge, river, road
town (color, labelColor, labelShadow, groundColor, buildingColor, fortification, size)
garrison, port, causeway
factionColors (string[])
army (tokenFill, tokenStroke, selectedColor, movingColor, labelFill, labelStroke, ...)
terrainButtonMix
zIndex (toggle:40, toolbar:50, panel:100, backdrop:149, sheet:150)
```

### What is missing or hardcoded

**Surface tints** — ~120 instances of `rgba(255,255,255,N)` and `rgba(0,0,0,N)` scattered across every component. No semantic names, values duplicated inconsistently.

**Semantic UI colours** — four colour groups used in the UI have no theme entry:

- Success: `#27ae60`, `#2ecc71`, `#50dc64` (TerrainConfigModal enable states, import pulse)
- Danger: `#c0392b`, `#e74c3c` (TerrainConfigModal disable/invalid states)
- Paint mode: `rgba(147,112,219,...)` = `#9370db` (paint terrain button)
- Import highlight: `#50dc64` glow (home screen new-map pulse animation)

**z-index gaps** — two hardcoded values not in `zIndex` scale:

- `z-index: 200` in `TerrainConfigModal` (full-screen modal overlay)
- `z-index: 100` in `ArmyPanel` dropdown list (in-panel dropdown, above panel content)
- `theme.zIndex.sheet + 1` in `LanguageModal` (code smell — should be a named entry)

**Town street colour** — `#a08060` hardcoded in all three SVG assets; not in theme.

**City courtyard colour** — `#5aaa44` hardcoded in `city.svg`; not in theme.

**Icons** — no `theme.icons` map exists. Components import directly from `src/assets/icons/`:

- `TileEditPanel` imports `TERRAIN_ICON`, `RiverIcon`, `RoadIcon`, `PortIcon`, `LandIcon`
- `ArmyToken` (HexGrid) imports `LandIcon`, `NavalIcon`
- `TerrainConfigModal` imports `TERRAIN_ICON`

**Static SVG assets** — three files in `src/components/TownEditPanel/assets/` with hardcoded colours:

- `village.svg` — ground `#7ec850`, building `#012731`, street `#a08060`
- `town.svg` — same
- `city.svg` — same plus courtyard `#5aaa44`

---

## Proposed Theme Shape

Below is the full diff to `AppTheme` / `theme.ts`. Existing keys are unchanged; only additions are shown.

### 1. `theme.surface` — opacity surface tokens

```ts
surface: {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  base:       'rgba(255,255,255,0.02)',  // bare-minimum tint (inactive option buttons)
  subtle:     'rgba(255,255,255,0.03)', // slight elevation (ghost buttons, add-army)
  card:       'rgba(255,255,255,0.05)', // input backgrounds, modest card fills
  hoverWeak:  'rgba(255,255,255,0.06)', // gentlest hover (language toggle)
  hover:      'rgba(255,255,255,0.08)', // standard hover state
  activeWeak: 'rgba(255,255,255,0.10)', // light active / selected
  active:     'rgba(255,255,255,0.12)', // strong active / pressed

  // ── Borders ──────────────────────────────────────────────────────────────
  borderFaint:  'rgba(255,255,255,0.10)', // inactive flag-toggle / dropdown option borders
  border:       'rgba(255,255,255,0.15)', // standard input borders
  borderMedium: 'rgba(255,255,255,0.20)', // button borders (inactive)
  borderStrong: 'rgba(255,255,255,0.25)', // ghost tile stroke, strong borders
  borderFocus:  'rgba(255,255,255,0.40)', // focus-ring / active input border

  // ── Dark overlays ─────────────────────────────────────────────────────────
  overlayLight:  'rgba(0,0,0,0.30)',  // subtle shadow
  overlayMedium: 'rgba(0,0,0,0.50)', // card delete button, colour-picker bg
  overlayHeavy:  'rgba(0,0,0,0.60)', // modal backdrop, badge background
}
```

**Mapping notes** — a handful of one-off values will round to the nearest token:

- `rgba(255,255,255,0.04)` (FactionsPanel) → `surface.card`
- `rgba(255,255,255,0.07)` (FactionPaintPanel) → `surface.hoverWeak`
- `rgba(255,255,255,0.30)` (hover states) → split between `surface.hover` and `surface.borderMedium` depending on context — check visually
- `rgba(0,0,0,0.40)` (box-shadow) → `surface.overlayMedium`
- `rgba(0,0,0,0.70)` (label shadow, already in `town.labelShadow` and `garrison.nameShadow`) — leave on existing theme keys

### 2. `theme.ui` — semantic UI colours

```ts
ui: {
  success:       '#27ae60', // TerrainConfigModal enabled-state border
  successLight:  '#2ecc71', // TerrainConfigModal enabled button text
  successImport: '#50dc64', // Import pulse animation (brighter, translucent glow)
  danger:        '#c0392b', // TerrainConfigModal disabled-state border
  dangerLight:   '#e74c3c', // TerrainConfigModal disabled button text
  paintMode:     '#9370db', // Paint terrain button (RGB 147,112,219)
}
```

### 3. `theme.town` — two new colour keys

```ts
town: {
  // ... existing keys ...
  streetColor:     '#a08060', // dirt road colour in town preview icons
  courtyardColor:  '#5aaa44', // inner courtyard in city preview icon
}
```

### 4. `theme.zIndex` — three new entries

```ts
zIndex: {
  toggle:     40,   // existing
  toolbar:    50,   // existing
  panel:      100,  // existing
  dropdown:   110,  // in-panel dropdowns (ArmyPanel faction picker)
  backdrop:   149,  // existing
  sheet:      150,  // existing
  langModal:  151,  // LanguageModal (replaces `sheet + 1` arithmetic)
  modal:      200,  // full-screen modal overlays (TerrainConfigModal)
}
```

### 5. `theme.icons` — icon component map

```ts
icons: {
  terrain: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>;
  features: {
    river: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    road: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    port: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
  army: {
    land: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    naval: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
  town: {
    village: React.ComponentType<TownIconProps>;
    town: React.ComponentType<TownIconProps>;
    city: React.ComponentType<TownIconProps>;
  }
}
```

Where `TownIconProps` extends `React.SVGProps<SVGSVGElement>` and adds optional colour overrides:

```ts
interface TownIconProps extends React.SVGProps<SVGSVGElement> {
  groundColor?: string;
  buildingColor?: string;
  streetColor?: string;
  courtyardColor?: string; // city only
}
```

---

## Implementation Phases

### Phase 1 — Extend types and theme values

**Files:** `src/types/theme.ts`, `src/styles/theme.ts`

1. Add `SurfaceScale`, `UiColors` interfaces to `types/theme.ts`.
2. Add `surface`, `ui` fields to `AppTheme`.
3. Add `streetColor`, `courtyardColor` to `town` in `AppTheme`.
4. Add `dropdown`, `langModal`, `modal` to `ZIndexScale`.
5. Add stub `icons` field to `AppTheme` (typed as `unknown` initially; filled in Phase 3).
6. Populate all new values in `theme.ts`.

No consumers change in this phase — it is purely additive. TypeScript will confirm nothing broke.

---

### Phase 2 — Replace hardcoded colours in styled components

Work file-by-file. In each file, import `theme` from `../../styles/theme` where not already available, or rely on the styled-components `({ theme }) => ...` prop.

**Priority order** (most violations first):

#### `src/components/TileEditPanel/TileEditPanel.tsx`

- `rgba(255,255,255,0.1)` → `theme.surface.borderFaint`
- `rgba(255,255,255,0.03)` → `theme.surface.subtle`
- `rgba(255,255,255,0.08)` → `theme.surface.hover`
- `rgba(255,255,255,0.2)` → `theme.surface.borderMedium`
- `rgba(255,255,255,0.4)` → `theme.surface.borderFocus`
- `rgba(255,255,255,0.05)` → `theme.surface.card`
- `rgba(255,255,255,0.15)` → `theme.surface.border`
- `rgba(212,160,23,…)` (army row) → derive from `theme.garrison.nameColor` with opacity (e.g. `${theme.garrison.nameColor}59` for 35%)
- `rgba(147,112,219,…)` (paint mode button) → `theme.ui.paintMode` with opacity suffix
- `#888888` (paint-off brush) → `theme.textMuted`

#### `src/components/ArmyPanel/ArmyPanel.tsx`

- `rgba(255,255,255,0.15)` → `theme.surface.border`
- `rgba(255,255,255,0.05)` → `theme.surface.card`
- `rgba(255,255,255,0.4)` → `theme.surface.borderFocus`
- `rgba(255,255,255,0.03)` → `theme.surface.subtle`
- `rgba(255,255,255,0.08)` → `theme.surface.hover`
- `rgba(255,170,0,0.08)` / `rgba(255,170,0,0.2)` (Hint box) → derive from `theme.army.movingColor`
- `rgba(255,255,255,0.3)` (dropdown trigger hover) → `theme.surface.borderMedium`
- `rgba(255,255,255,0.5)` (dropdown chevron) → `theme.surface.borderFocus` or literal opacity on `theme.text`
- `rgba(255,255,255,0.15)` (dropdown list border) → `theme.surface.border`
- `rgba(0,0,0,0.4)` (dropdown box-shadow) → `theme.surface.overlayMedium`
- `#ffaa00` (move button) → `theme.army.movingColor` (already in theme — just wire it up)

#### `src/components/TownEditPanel/TownEditPanel.tsx`

- `rgba(255,255,255,0.2)` → `theme.surface.borderMedium`
- `rgba(255,255,255,0.05)` → `theme.surface.card`
- `rgba(255,255,255,0.1)` → `theme.surface.borderFaint`
- `rgba(255,255,255,0.02)` → `theme.surface.base`
- `rgba(255,255,255,0.3)` → `theme.surface.hover` (hover background)
- `rgba(255,255,255,0.06)` → `theme.surface.hoverWeak`

#### `src/components/TerrainConfigModal/TerrainConfigModal.tsx`

- `rgba(0,0,0,0.6)` (modal backdrop) → `theme.surface.overlayHeavy`
- `rgba(255,255,255,0.03)` → `theme.surface.subtle`
- `rgba(255,255,255,0.2)` → `theme.surface.borderMedium`
- `#c0392b` → `theme.ui.danger`
- `#e74c3c` → `theme.ui.dangerLight`
- `#aaa` (disabled text) → `theme.textMuted`
- `#27ae60` → `theme.ui.success`
- `rgba(255,255,255,0.15)` → `theme.surface.border`
- `rgba(255,255,255,0.4)` → `theme.surface.borderFocus`
- `rgba(255,255,255,0.08)` → `theme.surface.hover`
- `rgba(255,255,255,0.06)` → `theme.surface.hoverWeak`
- `#27ae60` (save button border) → `theme.ui.success`
- `#2ecc71` (save button text) → `theme.ui.successLight`
- `rgba(46,204,113,0.1)` (save button bg) → `${theme.ui.successLight}1a`
- `rgba(0,0,0,0.3)` → `theme.surface.overlayLight`
- `#8B6914` (custom terrain default color in data) → `theme.garrison.nameColor` or a new `theme.ui.defaultTerrainColor`
- `rgba(255,255,255,0.15)` (inline style border) → `theme.surface.border`

#### `src/components/HomeScreen/HomeScreen.tsx`

- `#0f3460` (notice border) → `theme.panelBorder`
- `rgba(15,52,96,0.25)` (notice bg) → `${theme.panelBorder}40`
- `#50dc64` (import pulse keyframe) → `theme.ui.successImport`
- `rgba(80,220,100,…)` (import pulse box-shadow) → derive from `theme.ui.successImport`
- `rgba(0,0,0,0.5)` (card delete btn) → `theme.surface.overlayMedium`
- `rgba(80,220,100,0.85)` (imported badge bg) → `${theme.ui.successImport}d9`
- `#000` (imported badge text) → hardcoded black is fine here (always on green)
- `rgba(0,0,0,0.6)` (example badge bg) → `theme.surface.overlayHeavy`

#### `src/components/FactionsPanel/FactionsPanel.tsx`

- `rgba(255,255,255,0.04)` → `theme.surface.card`
- `#fff` (text on coloured faction bg) → leave as literal — it is always white on saturated colour
- `rgba(255,255,255,0.6)` → `theme.surface.borderFocus` (or literal)
- `rgba(0,0,0,0.2)` → `theme.surface.overlayLight`

#### `src/components/FactionPaintPanel/FactionPaintPanel.tsx`

- `rgba(255,255,255,0.4)` → `theme.surface.borderFocus`
- `rgba(255,255,255,0.06)` → `theme.surface.hoverWeak`
- `rgba(255,255,255,0.03)` → `theme.surface.subtle`
- `rgba(255,255,255,0.07)` → `theme.surface.hoverWeak`
- `rgba(255,255,255,0.2)` → `theme.surface.borderMedium`
- `rgba(255,255,255,0.15)` → `theme.surface.border`

#### `src/components/shared/StyledTextarea.ts`

- `rgba(255,255,255,0.12)` → `theme.surface.active` (or `theme.surface.border` — check visually)
- `rgba(255,255,255,0.05)` → `theme.surface.card`
- `rgba(255,255,255,0.35)` → `theme.surface.borderFocus`

#### `src/components/shared/sheet.ts`

- `rgba(255,255,255,0.06)` → `theme.surface.hoverWeak`
- `rgba(255,255,255,0.08)` → `theme.surface.hover`

#### `src/components/shared/LanguageToggle.tsx`

- `rgba(255,255,255,0.06)` → `theme.surface.hoverWeak`

#### `src/components/shared/LanguageModal.tsx`

- `rgba(0,0,0,0.6)` → `theme.surface.overlayHeavy`
- `rgba(255,255,255,0.06)` → `theme.surface.hoverWeak`
- `rgba(255,255,255,0.02)` → `theme.surface.base`
- `rgba(255,255,255,0.08)` → `theme.surface.hover`

#### `src/components/MapModeToggle/MapModeToggle.tsx`

- `rgba(0,0,0,0.4)` → `theme.surface.overlayMedium`

---

### Phase 3 — Fix hardcoded z-index values

**Files:** `TerrainConfigModal`, `ArmyPanel`, `LanguageModal`

| Location                      | Current value            | Replace with             |
| ----------------------------- | ------------------------ | ------------------------ |
| `TerrainConfigModal` backdrop | `z-index: 200`           | `theme.zIndex.modal`     |
| `ArmyPanel` `DropdownList`    | `z-index: 100`           | `theme.zIndex.dropdown`  |
| `LanguageModal`               | `theme.zIndex.sheet + 1` | `theme.zIndex.langModal` |

---

### Phase 4 — Convert static SVGs to React components

#### New files to create

**`src/assets/icons/town/VillageIcon.tsx`**

```tsx
interface Props extends React.SVGProps<SVGSVGElement> {
  groundColor?: string;
  buildingColor?: string;
  streetColor?: string;
}
// Renders the village.svg geometry using prop colours.
// Defaults: groundColor=theme.town.groundColor, etc. — caller must pass or use withTheme.
```

**`src/assets/icons/town/TownIcon.tsx`** — same pattern for town.svg geometry.

**`src/assets/icons/town/CityIcon.tsx`** — same pattern for city.svg geometry, adds `courtyardColor` prop.

**`src/assets/icons/town/index.ts`** — barrel export.

#### Files to update after SVG components exist

**`src/components/TownEditPanel/TownSizePreview.tsx`**

- Remove `import villageUrl`, `townUrl`, `cityUrl`
- Import `VillageIcon`, `TownIcon`, `CityIcon` from `src/assets/icons/town`
- Render as `<VillageIcon width="60" height="60" groundColor={theme.town.groundColor} .../>` via `useTheme()` or pass the theme directly

**`src/components/TownEditPanel/FortificationPreview.tsx`**

- Remove `import townUrl`
- Import `TownIcon` from `src/assets/icons/town`
- Replace `<image href={townUrl} .../>` with `<TownIcon x={...} y={...} width={...} height={...} groundColor={...} .../>`

#### Files to delete

- `src/components/TownEditPanel/assets/village.svg`
- `src/components/TownEditPanel/assets/town.svg`
- `src/components/TownEditPanel/assets/city.svg`

Check that no other files import these SVG assets before deleting.

---

### Phase 5 — Add `theme.icons` map and migrate consumers

#### Update `src/styles/theme.ts`

Add imports at the top:

```ts
import {
  GrassIcon,
  FarmIcon,
  ForestIcon,
  MountainIcon,
  LakeIcon,
  OceanIcon,
} from '../assets/icons/terrain';
import { RiverIcon, RoadIcon, PortIcon } from '../assets/icons/features';
import { LandIcon, NavalIcon } from '../assets/icons/army';
import { VillageIcon, TownIcon, CityIcon } from '../assets/icons/town';
```

Add to the theme object:

```ts
icons: {
  terrain: {
    grass:    GrassIcon,
    farm:     FarmIcon,
    forest:   ForestIcon,
    mountain: MountainIcon,
    lake:     LakeIcon,
    ocean:    OceanIcon,
    // Custom terrain types have no built-in icon — consumers fall back to iconUrl or colour swatch
  },
  features: {
    river: RiverIcon,
    road:  RoadIcon,
    port:  PortIcon,
  },
  army: {
    land:  LandIcon,
    naval: NavalIcon,
  },
  town: {
    village: VillageIcon,
    town:    TownIcon,
    city:    CityIcon,
  },
},
```

#### Update `AppTheme` / `ZIndexScale` types

Add `icons` to `AppTheme` interface using the appropriate component type aliases (import `React` types in the types file, or define a `SvgIconComponent` alias).

#### Update consumers

**`src/components/TileEditPanel/TileEditPanel.tsx`**

- Remove direct import of `TERRAIN_ICON` from `src/assets/icons/terrain`
- Remove direct import of `RiverIcon`, `RoadIcon`, `PortIcon`
- Remove direct import of `LandIcon`
- Use `theme.icons.terrain[id]`, `theme.icons.features.river`, etc.
- `FLAGS` array — reference `theme.icons.features.river` etc. instead of imported components
- Note: `theme` object imported directly (not via styled-components prop) for the `FLAGS` constant

**`src/components/HexGrid/ArmyToken.tsx`**

- Remove direct imports of `LandIcon`, `NavalIcon`
- Use `theme.icons.army.land`, `theme.icons.army.naval`
- Since `ArmyToken` is an SVG context (not styled-components), import `theme` directly

**`src/components/TerrainConfigModal/TerrainConfigModal.tsx`**

- Remove direct import of `TERRAIN_ICON`
- Use `theme.icons.terrain[id] ?? null`

**`src/hooks/useTerrainList.ts`**

- The `TerrainEntry.Icon` field currently falls back to `TERRAIN_ICON[id]`
- Update to use `theme.icons.terrain[id]`
- Remove direct import of `TERRAIN_ICON`

**`src/assets/icons/terrain/index.ts`**

- `TERRAIN_ICON` map can be removed once all consumers use `theme.icons.terrain`
- Keep individual named exports (they are still needed by `theme.ts` itself)

---

## Files Affected — Complete Reference

| File                                                       | Phase   | Change type                                                        |
| ---------------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| `src/types/theme.ts`                                       | 1       | Add interfaces: `SurfaceScale`, `UiColors`, extended `ZIndexScale` |
| `src/styles/theme.ts`                                      | 1, 5    | Add values for all new keys; add icon imports and map              |
| `src/styles/styled.d.ts`                                   | 1       | No change needed (extends `AppTheme` automatically)                |
| `src/components/TileEditPanel/TileEditPanel.tsx`           | 2, 5    | Replace ~15 hardcoded colours; use `theme.icons`                   |
| `src/components/ArmyPanel/ArmyPanel.tsx`                   | 2       | Replace ~12 hardcoded colours                                      |
| `src/components/TownEditPanel/TownEditPanel.tsx`           | 2, 4    | Replace ~8 hardcoded colours; consume new SVG components           |
| `src/components/TerrainConfigModal/TerrainConfigModal.tsx` | 2, 3, 5 | Replace ~14 hardcoded colours; fix z-index; use `theme.icons`      |
| `src/components/HomeScreen/HomeScreen.tsx`                 | 2       | Replace ~8 hardcoded colours                                       |
| `src/components/FactionsPanel/FactionsPanel.tsx`           | 2       | Replace ~4 hardcoded colours                                       |
| `src/components/FactionPaintPanel/FactionPaintPanel.tsx`   | 2       | Replace ~6 hardcoded colours                                       |
| `src/components/shared/StyledTextarea.ts`                  | 2       | Replace 3 hardcoded colours                                        |
| `src/components/shared/sheet.ts`                           | 2       | Replace 2 hardcoded colours                                        |
| `src/components/shared/LanguageToggle.tsx`                 | 2       | Replace 1 hardcoded colour                                         |
| `src/components/shared/LanguageModal.tsx`                  | 2, 3    | Replace 4 hardcoded colours; fix `sheet + 1` z-index               |
| `src/components/MapModeToggle/MapModeToggle.tsx`           | 2       | Replace 1 hardcoded colour                                         |
| `src/components/TownEditPanel/TownSizePreview.tsx`         | 4       | Swap `<img>` for React icon components                             |
| `src/components/TownEditPanel/FortificationPreview.tsx`    | 4       | Swap `<image href>` for React icon component                       |
| `src/assets/icons/town/VillageIcon.tsx`                    | 4       | **New file**                                                       |
| `src/assets/icons/town/TownIcon.tsx`                       | 4       | **New file**                                                       |
| `src/assets/icons/town/CityIcon.tsx`                       | 4       | **New file**                                                       |
| `src/assets/icons/town/index.ts`                           | 4       | **New file**                                                       |
| `src/components/TownEditPanel/assets/village.svg`          | 4       | **Delete**                                                         |
| `src/components/TownEditPanel/assets/town.svg`             | 4       | **Delete**                                                         |
| `src/components/TownEditPanel/assets/city.svg`             | 4       | **Delete**                                                         |
| `src/hooks/useTerrainList.ts`                              | 5       | Use `theme.icons.terrain` instead of `TERRAIN_ICON`                |
| `src/components/HexGrid/ArmyToken.tsx`                     | 5       | Use `theme.icons.army`                                             |
| `src/assets/icons/terrain/index.ts`                        | 5       | Remove `TERRAIN_ICON` map once consumers migrated                  |

**Not touched:**

- `src/components/ErrorBoundary/` — intentionally outside ThemeProvider; leave with a `// eslint-disable` comment explaining why
- `src/assets/icons/patterns/` — hardcoded colours are relative texture overlays; leave as-is

---

## Recommended Execution Order

1. **Phase 1** (types + theme values) — sets the foundation; no risk, purely additive
2. **Phase 4** (SVG → React components) — self-contained; unblocks Phase 5 for `theme.icons.town`
3. **Phase 5** (icons map) — requires Phase 4 to be complete for town icons
4. **Phase 2** (replace hardcoded colours) — largest change; do file-by-file, run `tsc --noEmit` and `npm run test:e2e` after each file
5. **Phase 3** (z-index) — small and safe; can be done alongside Phase 2

After all phases, run the full e2e test suite and do a visual pass in the browser to catch any colour tokens that didn't round correctly to their nearest `surface.*` equivalent.

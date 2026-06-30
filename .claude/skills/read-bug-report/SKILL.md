---
name: read-bug-report
description: Read and triage a Hex Map Tool diagnostic bug report JSON (schema "hex-map-tool-bug-report/2") produced by the Settings → Diagnostics → "Create bug report" button. Use when a user shares such a file or pastes its contents and asks what's wrong, especially for flickering/flashing, freezing, or runaway-rerender complaints.
---

# Reading a Hex Map Tool bug report

The "Create bug report" button (Settings modal → Diagnostics) downloads
`hex-map-tool-bug-report-<timestamp>.json`. It is a point-in-time snapshot of the
last ~60 seconds of app activity.

**The report is anonymised.** Anything that could reveal map content is obscured
(see "Anonymisation" below) — do not try to read map names, sizes, or tile
positions out of it; you can't, and you shouldn't represent that you can. Source
of truth for the format:

- `src/utils/bugReport.ts` — assembles the report (`BugReport` interface)
- `src/app/actionLog.ts` — the rolling Redux action log + payload summarizer
- `src/utils/renderMetrics.ts` — canvas repaint counters
- `src/utils/anonymize.ts` — `anonToken` (per-session value tokens) + `bucket` (count ranges)

## Schema

```jsonc
{
  "schema": "hex-map-tool-bug-report/2",
  "generatedAt": "2026-06-30T22:00:00.000Z",
  "app": {
    "url", "route",          // /map/<slug> has its slug replaced by a token
    "mapId",                 // opaque saved-map id (null = unsaved/example), no map content
    "mapName",               // ANONYMISED token of the name, e.g. "~k3f9" — not the name
    "tileCount", "armyCount", "factionCount"  // ANONYMISED range buckets, e.g. "101-250"
  },
  "environment": {
    "userAgent", "language", "online", "devicePixelRatio",
    "documentHidden", "visibilityState",
    "screen": { "width", "height" },
    "window": { "innerWidth", "innerHeight" }
  },
  "render": {
    "mainPaints":    { "last1s", "last10s", "last60s" },  // main map canvas repaints (real counts)
    "overlayPaints": { "last1s", "last10s", "last60s" }   // selection/marching-ants canvas
  },
  "actions": {
    "windowMs": 60000,
    "count":     <total actions retained in the window — real number>,
    "perSecond": <count / 60>,
    "log": [ { "t": <epochMs>, "sinceMs": <ms before capture>, "type": "slice/action", "summary": <anonymised shape> } ]
  }
}
```

### Anonymisation (what's real vs obscured)

- **Real / map-independent — trust these:** `generatedAt`, `environment.*`,
  `render.*` repaint counts, `actions.count`/`perSecond`, every `actions.log[].t`,
  `sinceMs`, and `type`. These drive the diagnosis.
- **Obscured — do not infer map content:**
  - `app.mapName` and the URL slug → per-session `anonToken` (`"~xxxx"`).
  - `app.tileCount` / `armyCount` / `factionCount` → coarse range **strings**
    (`"0"`, `"1"`, `"2"`, `"6-10"`, `"2501-5000"`, `"10001+"`). Order of magnitude
    only — useful for "is this a huge map?" perf triage, never an exact quantity.
  - `actions.log[].summary` (see below).

### Action payload summaries (`actions.log[].summary`)

Each summary keeps the payload's _shape_ but anonymises every value:

- object → `{ "kind": "object", "size": <bucket>, "keys": [<up to 12 anonTokens>] }`
- array → `{ "kind": "array", "length": <bucket> }`
- string → `{ "kind": "string", "value": <anonToken> }`
- number → `{ "kind": "number", "value": <bucket> }`
- boolean→ `{ "kind": "boolean" }`
- null/undefined → `null`

Tokens are **stable within one report**: the same original value (e.g. one tile's
coordinate, or one army id) always yields the same `~token`. So you can still see
that the _same_ thing recurs — you just can't tell _what_ it is. Across different
reports the tokens differ (random per-session salt), so don't try to correlate
tokens between two files.

## Triage workflow

1. **Confirm the schema.** `schema === "hex-map-tool-bug-report/2"`. (A "/1" file is
   an older, non-anonymised format — same fields but exact counts and raw keys.)

2. **Flashing / runaway-rerender (the main thing this report exists to catch):**
   - `render.mainPaints.last1s` — healthy idle is `0`. User-driven pan/zoom tops out
     near the display refresh (~60). **Sustained ~60+/s with no interaction is a
     runaway main-canvas repaint loop** ("the whole map is flashing").
   - `render.overlayPaints.last1s` near ~60 is _expected_ while a tile/army is
     selected (marching-ants). overlay-high but main ~0 = only the thin selection
     ring animates, not the map.
   - `actions.perSecond` — humans dispatch a handful per second at most. Tens or
     hundreds = a dispatch loop. Then in `actions.log`, **the same `type` repeating
     many times in a short `sinceMs` span is the loop** — and if their `summary`
     tokens also match (e.g. the same object `keys` token set), the loop is hitting
     the same target repeatedly. The repeating `type` names the slice/reducer to fix.
   - Cross-check `environment.documentHidden` / `visibilityState`: a capture right
     after a `visibilitychange` with a paint spike points at the sleep/wake repaint
     path (see the visibility guards in
     `src/components/HexGrid/canvas/HexRenderer.ts`).

3. **Freeze / unresponsive:** if `render.mainPaints.last1s` and `actions` are both
   near zero but the user reports a hang, the loop is likely synchronous (never
   yields to a paint). Use the last `actions.log` entries (highest `t`) for what ran
   last.

4. **Scale / perf:** `app.tileCount` bucket gives rough map size; a `"5001-10000"`
   tile map plus high `mainPaints` suggests a culling/perf issue rather than a logic
   loop. `environment.devicePixelRatio` + `screen`/`window` sizes matter for
   canvas-sizing bugs.

5. **Context:** `app.route` (`/` or `/help` plain; `/map/<token>` = a map open),
   `app.mapId` (null = unsaved example).

## What it cannot tell you

- No map content, names, coordinates, or exact quantities — anonymised by design.
- No stack traces or console errors — correlate with what the user saw in DevTools.
- Only the last 60 s, capped at 8000 actions / 8000 paint samples per canvas; older
  activity is pruned. A loop running far longer still shows in the retained window.

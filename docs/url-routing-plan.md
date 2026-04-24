# URL Routing Plan

## Goals

- Every screen and help section has a distinct, bookmarkable URL.
- Browser back/forward navigate correctly between screens.
- Deep linking works: pasting a URL opens the right screen directly.
- Map URLs are human-readable (include the map name as a slug).
- Shareable URLs: anyone with the URL can open the app at the right place.
- "Not found" and "map not found" errors are handled gracefully.

---

## Technology

**React Router v6** (`react-router-dom`).

**Source of truth: the URL.** React Router reads the URL on load and renders the correct component directly. Navigation becomes `useNavigate()` calls rather than Redux action dispatches. This removes the need for `ui.screen`, `navigateToHelp`, `navigateBackFromHelp`, and `helpReturnScreen` from Redux entirely.

---

## URL Structure

| Route                  | Screen                    | Notes                                          |
| ---------------------- | ------------------------- | ---------------------------------------------- |
| `/`                    | HomeScreen                | Map list, examples                             |
| `/map/example`         | Editor                    | Unsaved example map; no localStorage entry yet |
| `/map/:mapId/:mapSlug` | Editor                    | e.g. `/map/map_abc123/my-fantasy-map`          |
| `/map/:mapId`          | Editor                    | Redirects to canonical form with slug          |
| `/help`                | HelpScreen — grid         |                                                |
| `/help/:section`       | HelpScreen — section open | e.g. `/help/terrain`                           |
| `*`                    | HomeScreen                | Shows "page not found" warning                 |

### Map slug rules

- The slug is derived from the user's map name: lowercase, spaces → hyphens, non-alphanumeric stripped. E.g. `"My Fantasy Map!"` → `my-fantasy-map`.
- A `slugify(name: string): string` utility will be added to `src/utils/`.
- The **map ID** is always the authoritative identifier. The slug is decorative and canonical only.
- On load: if the slug in the URL does not match the stored map name, silently redirect to the canonical URL (do not show an error). This handles renamed maps gracefully.
- When the user renames a map inside the editor, the URL is silently **replaced** (not pushed) so the address bar updates without adding a new history entry.
- If the map ID is not found in localStorage, redirect to `/` with a "map not found" warning.

### Unique map names

Two maps with the same name would produce the same slug, making their URLs indistinguishable. To prevent this, **map names must be unique** across all saved maps.

- `createMap` and `renameMap` in `mapsStorage.ts` will enforce uniqueness by checking all existing names (case-insensitively) before saving.
- If the name is already taken, the operation returns an error signal (e.g. `{ ok: false, reason: 'nameTaken' }`) rather than throwing.
- The UI surfaces this inline — the rename input in the Toolbar and the new-map flow on HomeScreen will show a validation message without leaving the current screen.
- Example maps are exempt — they live at `/map/example` and are never written to the index, so their names cannot collide with saved maps. On first save the app navigates to `/map/:mapId/:mapSlug`.
- Slugs that differ only by special characters (e.g. `"My Map"` and `"My Map!"` both produce `my-map`) are treated as the same name at the **slug level** but are distinct names at the storage level. To avoid this ambiguity, uniqueness is enforced on the **slug** of the name, not the raw name string. This means `"My Map"` and `"My Map!"` cannot coexist.

---

## Error Handling

Both errors are communicated via React Router **location state** — a short-lived value passed during navigation that the HomeScreen reads on mount and clears immediately.

```ts
// Navigating with a warning
navigate('/', { state: { warning: 'mapNotFound' } });
navigate('/', { state: { warning: 'pageNotFound' } });
```

HomeScreen reads `location.state?.warning` and renders the appropriate banner. Two distinct messages:

- **Map not found** — "That map could not be found. It may have been deleted or the link may be broken."
- **Page not found** — "That page does not exist."

---

## Redux Changes

### Removed from `uiSlice`

| Item                          | Replacement               |
| ----------------------------- | ------------------------- |
| `ui.screen`                   | URL / React Router routes |
| `ui.helpReturnScreen`         | Browser history           |
| `navigateToHelp` action       | `navigate('/help')`       |
| `navigateBackFromHelp` action | `navigate(-1)`            |

### Unchanged in Redux

`currentMap.id` and `currentMap.name` remain in Redux — they are still needed by `useLocalStorageSync`, `Toolbar`, page title logic, and thumbnail capture. On editor load, the route params are used to load the map data and then dispatch `loadMap({ id, name })` as today.

---

## Base Path & GitHub Pages

The app is deployed to GitHub Pages at `https://CherrySprinkles2.github.io/hex-map-tool`. GitHub Pages serves the app from the `/hex-map-tool/` subpath.

### Approach: `basename` from `PUBLIC_URL`

React Router is configured using the `PUBLIC_URL` environment variable, which CRA sets from `package.json`'s `homepage` field at build time:

```tsx
<BrowserRouter basename={process.env.PUBLIC_URL}>
```

This means:

- Routes are written as `/`, `/map/:mapId/:mapSlug`, etc. — no hardcoded `/hex-map-tool/` anywhere in the app code.
- In development (`npm start`), `PUBLIC_URL` is empty so routes resolve from `/`.
- In production, `PUBLIC_URL` is `/hex-map-tool` so the router correctly prefixes all routes.
- If the app is later moved to a custom domain at root, just remove the `homepage` field from `package.json`. No app code changes needed.

### GitHub Pages SPA caveat

GitHub Pages returns a 404 for any path it doesn't know about (e.g. a user directly navigates to `/hex-map-tool/map/abc123/my-map`). The standard fix is a custom `404.html` that redirects back to the SPA entry point, passing the original path via query string.

A `public/404.html` shim will be added to the repo. On a 404, GitHub Pages serves this file; it encodes the original path and redirects to `index.html`, which React Router then reads and navigates to the correct route.

---

## Help Section IDs

The `HelpSectionId` type already defines the valid section names (`overview`, `canvas`, `terrain`, etc.). These map directly to the `:section` URL param. An invalid section value (e.g. `/help/nonexistent`) redirects to `/help`.

---

## Implementation Steps

1. **Install React Router v6**: `npm install react-router-dom`.

2. **Add `slugify` utility** in `src/utils/slugify.ts`.

3. **Enforce unique map names** — update `createMap` and `renameMap` in `mapsStorage.ts` to check for slug-level uniqueness before writing. Update the Toolbar rename input and the HomeScreen new-map card to handle and display the `nameTaken` error.

4. **Wrap the app** — replace the current screen-switching logic in `App.tsx` with a `<BrowserRouter>` + `<Routes>` tree.

5. **Create route components**:
   - `EditorRoute` — reads `:mapId` and `:mapSlug` from params, loads the map, handles not-found redirect.
   - `HelpRoute` — reads optional `:section` param, validates it, handles invalid section redirect.

6. **Replace Redux navigation** — remove `ui.screen`, `helpReturnScreen`, and the four navigation actions from `uiSlice`. Update all call sites to use `useNavigate()`.

7. **Update `Toolbar`** — "Back" button uses `navigate(-1)` or `navigate('/')`. "Help" button uses `navigate('/help')`.

8. **Update `HomeScreen`** — map cards link to `/map/:mapId/:mapSlug`. Read `location.state` for warning banners.

9. **Update `HelpScreen`** — section grid cards link to `/help/:section`. Back/prev/next buttons use `navigate()`.

10. **Live slug replacement** — in the `EditorRoute`, watch `currentMap.name` and call `navigate(canonicalUrl, { replace: true })` whenever the name changes so the address bar stays in sync without polluting history.

11. **Update page title** — `useEffect` watching `location.pathname` and `currentMap.name` instead of `ui.screen`.

12. **Add `public/404.html`** — GitHub Pages SPA redirect shim.

13. **Update Playwright tests** — tests currently navigate by dispatching Redux actions or clicking buttons. After routing lands, navigation happens via URL changes; update `Editor.page.ts` and other page helpers accordingly. Note that some Playwright tests may be failing due to previous changes of refactoring from svg to canvas based rendering. Please fix these as part of this step.

14. Add a playwright test that checks that a map deeplink successfully opens the map editor.

---

## Decisions

- **Live slug updates** — when a user renames a map inside the editor, the URL is silently replaced (not pushed) so the history entry stays clean and the address bar reflects the new name immediately.
- **Example map URL** — unsaved example maps use `/map/example` until the first tile/army/faction change triggers a save, at which point the app navigates to the canonical `/map/:mapId/:mapSlug` URL.
- **Duplicate name handling** — the UI blocks the save entirely with an inline validation message. No auto-suggestion of alternative names.

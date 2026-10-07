# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, then clean up. Run `npx ng test --no-watch` after each one.

## 1. Favorites page

- [x] 1.1 Test, then list favorites: with `[7,3,9]` saved (`MemoryStorage` as `LOCAL_STORAGE`, `provideRouter([])`), `/favorites`:
  - shows the heading "Favorites";
  - shows 3 `app-photo-card` tiles inside `app-photo-grid`, each with a filled heart.
- [x] 1.2 Test, then newest first: the tiles' alt texts are "Photo 9", "Photo 3", "Photo 7".
- [x] 1.3 Test, then links:
  - each tile is an `<a>` with `href="/photos/{id}"`;
  - the page has no toggle buttons.
- [x] 1.4 Test, then priority: with 8 favorites saved, the first 6 images have `fetchpriority="high"` and the 7th does not.
- [x] 1.5 Test, then the empty state: with nothing saved, the page shows "No favorites yet", the hint, and a link to `/` ("Browse photos"), and there is no `app-photo-grid`.
- [x] 1.6 Test, then live updates: with the page open and empty, `Favorites.toggle(42)` makes the tile for photo `42` appear and the empty state disappear.

## 2. Route integration

- [x] 2.1 Test, then add a `/favorites` integration test in `src/app/app.routes.spec.ts` with saved favorites `[7,3]`:
  - the links are `/photos/3` and then `/photos/7`;
  - activating the first one lands on `PhotoDetailPage` at `/photos/3`;
  - the favorites are unchanged.
- [x] 2.2 Test, then empty-state navigation: with nothing saved, activating "Browse photos" on `/favorites` lands on `PhotosPage` at `/`.

## 3. Verify

- [x] 3.1 Run the full suite (`npx ng test --no-watch`) and confirm it is green. Confirm `npx ng lint` is clean and `npx prettier --check` is clean on the files this change touches.
- [x] 3.2 Browser check with Chrome DevTools:
  - add three favorites on `/`, then open Favorites: they show newest first, with filled hearts, and the Favorites header button is highlighted;
  - a tile opens `/photos/{id}`;
  - a refresh on `/favorites` keeps the list;
  - with storage cleared, the empty state shows and its link goes to Photos;
  - keyboard Tab reaches every tile with a visible focus ring;
  - screenshots at 1280 and 390 px;
  - no console errors or warnings (including NG0295x image warnings);
  - the axe/Lighthouse accessibility audit has no failures in both states.
- [x] 3.3 `openspec validate add-favorites-page --strict` passes.

## Workflow follow-up

- Show the change to the user for review. Commit only when asked: `feat:` with its tests, and `docs:` for this change's artifacts.
- Archive the change with `/opsx:archive` after the review.

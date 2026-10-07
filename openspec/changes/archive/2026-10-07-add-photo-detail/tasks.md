# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, then clean up. Run `npx ng test --no-watch` after each one.

## 1. Remove a favorite

- [x] 1.1 Test, then add `Favorites.remove(id)`: with `[7,3,9]` saved, `remove(3)` makes `ids()` `[7, 9]` and the storage hold `"[7,9]"`.
- [x] 1.2 Test, then no-op: `remove(42)` for a photo that is not a favorite leaves `ids()` as it was.

## 2. Route guard

- [x] 2.1 Test, then add `favoritePhotoGuard` (`src/app/features/photo-detail/favorite-photo.guard.ts`, a `CanMatchFn`): in an injection context with `42` saved, the segments `photos/42` give `true`.
- [x] 2.2 Test, then reject what is not a favorite: segments `photos/43` (not saved) give `false`.
- [x] 2.3 Test, then reject invalid IDs: `photos/abc`, `photos/1.5`, `photos/-1` and segments with no ID give `false`.

## 3. Photo detail page

- [x] 3.1 Test, then replace the placeholder `PhotoDetailPage`: for `/photos/42` (test routes, `42` saved), the page shows the heading "Photo 42" and an image with `src` ending `https://picsum.photos/id/42/1200/800`, the alt text "Photo 42" and `fetchpriority="high"`.
- [x] 3.2 Test, then add the Remove button: a "Remove from favorites" button is shown below the image.
- [x] 3.3 Test, then removal: activating the button makes `42` no longer a favorite, the router URL `/favorites`, and a snackbar "Photo 42 removed from favorites" (`MatSnackBarHarness`).
- [x] 3.4 Test, then a failed image: after the image `error` event the page shows "Photo unavailable" instead of the image, and the button is still shown and still removes the favorite.
- [x] 3.5 Test, then follow the URL: navigating from `/photos/42` to `/photos/7` (both saved) shows "Photo 7" and the new image URL without creating a new component.
- [x] 3.6 Add the page styles (centered image, width cap, max height, centered button, unavailable message). Verified in task 5.2.

## 4. Routes

- [x] 4.1 Update the existing detail-page route test in `src/app/app.routes.spec.ts`: save `42` as a favorite first (the requirement changed), still expect `PhotoDetailPage`. Run it and confirm it fails before the guard is added to the route.
- [x] 4.2 Test, then add the guard to the `photos/:id` route in `src/app/app.routes.ts` as `canMatch`, and confirm the test passes. Test that `/photos/42` for a non-favorite shows `NotFoundPage` and that the URL stays `/photos/42`.
- [x] 4.3 Test, then invalid IDs: `/photos/abc` and `/photos/1.5` show `NotFoundPage`.
- [x] 4.4 Integration test of the flow: with `[7,3]` saved, open `/favorites`, activate the tile for photo `3`, see the detail page for `3` with the header's Favorites button highlighted (`aria-current="page"`), activate Remove, land on `/favorites` with one tile (photo `7`), and going Back to `/photos/3` shows `NotFoundPage`.

## 5. Verify

- [x] 5.1 Run the full suite (`npx ng test --no-watch`) and confirm it is green. Confirm `npx ng lint` is clean and `npx prettier --check` is clean on the files this change touches.
- [x] 5.2 Browser check with Chrome DevTools:
  - add favorites on `/`, open Favorites, and open one: the large photo fits the viewport, the Remove button is centered below it, and the Favorites header button is highlighted;
  - Remove: the app returns to `/favorites`, the photo is gone, and the snackbar shows;
  - Back to the removed photo shows the not-found page;
  - opening `/photos/999` and `/photos/abc` directly shows the not-found page;
  - at 390 px there is no horizontal scroll;
  - no console errors or warnings (including image warnings and a LCP priority warning);
  - the axe/Lighthouse accessibility audit has no failures on the detail page.
- [x] 5.3 `openspec validate add-photo-detail --strict` passes.

## Workflow follow-up

- Show the change to the user for review. Commit only when asked: `feat:` with its tests, and `docs:` for this change's artifacts.
- Archive the change with `/opsx:archive` after the review.

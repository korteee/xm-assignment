# Proposal

## Why

Favorites can now be added on `/` and are saved in the browser, but `/favorites` is still a placeholder heading. The brief needs a list of all favorite photos there, where clicking a photo opens its single photo page.

## What Changes

- Replace the placeholder `FavoritesPage` with a page titled "Favorites" that lists every favorite photo in the shared photo grid, newest first. There is no infinite scroll.
- Each tile is a link to `/photos/{id}` (the card's link mode) and shows a filled heart.
- The first 6 tiles load with priority, as on `/`.
- When there are no favorites, the page shows "No favorites yet" and a short hint, with a link to Photos (`/`) instead of an empty grid.
- The list follows the favorites store live, so it is always current when the user arrives from `/` or (later) from the detail page.

Out of scope:

- The detail page at `/photos/:id`, "Remove from favorites", and the not-found handling for non-favorite IDs (`add-photo-detail`). The link target already exists as a placeholder route.
- Removing or reordering favorites from this page.
- Paging or infinite scroll for long favorite lists.

## Capabilities

### New Capabilities

- `favorites-page`: the `/favorites` page, which covers the list of favorite photos, its order, its links to the photo page, and its empty state.

### Modified Capabilities

None. The `favorites` store already keeps IDs oldest first. The page reverses them for display.

## Impact

- Changed: `src/app/features/favorites/favorites-page.ts`, plus a new spec for it. `src/app/app.routes.spec.ts` gains an integration test for `/favorites`.
- Reuses `PhotoGrid`, `PhotoCard` (link mode), `MatButton` and `RouterLink`. No new dependencies.

# Proposal

## Why

The brief's core action on `/` is "clicking a photo adds it to Favorites", and favorites must survive a page refresh. The photo cards already show a heart and emit a toggle request, but nothing stores the favorite yet. This change adds the favorites store and wires it to the Photos page, so the next two steps (the Favorites page and the photo detail page) can read from it.

## What Changes

- Add a root-scoped favorites store that keeps the favorite photo IDs in a signal, in the order they were added, and persists them in `localStorage` under one versioned key.
- Read the stored value defensively: a missing, unreadable, malformed or wrongly shaped value gives an empty list instead of an error. A failed write keeps the in-memory list.
- Provide `localStorage` through an injection token, so tests can give an in-memory storage.
- On `/`, activating a tile toggles that photo's favorite, the tile's heart fills or empties, and the button's pressed state follows.
- A `MatSnackBar` confirms each add and remove ("Photo 42 added to favorites" / "Photo 42 removed from favorites"), with no action, for 3 seconds.

Out of scope:

- The Favorites page list (`add-favorites-page`) and the detail page with "Remove from favorites" (`add-photo-detail`). This change adds no `remove(id)` API until a page needs it.
- An "Undo" action in the snackbar.
- Syncing favorites between open tabs (`storage` event).
- Storing anything beyond the photo ID (for example the time it was added).

## Capabilities

### New Capabilities

- `favorites`: the favorite photo IDs, their order, how they persist in `localStorage`, and how bad stored data is handled.

### Modified Capabilities

- `photostream`: tiles on `/` toggle the favorite, show its state, and confirm each change with a snackbar.

## Impact

- New: `src/app/core/local-storage.ts` (token), `src/app/core/favorites.ts` (store) and their specs.
- Changed: `src/app/features/photos/photos-page.ts` and its spec (bind `favorite`, handle `toggleFavorite`, open the snackbar).
- Uses `@angular/material/snack-bar` (already installed with Angular Material). No new dependencies.

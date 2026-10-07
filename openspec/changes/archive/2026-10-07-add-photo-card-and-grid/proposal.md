# Proposal

## Why

The Photos page and the Favorites page both show photos as a grid of square tiles with a heart. The detail-page link, the favorite toggle, the broken-image placeholder and the responsive columns should be built and tested once, in shared components, so the feature pages stay thin.

## What Changes

- Add a shared **photo card**: one square tile that shows a photo by ID (`photoUrl` at a small grid size), with alt text and a heart indicator (filled when the photo is a favorite, outlined when not).
- The card works in two modes, chosen by the page:
  - **Toggle mode** (Photos page): the tile is a `<button>`. Activating it asks to toggle the favorite; the button exposes its state with `aria-pressed`.
  - **Link mode** (Favorites page): the tile is an `<a>` to a URL the page gives (the detail page).
- The page can mark a card as priority so its image loads first (the tiles on screen at load, which are the page's largest content).
- When the image fails to load, the card shows a "Photo unavailable" placeholder. In toggle mode it then cannot be favorited (`aria-disabled`, activation does nothing).
- Add a shared **photo grid**: a list of cards in 3 columns on desktop, 2 on tablet and 1 on phone, with square tiles.
- Load the Material Symbols font with its fill axis so the heart can be filled or outlined.

Out of scope: loading photos, infinite scroll, the loader, storing favorites and the snackbar. The Photos and Favorites pages start using the card and grid in their own changes; until then nothing renders them in the app.

## Capabilities

### New Capabilities

- `photo-card`: one photo tile: image and alt text, heart indicator, toggle mode, link mode, broken-image placeholder, visible focus.
- `photo-grid`: the responsive grid of tiles and its list semantics.

### Modified Capabilities

None.

## Impact

- Code: new `src/app/shared/photo-card/` and `src/app/shared/photo-grid/`, each with a spec.
- `src/index.html`: the Material Symbols font link changes to the variable font with the `FILL` axis.
- Uses `photoUrl` and `Photo` from `src/app/core/photo.ts`.
- Dependencies: none new (`NgOptimizedImage` is in `@angular/common`, `MatIcon` in Angular Material).

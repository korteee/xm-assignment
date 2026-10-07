# Proposal

## Why

`/` is still a placeholder. The pieces for the photostream exist (fake photo API, card, grid, infinite-scroll directive) but nothing ties them together, keeps the loaded photos, or tells the user what is happening while a page loads, fails or runs out.

## What Changes

- Add a root-scoped **photo stream** service that holds the loaded photos and the stream status (idle, loading, error, end) in signals. It loads the next page of 18 from the photo API, allows one request at a time, and keeps the photos when the user leaves `/` and comes back.
- Replace the Photos page placeholder with the real page: the photo grid of cards in toggle mode, a sentinel with the infinite-scroll directive after it, and a status area below the grid.
- While a page loads, show a skeleton: 18 placeholder tiles in the grid, the size of the page that is coming, with a shimmer that stops for users who prefer reduced motion. Announce "Loading photos" through an `aria-live` region. This replaces the wireframe's circular "Loading..." indicator; the brief only asks that a loader is shown.
- When a page fails, show "Couldn't load photos." and a **Retry** button that loads the same page again.
- When the stream runs out, show and announce "You've seen them all" and stop asking for more.
- Mark the first 6 tiles as priority so the first screen loads first.

Out of scope: toggling favorites and the snackbar (change `add-favorites`). Until then the hearts on `/` are all outlined and activating a tile does nothing.

## Capabilities

### New Capabilities

- `photostream`: the Photos page behavior: first load, loading more on scroll, one request at a time, loader, error and retry, end of the stream, and keeping the loaded photos across navigation.

### Modified Capabilities

None. The page uses `photo-api`, `photo-card`, `photo-grid` and `infinite-scroll` as they are specified.

## Impact

- Code: new `src/app/core/photo-stream.ts` (+ spec); `src/app/features/photos/photos-page.ts` replaced (+ spec); `src/app/app.routes.spec.ts` gains an integration test for `/`.
- Uses `MatButton` for Retry. The skeleton is plain CSS; Angular Material has no skeleton component.
- Dependencies: none new.

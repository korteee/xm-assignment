# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, clean up. Run `npx ng test --no-watch` after each.

## 1. Photo card: image and heart

- [x] 1.1 Test then add `PhotoCard` (`src/app/shared/photo-card/`) with a required `photo` input: it renders an image with `ngSrc` `https://picsum.photos/id/42/400/400` and alt "Photo 42", and the host has `role="listitem"`.
- [x] 1.2 Test then add the `favorite` input and the heart: a `mat-icon` with `aria-hidden="true"` that has the `filled` class when `favorite` is true and not when it is false.

## 2. Photo card: modes

- [x] 2.1 Test then add toggle mode: without `link` the tile is a `<button type="button">`; clicking it emits `toggleFavorite` with the photo; `aria-pressed` is `"true"` or `"false"` from `favorite`.
- [x] 2.2 Test then add link mode: with `link` set to `/photos/42` the tile is an `<a>` with that `href`, there is no button, clicking it navigates to `/photos/42` (`provideRouter` with a stub route), and no `toggleFavorite` is emitted.

## 3. Photo card: broken image

- [x] 3.1 Test then show the placeholder: after an `error` event on the image, no image is rendered and the tile shows "Photo unavailable" with an accessible name "Photo 86 unavailable".
- [x] 3.2 Test then block toggling a broken photo: in toggle mode after an `error` event, the button has `aria-disabled="true"`, is still focusable (not natively disabled), and clicking it emits nothing.

## 3b. Photo card: priority

- [x] 3.3 Test then add the `priority` input: with `priority` true the image has `fetchpriority="high"` and `loading="eager"`; by default it has `loading="lazy"`.

## 4. Photo grid

- [x] 4.1 Test then add `PhotoGrid` (`src/app/shared/photo-grid/`): the host has `role="list"` and projected `app-photo-card` elements render inside it as list items.
- [x] 4.2 Add the grid and card styles: 3/2/1 columns at 960 px and 600 px, 8 px gap, square tiles with `object-fit: cover`, heart on a scrim in a corner, `:focus-visible` outline; switch `src/index.html` to the Material Symbols variable font with the `FILL` axis. Verified in task 5.2.

## 5. Verify

- [x] 5.1 Full suite green (`npx ng test --no-watch`), `npx ng lint` clean, `npx prettier --check` clean on the files this change touches.
- [x] 5.2 Browser check with Chrome DevTools, using a temporary, uncommitted edit that renders page 1 of the photo API in a grid on the Photos page (some tiles favorite, one tile in link mode): screenshots at 1280, 768 and 390 px show 3, 2 and 1 square columns and no horizontal scroll; filled and outlined hearts are visible; a broken ID (for example 86) shows the placeholder; keyboard focus is visible; no console errors or `NgOptimizedImage` warnings; axe/Lighthouse accessibility audit has no failures. Revert the temporary edit afterwards.
- [x] 5.3 `openspec validate add-photo-card-and-grid --strict` passes.

## Workflow follow-up

- Show the change to the user for review; commit only when asked (`feat:` with its tests, `docs:` for this change's artifacts).
- Archive the change with `/opsx:archive` after the review.

# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, clean up. Run `npx ng test --no-watch` after each.

## 1. Photo stream service

- [x] 1.1 Test then add `PhotoStream` (`src/app/core/photo-stream.ts`, `@Service()`) with readonly `photos` and `status`: it starts with no photos and status `idle`; `loadNext()` sets `loading` and requests page 1 with limit 18 (fake `PhotoApi` returning a `Subject`); when the page arrives the photos are stored and status is `idle`.
- [x] 1.2 Test then append pages: a second `loadNext()` requests page 2 and appends its photos after page 1.
- [x] 1.3 Test then allow one request at a time: `loadNext()` while `loading` makes no request.
- [x] 1.4 Test then handle errors: a failed request sets `error` and keeps the photos; the next `loadNext()` requests the same page again and on success sets `idle`.
- [x] 1.5 Test then handle the end: an empty page sets `end`, and `loadNext()` after that makes no request.

## 2. Photos page

- [x] 2.1 Test then replace the placeholder `PhotosPage`: with the real `PhotoStream`, a fake `PhotoApi` and a stubbed `IntersectionObserver`, a `loadMore` from the sentinel loads page 1 and the page renders 18 `app-photo-card` tiles inside `app-photo-grid`, in toggle mode (buttons).
- [x] 2.2 Test then disable the sentinel unless the stream is `idle`: while loading, after an error and at the end, a sentinel report does not start a request.
- [x] 2.3 Test then add the loading skeleton: while loading, the grid ends with 18 `.skeleton` tiles with `aria-hidden="true"` and the `role="status"` region contains "Loading photos"; after the page arrives the skeleton tiles are gone and 18 photo tiles are shown.
- [x] 2.4 Test then add error and retry: after a failed request the status region shows "Couldn't load photos." and a Retry button; activating Retry requests the same page, and on success the photos show and the message is gone.
- [x] 2.5 Test then add the end message: after an empty page the status region shows "You've seen them all".
- [x] 2.6 Test then mark priority: the first 6 tiles' images have `fetchpriority="high"` and the 7th does not.
- [x] 2.7 Add page styles: skeleton tiles square with the card's radius and a shimmer that is off under `prefers-reduced-motion: reduce`; status area centered under the grid; visually hidden text for the live region. Verified in task 3.3.

## 3. Integration and verify

- [x] 3.1 Test then add the route integration test in `src/app/app.routes.spec.ts`: on `/`, with fake timers, a stubbed `IntersectionObserver` reporting the sentinel in range, and the real `PhotoApi`, 18 photo tiles render after 300 ms; navigating to `/favorites` and back to `/` shows the same photo IDs without a new page-1 request.
- [x] 3.2 Full suite green (`npx ng test --no-watch`), `npx ng lint` clean, `npx prettier --check` clean on the files this change touches.
- [x] 3.3 Browser check with Chrome DevTools on `/`: the first page appears and the screen fills; scrolling loads more with the skeleton visible and replaced in place by photos; with reduced motion emulated the skeleton does not animate; Photos → Favorites → Back keeps the photos and the scroll position; screenshots at 1280 and 390 px; no console errors or warnings; axe/Lighthouse accessibility audit has no failures. Check the error state by temporarily making the fake API fail once (uncommitted edit, reverted afterwards).
- [x] 3.4 `openspec validate add-photostream-page --strict` passes.

## Workflow follow-up

- Show the change to the user for review; commit only when asked (`feat:` with its tests, `docs:` for this change's artifacts).
- Archive the change with `/opsx:archive` after the review.

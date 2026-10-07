# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, clean up. Run `npx ng test --no-watch` after each. Tests replace `IntersectionObserver` with a fake through `vi.stubGlobal` and restore it with `vi.unstubAllGlobals()`.

## 1. Observe the sentinel

- [x] 1.1 Test then add `InfiniteScroll` (`src/app/shared/infinite-scroll/infinite-scroll.ts`, selector `[appInfiniteScroll]`): after render it creates one observer with `rootMargin` `'0px 0px 300px 0px'` and observes the host element.
- [x] 1.2 Test then emit `loadMore` when the fake observer reports the element as intersecting; it does not emit when it reports not intersecting, and does not emit a second time while the element stays in range.

## 2. Disabled and refill

- [x] 2.1 Test then add the `loadMoreDisabled` input: while it is true, an intersecting report does not emit.
- [x] 2.2 Test then refill the screen: disabled, element in range, then enabled → emits once; disabled, element leaves range, then enabled → does not emit.

## 3. Cleanup

- [x] 3.1 Test then disconnect the observer when the host is destroyed, and check that a later intersecting report emits nothing.
- [x] 3.2 Refactor with the suite green: JSDoc on the directive, its input and output; the margin as a named constant; a comment on why the emit lives in an effect.

## 4. Verify

- [x] 4.1 Full suite green (`npx ng test --no-watch`), `npx ng lint` clean, `npx prettier --check` clean on the files this change touches.
- [x] 4.2 Browser check with Chrome DevTools, using a temporary, uncommitted edit on the Photos page (a tall block, a sentinel with the directive, and a counter of `loadMore` events): scrolling to about 300 px above the sentinel increments the counter once; no console errors. Revert the temporary edit afterwards.
- [x] 4.3 `openspec validate add-infinite-scroll-directive --strict` passes.

## Workflow follow-up

- Show the change to the user for review; commit only when asked (`feat:` with its tests, `docs:` for this change's artifacts).
- Archive the change with `/opsx:archive` after the review.

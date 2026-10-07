# Design

## Context

`src/app/shared/` holds the header, card and grid. Nothing loads more photos yet. CLAUDE.md fixes the approach: a reusable directive on `IntersectionObserver`, a sentinel at the bottom of the grid, a `rootMargin` of about 300 px, ignoring triggers while a load is in flight, and a mocked `IntersectionObserver` in tests. See proposal.md for scope and the spec for behavior.

## Goals / Non-Goals

**Goals:**

- A directive with one job: emit when the sentinel is near and the page is ready for more.
- No timing tricks: every emit follows from the sentinel's position and the page's disabled flag.

**Non-Goals:**

- Knowing about pages, loaders or errors. The page owns that state and passes one boolean.
- A custom scroll container. The document scrolls (change `add-app-shell`), so the observer uses the viewport as its root.

## Decisions

**Directive API.** Selector `[appInfiniteScroll]`, output `loadMore` (no payload) and input `loadMoreDisabled` (default `false`). The page writes `<div appInfiniteScroll [loadMoreDisabled]="busy()" (loadMore)="next()"></div>` after the grid. The input name avoids a plain `disabled`, which would clash with native and Material `disabled` on other elements. Alternative: pass a callback input. Rejected: an output is the Angular way to signal an event upward and keeps the directive free of page logic.

**Two signals and one effect.** The observer callback only writes `inRange` (a signal) from `entry.isIntersecting`. One `effect` reads `inRange()` and `loadMoreDisabled()` and emits when both say "go" (in range and enabled), with the emit wrapped in `untracked`. This one rule covers all four spec cases:

- entering the range while enabled → `inRange` turns true → emit;
- staying in range → no signal changes → no emit;
- entering while disabled → no emit; when the page enables it again while still in range → `loadMoreDisabled` turns false → emit (fill the screen);
- leaving the range → `inRange` turns false → no emit.

Alternative: emit directly in the observer callback and re-check in an effect on `loadMoreDisabled`. Rejected: two code paths for the same rule.

**Create the observer after render.** `afterNextRender` creates `new IntersectionObserver(callback, { rootMargin: '0px 0px 300px 0px' })` and observes the host element. It runs only in the browser and only once the element is in the DOM. The bottom-only margin starts loading 300 px before the sentinel scrolls into view, without reacting to content above. Alternative: create it in the constructor. Rejected: the element may not be attached yet, and the constructor also runs where there is no `IntersectionObserver`.

**Cleanup through `DestroyRef`.** `inject(DestroyRef).onDestroy(() => observer?.disconnect())`, so leaving the page stops all callbacks.

**Tests with a fake observer.** `vi.stubGlobal('IntersectionObserver', FakeObserver)` with a fake that records its callback, options and observed element, and lets the test call the callback with `{ isIntersecting }` entries. `vi.unstubAllGlobals()` runs after each test. A small host component puts the directive on a `<div>` and binds `loadMoreDisabled` and `loadMore`. `fixture.whenStable()` flushes `afterNextRender` and the effect.

## Risks / Trade-offs

- [The effect runs after change detection, not synchronously in the observer callback] → An emit can come one tick later. The page reacts to an output either way, and the tests wait with `whenStable()`.
- [Emitting from an effect is unusual] → It is wrapped in `untracked` so the output handler cannot add signal dependencies to the effect; the comment explains why the emit lives there.
- [A browser without `IntersectionObserver` would never load more] → All supported browsers have it; the directive does not add a scroll-event fallback.

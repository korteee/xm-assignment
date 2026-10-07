# Design

## Context

`PhotoApi.getPhotos({ page, limit })` gives pages after a 200-300 ms delay and an empty page at the end. `PhotoCard` and `PhotoGrid` render tiles, and `appInfiniteScroll` emits `loadMore` near the end unless `loadMoreDisabled` is set. The Photos page is a placeholder. Router scroll restoration is on. See proposal.md for scope and the spec for behavior.

## Goals / Non-Goals

**Goals:**

- Stream state that outlives the page component, so Photos → Favorites → Photos shows the same photos.
- A page component that only wires state to the template.

**Non-Goals:**

- Favorites and the snackbar (change `add-favorites`).
- Cancelling a request when the user leaves `/`. The state is root-scoped, so a finished request still belongs in it.

## Decisions

**A root `PhotoStream` service owns the state.** `src/app/core/photo-stream.ts`, `@Service()`. Private writable signals `photos` (`Photo[]`) and `status` (`'idle' | 'loading' | 'error' | 'end'`), exposed with `asReadonly()`; a private `nextPage` counter starting at 1. One method, `loadNext()`:

- does nothing unless `status` is `idle` or `error` (one request at a time, nothing after the end);
- sets `loading` and subscribes to `getPhotos({ page: nextPage, limit: 18 })`;
- on a non-empty page: appends the photos, increments `nextPage`, sets `idle`;
- on an empty page: sets `end`;
- on error: sets `error` and keeps `nextPage`, so the next call retries the same page.

Retry is just `loadNext()` from the `error` state. Alternative: `rxResource`. Rejected: a resource replaces its value when its params change, and the stream has to append. Alternative: keep the state in the page component. Rejected: it would be lost on every navigation, and CLAUDE.md asks for a root-scoped signal.

**The sentinel starts the first load.** The page does not call `loadNext()` in its constructor. With no photos the sentinel sits right under the header, inside the 300 px range, so the directive emits and the first page loads; the directive's refill rule then keeps loading until the screen is full. When the user comes back to `/` with photos loaded, the sentinel is far below, so nothing loads. Alternative: call `loadNext()` when the page opens with an empty stream. Rejected: two ways to start loading for one rule.

**Template.**

```html
<h1>Photos</h1>
<app-photo-grid>
  @for (photo of stream.photos(); track photo.id; let i = $index) {
  <app-photo-card [photo]="photo" [priority]="i < 6" />
  } @if (stream.status() === 'loading') { @for (n of skeletons; track n) {
  <div class="skeleton" aria-hidden="true"></div>
  } }
</app-photo-grid>
<div
  appInfiniteScroll
  [loadMoreDisabled]="stream.status() !== 'idle'"
  (loadMore)="stream.loadNext()"
></div>
<div class="status" role="status">
  <!-- polite live region, always present -->
  @switch (stream.status()) { loading: visually hidden "Loading photos"; error: "Couldn't load
  photos." + Retry button; end: "You've seen them all" }
</div>
```

`role="status"` is a polite live region, so changing its content announces it. It stays in the DOM and only its content changes, which screen readers need to notice an update. While loading it holds only visually hidden text, because the skeleton is the visible loader. The Retry button calls `stream.loadNext()`. The status area is centered under the grid.

**Skeleton tiles instead of a spinner.** Chosen with the user over the wireframe's circular "Loading..." indicator; the brief only asks that a loader is shown. While `status` is `loading`, the page renders 18 skeleton tiles (the page size) inside the grid after the loaded photos, so the photos that arrive take exactly their place and nothing below them jumps. Each is a plain `<div class="skeleton" aria-hidden="true">` with `aspect-ratio: 1`, the card's border radius and a `--mat-sys-surface-container-high` background with a moving highlight. `aria-hidden` keeps them out of the grid's list, so a screen reader counts only real photos; the live region carries the announcement. Under `@media (prefers-reduced-motion: reduce)` the animation is off. The skeleton lives in the page, not in `shared/`, because only the Photos page loads in pages. The skeleton also keeps loads from chaining: while a page loads, its 18 tiles push the sentinel out of range, so when the photos take their place the sentinel is still out of range and the refill rule does not fire a second request by mistake. Alternative: Material progress spinner. Rejected by the user. Alternative: a `loading` mode on `PhotoCard`. Rejected: a card always has a photo; a skeleton has none.

**Priority for the first 6 tiles.** Found in change `add-photo-card-and-grid`: at 1280 by 900 the second row is visible on load and can be the LCP element, so the first two desktop rows are marked. The value is fixed per card at creation (`NgOptimizedImage` reads it once), which `@for` with `track photo.id` guarantees.

**Tests.**

- `PhotoStream`: `PhotoApi` is replaced by a fake whose `getPhotos` returns `Subject`s the test completes or errors, so each state is reached on demand without timers. Each test gets a fresh `TestBed`, so the root service starts empty.
- Photos page: a fake `PhotoStream` would duplicate logic, so the page test uses the real stream with the fake `PhotoApi`, and stubs `IntersectionObserver` (as in the directive test) to trigger `loadMore`.
- Route integration: `RouterTestingHarness` on `/` with the real `PhotoApi` checks that photos appear after the delay. Only `setInterval`/`clearInterval` are faked (RxJS `timer` uses them); faking all timers also freezes Angular's scheduler and `whenStable()` never resolves.
- Test fakes (`FakeIntersectionObserver`, `FakePhotoApi`) live in `src/app/testing/`, shared by the directive, stream, page and route specs, and excluded from the app build in `tsconfig.app.json`.

## Risks / Trade-offs

- [The first load depends on `IntersectionObserver` firing for the sentinel] → It fires once on observe with the current intersection, which is in range on an empty page. The route integration test covers the start-up path.
- [18 skeleton tiles make a long column on phones while a page loads] → Accepted: it is exactly the space the photos will take, so nothing shifts when they arrive.
- [Scroll restoration on Back runs before tiles have their final height] → Tiles are square from CSS (`aspect-ratio`), so their height is known before images load, and the photos are already in memory when the page is shown again.
- [1085 IDs at 18 per page is about 61 pages; the stream can grow large] → Accepted: all supported browsers handle a few hundred tiles; images lazy-load.

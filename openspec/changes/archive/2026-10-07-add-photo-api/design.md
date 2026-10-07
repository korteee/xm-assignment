# Design

## Context

There is no `src/app/core/` yet. CLAUDE.md puts singleton services there and asks for the fake API to return an `Observable<Photo[]>` delayed by 200-300 ms. Decisions already made: IDs come from 0 to 1084 (taken from picsum's own list endpoint `https://picsum.photos/v2/list`, which returns IDs 0 to 1084 with 92 gaps; the gaps are handled by the card), the stream does not repeat IDs, and it ends with an empty page. See proposal.md for scope and the spec for behavior.

## Goals / Non-Goals

**Goals:**

- A small service the photostream page can call page by page, with the same contract a real API would have.
- Tests that need no real waiting and no real randomness.

**Non-Goals:**

- Error simulation. The API never fails for a valid request; the retry state in the photostream page is tested with a faked failing service.
- Caching or stream state. The page-slice design needs no cache, and the loaded photos live in the photostream change.

## Decisions

**A page is a slice of one shuffled ID list.** When the service is created it builds `[0..1084]` and shuffles it (Fisher-Yates with `Math.random`). `getPhotos({ page, limit })` returns `order.slice((page - 1) * limit, page * limit)` as `Photo[]`. This gives "no repeats", "same page twice is the same" and "empty past the end" with no state besides the list, so retrying a page is safe. Alternative: pick random IDs per request and remember the used ones. Rejected: it needs mutable state, a retried request would return different photos, and it is harder to prove that nothing repeats.

**The stream is meant to use one `limit`.** Pages are slices by position, so mixing different limits would overlap. The app uses a fixed page size of 18; the spec states the guarantee only for one limit. Alternative: track a cursor instead of a page number. Rejected: CLAUDE.md fixes a page-based `getPhotos({ page, limit })`.

**Delay with `defer` + `timer`.** `defer(() => timer(randomDelay()).pipe(map(() => slice)))`. `defer` runs its factory on every subscription, so each request draws its own delay and the delay starts when the caller subscribes. `timer(ms)` emits once and completes, so no `take(1)` is needed. The delay is `200 + Math.floor(Math.random() * 101)`, which gives whole milliseconds from 200 to 300 inclusive. Alternative: `of(photos).pipe(delay(ms))` with the delay chosen when the method is called. Rejected: calling twice on one observable would reuse the delay, and a request that is never subscribed would still pick one.

**Invalid arguments fail inside `defer`.** RxJS turns an error thrown in the `defer` factory into an error notification, so the check can live in the factory and the method never throws when called. Alternative: validate before returning the observable and throw. Rejected: callers would need both `try/catch` and `catchError`.

**Service and model.** The service uses `@Service()` (Angular 22's shorthand for a root singleton) and no constructor injection. `src/app/core/photo.ts` holds `interface Photo { readonly id: number }` `interface PhotoUrlParams { id; width; height }` and `photoUrl(params: PhotoUrlParams)`; `src/app/core/photo-api.ts` holds `PhotoApi` and `interface GetPhotosParams { page; limit }`; both functions take one typed params object, so call sites read `getPhotos({ page: 1, limit: 18 })` and cannot swap two numbers by mistake. `Photo` is an object, not a bare number, so later changes can add fields (for example alt text) without changing every signature. The ID range is a named constant, not a repeated literal.

**Tests use fake timers and a stubbed `Math.random`.** Vitest `vi.useFakeTimers()` and `vi.advanceTimersByTime()` control the RxJS `timer`, which is built on `setInterval`; `vi.spyOn(Math, 'random')` makes the delay and the shuffle predictable. Real timers are restored in `afterEach`.

## Risks / Trade-offs

- [Random draws are shared: the shuffle and the delay both use `Math.random`, so stubbing it changes both] → The delay tests build the service first and stub `Math.random` afterwards; the shuffle tests do not care about the delay.
- [1085 photos is the whole stream; a user who scrolls through all of it hits the end] → That is intended (spec: end of the stream). The photostream change shows "You've seen them all".
- [A broken photo ID is served like any other] → The card shows a placeholder and cannot be favorited (change `add-photo-card-and-grid`).

# Design

## Context

- `PhotoDetailPage` is a placeholder that reads `id` from `ActivatedRoute.snapshot`. The route `photos/:id` has `data: { section: 'favorites' }`, so the header already highlights Favorites. A catch-all `**` route shows `NotFoundPage`.
- `Favorites` has `has(id)` and `toggle(id)` and saves after each change. The favorites page links tiles to `/photos/{id}`.
- `PhotosPage` already opens the add/remove snackbar for toggles. `photoUrl({ id, width, height })` builds picsum URLs.
- Context7 (Angular router API): a `CanMatchFn` that returns `false` makes the router skip that route and keep matching the next ones; with a `**` route after it, the path then lands on the not-found page and the URL is not changed. Returning a `UrlTree` would redirect instead.
- Context7 (Angular image optimization): `NgOptimizedImage` takes `priority` for an LCP image and `width`/`height` for a fixed-size image, with `sizes` for responsive srcsets. `priority` is read once, so it must be set before the first render (already known from NG02953).

## Goals / Non-Goals

**Goals:**

- Only favorites have a detail page, decided by the router, so the page itself never has to handle "not a favorite".
- A thin page: one image, one button.

**Non-Goals:**

- Adding to favorites from this page, next/previous, focus management after navigation.

## Decisions

### 1. A `canMatch` guard sends non-favorites to the not-found route

`favoritePhotoGuard: CanMatchFn` on the `photos/:id` route. It reads the ID from the matched URL segments (`segments[1].path`; `canMatch` runs before the params exist), accepts only `/^\d+$/`, and returns `inject(Favorites).has(Number(id))`. When it returns `false`, the router continues to `**` and renders `NotFoundPage`.

- **Why:** the "not found" behavior reuses the existing page and route, keeps the URL as typed (the brief says "if the ID is not a current favorite or is invalid, show the not-found page"), and the detail component can assume a valid favorite.
- **Alternatives rejected:**
  - `canActivate` returning a `UrlTree` to a not-found URL: it changes the URL, and there is no such URL.
  - The component rendering `NotFoundPage` inline when `!has(id)`: it duplicates the route table's job, and after removing the photo the component would flash not-found before the navigation to `/favorites` completes.
- Segment shape: for `path: 'photos/:id'` the guard gets `[photos, 42]`. A path with extra segments does not match this route at all.
- `canMatch` runs again on every navigation to this URL, so going Back to a removed photo gives not-found (spec). A guard does not re-run while the user stays on the page, so removing the photo there does not turn the current page into not-found.
- The guard lives in `src/app/features/photo-detail/favorite-photo.guard.ts` next to the page. The route file imports it statically, which is a few lines of code and not a page.
- **Header on not-found:** the `**` route has no `section`, so no header button is highlighted. That is correct for a page that does not exist.

### 2. Page reads the ID from the route reactively

`id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => Number(p.get('id')))))`, typed as `Signal<number>` with `{ requireSync: true }`. The router reuses the component when only `:id` changes, which a one-time snapshot would miss. Because of the guard, the value is always a whole number of a favorite.

- `photo = computed(() => ({ id: id() }))` is not needed. The page only needs the ID for the URL, the alt text and the heading.
- `src = computed(() => photoUrl({ id: id(), width: 1200, height: 800 }))`.

### 3. Image

```html
<img [ngSrc]="src()" width="1200" height="800" priority [alt]="alt()" (error)="broken.set(true)" />
```

- Fixed 1200x800 intrinsic size, so the browser reserves space and avoids layout shift. CSS: `width: 100%; height: auto; max-height: calc(100dvh - 11rem); object-fit: contain`. Width is capped by `max-width: 1200px` and centered. The photo is cropped to 3:2 by picsum, so `contain` never letterboxes in practice and only guards against the max-height.
- `priority`: it is the only image and the LCP. A single image never changes `priority` after render, so no NG02953.
- `sizes`: omitted. For fixed-size images `NgOptimizedImage` uses density descriptors only with a custom loader, and picsum does not offer resizing through the default loader. One 1200 px image is what the brief asks for ("about 1200px wide").
- On failure: `broken = linkedSignal({ source: this.id, computation: () => false })`, then `@if (broken()) { <p class="unavailable" role="img" [attr.aria-label]="alt() + ' unavailable'">Photo unavailable</p> }`, the same pattern as the card. The picsum gaps (86, 97, 105, ...) cannot be favorited from `/`, but a hand-edited storage value can hold any whole number.

### 4. Remove flow and `Favorites.remove`

- Add `remove(id: number): void` to `Favorites`: it filters the ID out and saves, and does nothing if the photo is not a favorite (no write, no signal change). `toggle` stays for the Photos page.
- The page's `remove()` calls `favorites.remove(id)`, then `router.navigateByUrl('/favorites')`, then opens the snackbar `Photo {id} removed from favorites` with a 3 second duration (the same shape as `PhotosPage`). The snackbar is opened right after the navigation is started and lives in the global overlay, so it survives the route change.
- Order: remove first, then navigate. If the user presses the button twice quickly, the second call finds nothing to remove and the navigation is idempotent. The snackbar still opens twice, and the second replaces the first (the MatSnackBar default).
- The button: `<button matButton="filled" type="button">Remove from favorites</button>`, centered with flex.

### 5. Tests

- **`Favorites` spec:** two `remove` tests (removes and saves; no-op for a non-favorite).
- **Guard spec:** run in an injection context with `MemoryStorage`: true for a saved ID, false for an unsaved ID, false for `abc`, `1.5`, `-1`, and for an empty segment list.
- **`PhotoDetailPage` spec:** `provideRouter` with a test route table (`photos/:id` → page, `favorites` → a stub, no guard, so the page is tested alone), `MemoryStorage`, `MATERIAL_ANIMATIONS` off, and the snackbar harness. It asserts the heading, the image URL and alt, the button, removal + URL + snackbar, the failed image, and a changed `:id`.
- **`app.routes.spec.ts`:** the old detail test (`/photos/42` with no favorite) now fails by design. Change it to save the favorite first (the requirement changed). Add: not-found for a non-favorite (URL kept) and invalid IDs; the full flow Favorites → tile → Remove → `/favorites` without the tile; Back to the removed photo gives not-found; the header keeps Favorites highlighted on the detail page.

## Risks / Trade-offs

- **Guard reads the favorites at navigation time only.** If another tab changes favorites, an open detail page stays. Accepted (cross-tab sync is out of scope everywhere).
- **Focus after Remove.** The button disappears with the page, and focus falls back to the document. The snackbar announces the result, but focus is not placed on the new page's heading. Left for the polish step as a site-wide router focus fix.
- **Back button after Remove** lands on not-found. That is what the brief implies and it is spelled out in the spec.

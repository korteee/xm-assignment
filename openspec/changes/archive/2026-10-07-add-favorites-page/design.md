# Design

## Context

- `FavoritesPage` (`src/app/features/favorites/favorites-page.ts`) is a placeholder `<h1>Favorites</h1>` on the lazy `/favorites` route, which has `section: 'favorites'` route data for the header highlight.
- `Favorites` (root store) exposes `ids: Signal<readonly number[]>`, oldest first, restored from `localStorage` when it is created.
- `PhotoCard` has link mode: given `link`, it renders `<a [routerLink]>` labeled by the image alt text and never emits `toggleFavorite`. `favorite` fills the heart, and `priority` must be set before the first render (NG02953).
- `NotFoundPage` already uses the pattern "message + `<a matButton="filled" routerLink="/">`", which the empty state can follow.
- Context7 (Angular routing testing guide): `RouterTestingHarness.navigateByUrl(url, Component)` returns the routed component and `routeNativeElement` exposes its DOM. Clicking a `routerLink` anchor and then `fixture.whenStable()` navigates, and `Router.url` shows the result. This is the pattern `app.routes.spec.ts` already uses.

## Goals / Non-Goals

**Goals:**

- A thin page that reuses the shared grid and card. No new shared components.
- The order and the empty state are derived from the store, so the page has no state of its own.

**Non-Goals:**

- Changing the `Favorites` store API.
- The detail page, and removing favorites.

## Decisions

### 1. Newest first is a page `computed`, not a store API

`protected readonly photos = computed(() => [...this.favorites.ids()].reverse().map((id) => ({ id })))`.

- **Why:** only this page needs the order. The detail page (step 8) only asks `has(id)`. Keeping the store oldest-first matches the stored format.
- **Alternative rejected:** `Favorites.newestFirst`. It would widen the store for a single reader.
- The computed copies before it reverses (`reverse()` mutates), and it maps IDs to `Photo` objects for the card's `photo` input.
- `@for` tracks by `photo.id`, so a new object per recompute does not re-create DOM.

### 2. Tiles in link mode

`<app-photo-card [photo]="photo" [link]="'/photos/' + photo.id" [favorite]="true" [priority]="i < priorityCount" />`.

- `favorite` is always `true` here: every tile on this page is a favorite. The heart stays decorative, and link mode does not expose a pressed state, so the visual just matches `/`.
- `priorityCount = 6` is the same as `PhotosPage`. It is a small duplication of a constant. It is not extracted, because the two pages may diverge and it is a single number. If it is still shared after step 8, extract it then.
- A string concatenation in the template, rather than a helper, because it is one expression.

### 3. Empty state

```html
@if (photos().length) { <app-photo-grid>…</app-photo-grid> } @else {
<p>No favorites yet</p>
<p>Select a photo on the Photos page to add it here.</p>
<a matButton="filled" routerLink="/">Browse photos</a>
}
```

- No grid when empty. An empty `role="list"` would be announced as "list, 0 items", which is noise.
- The heading "Favorites" stays in both states, so the page always has its `<h1>`.
- The copy is an assumption (the brief does not specify it). It is kept short and says "Select" rather than "Tap"/"Click", which is device-neutral. The link text is "Browse photos", which is distinct from the header's "Photos" link so screen reader link lists are not ambiguous.

### 4. Tests

- **`favorites-page.spec.ts`:**
  - provide `LOCAL_STORAGE` with a `MemoryStorage` arranged before `TestBed.createComponent`, plus `provideRouter([])` for `routerLink`;
  - assert the tile count, the order (alt texts), `href="/photos/{id}"`, the filled hearts, `fetchpriority` on the first 6 tiles, and the empty-state text and link;
  - check that the list updates when `Favorites.toggle` is called while the page is open (live).
- **`app.routes.spec.ts` (integration for `/favorites`):**
  - with saved favorites `[7,3]`, navigate to `/favorites` and expect links to `/photos/3` and then `/photos/7`;
  - clicking the first tile lands on `PhotoDetailPage` with `/photos/3`;
  - the empty state's link goes to `/`;
  - the `/` integration test stays as it is.

## Risks / Trade-offs

- **The whole list renders at once.** It has at most 1085 tiles, and images below the fold are lazy (NgOptimizedImage), so DOM size is the only cost. Accepted, since the brief says no infinite scroll here.
- **The detail page is still a placeholder.** Following a tile lands on "Photo {id}" until step 8. This is acceptable for one step.

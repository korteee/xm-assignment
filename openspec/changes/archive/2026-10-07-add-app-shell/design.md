# Design

## Context

The app is the Angular starter: `App` renders a placeholder page, `routes` is empty, and `provideRouter` has no options. Angular Material 3 and the Roboto font are already set up, but the theme is light (`color-scheme: light`). See proposal.md for scope and the specs for behavior.

## Goals / Non-Goals

**Goals:**

- A frame that later changes plug pages into without touching the header or the route setup again.
- Every behavior in the two specs is testable through the DOM and the router.

**Non-Goals:**

- Real page content, data, or state. The Photos, Favorites and detail pages are placeholders.
- Detail-page ID validation. That belongs to the `add-photo-detail` change.

## Decisions

**Header is its own component in `shared/`.** `src/app/shared/app-header/` holds the header; `App` only renders `<app-header />` and `<router-outlet />`. This keeps `App` thin and lets the header be tested without the whole app. Alternative: put the buttons in `app.html`. Rejected: it mixes shell layout with navigation logic.

**Buttons are real links.** Each button is an `<a matButton>` (the current Material button directive, not the old `mat-button` attribute) with `routerLink`, so it works with middle-click and keyboard like any link. Active state uses `routerLinkActive` with `ariaCurrentWhenActive="page"`, which gives both the highlight class and `aria-current`. Alternative: `<button>` plus `router.navigate`. Rejected: it is not a link, so it loses native link behavior.

**Detail page keeps Favorites active through route data.** `routerLinkActive` only matches the link's own URL, so `/photos/:id` would highlight nothing. The detail route carries `data: { section: 'favorites' }`, and the header reads the section of the current route and sets the active button from it, for all routes. Alternative: match the URL prefix `/photos` in the header. Rejected: it hard-codes route paths in the header; route data keeps the knowledge in the route table.

**Lazy routes with `loadComponent`.** Each page is a standalone component loaded with `loadComponent: () => import(...)`. A wildcard `**` route at the end loads the not-found page. The route table stays flat. Alternative: `loadChildren` per feature. Rejected: each feature has one page, so child route files add nothing yet.

**Scroll restoration through the router.** `provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }))`. With `'enabled'` the router restores the saved position on back/forward and goes to `[0, 0]` on a new navigation, which is what the spec asks for. This only works when the document is the scroll container, so the header is `position: sticky` and the content is not wrapped in an element with its own scrollbar.

**Dark theme in global styles.** `theme-type: dark` goes inside the `color` map of `mat.theme` (not at the top level), and `color-scheme: dark` goes on `html`/`body`, replacing the light setting and the comment about following system settings. Setting `theme-type` alone would leave `color-scheme` on `light` and native controls and scrollbars would stay light. Colors come only from Material system variables, so the contrast is that of the M3 dark palette.

**Folders.** Placeholder pages go in `src/app/features/photos/`, `favorites/`, `photo-detail/` and `not-found/`, each holding one component (`PhotosPage`, `FavoritesPage`, `PhotoDetailPage`, `NotFoundPage`), matching the structure in CLAUDE.md.

**Tests use the real router.** Route tests use `RouterTestingHarness` with the real route table (`provideRouter(routes)`) and `navigateByUrl`; the router is never mocked, following the Angular routing testing guide.

## Risks / Trade-offs

- [Scroll restoration on an infinite list: the page can be too short to scroll back to when it is restored] → The stream state lives in a root service (change `add-photostream-page`), so the content exists when the page is shown again. Until then the placeholder pages are short and the behavior is covered by a router-level test only.
- [Placeholder pages are thrown away later] → They are one-line components. The route table and lazy loading are the lasting part.
- [Material button highlight may not reach contrast AA in the dark theme] → Checked with an axe audit in the verify task; use a tonal or outlined state if it fails.

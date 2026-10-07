# Proposal

## Why

The repo still holds the default Angular starter page. Every later feature (photostream, favorites, detail) needs a place to live: a header that stays on every page, routes for each view, and the dark Material 3 theme. Building this frame first lets each later change plug in a page and be demoed on its own.

## What Changes

- Replace the starter page in the root component with the app shell: a header with **Photos** and **Favorites** buttons and a router outlet below it. The button of the current view is highlighted. The header stays on every page, including the detail page and the not-found page.
- Add lazy-loaded routes: `/` (Photos), `/favorites` (Favorites), `/photos/:id` (photo detail), and a wildcard route to a not-found page.
- Add thin placeholder pages for Photos, Favorites and photo detail. They only show a heading. Later changes fill them.
- Add a not-found page that is complete: a message and a link back to Photos.
- Enable router scroll position restoration.
- Switch the theme from light to one fixed dark Material 3 theme. No theme toggle.
- Remove the starter template and its spec.

Out of scope: photo data, grid, infinite scroll, favorites state, snackbars, and any real content on the three feature pages.

## Capabilities

### New Capabilities

- `app-shell`: the header with Photos/Favorites navigation and active-view highlight, which stays on every page, and the fixed dark theme.
- `app-routing`: the route table (`/`, `/favorites`, `/photos/:id`, unknown paths), lazy loading of each page, the not-found page, and scroll position restoration.

### Modified Capabilities

None.

## Impact

- Code: `src/app/app.ts`, `app.html`, `app.scss`, `app.routes.ts`, `app.config.ts`, `app.spec.ts`; new folders `src/app/features/{photos,favorites,photo-detail,not-found}/`.
- Styles: `src/styles.scss` (dark color scheme).
- Dependencies: none new. Angular Material is already installed.
- Later changes depend on this one: they replace the placeholder pages.

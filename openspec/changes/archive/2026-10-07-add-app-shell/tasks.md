# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, clean up. Run `npx ng test --no-watch` after each.

## 1. Clear the starter

- [x] 1.1 Replace the starter spec and template: `App` renders only `<router-outlet />`; the test "creates the app" passes and the "Hello" test and the starter markup are gone.

## 2. Routes and lazy pages

- [x] 2.1 Test then add the `/` route: with the router harness, navigating to `/` renders the Photos placeholder page (`PhotosPage`, lazy loaded with `loadComponent`).
- [x] 2.2 Test then add `/favorites`: navigating there renders `FavoritesPage`.
- [x] 2.3 Test then add `/photos/:id`: navigating to `/photos/42` renders `PhotoDetailPage`, and the page can read the `id` param.
- [x] 2.4 Test then add the `**` route: navigating to `/does-not-exist` renders `NotFoundPage` with the text "page does not exist" and a link to `/`; activating the link navigates to `/`.
- [x] 2.5 Verify lazy loading: `npx ng build` output lists separate lazy chunks for the four pages, and none of them is in the initial bundle.

## 3. Header

- [x] 3.1 Test then add `AppHeader` with a Photos link (`/`) and a Favorites link (`/favorites`) as `<a matButton>` Material buttons; the test finds both links by name and checks their `href`.
- [x] 3.2 Test then highlight the active view: on `/` Photos has the active class and `aria-current="page"` and Favorites does not; on `/favorites` it is the other way round.
- [x] 3.3 Test then keep Favorites active on `/photos/:id` through route `data: { section: 'favorites' }`; on an unknown path no button is active.
- [x] 3.4 Test then render `<app-header />` in `App` above the outlet; at app level the header is present on `/`, `/favorites`, `/photos/42` and an unknown path.

## 4. Theme and layout

- [x] 4.1 Switch to the fixed dark theme in `src/styles.scss` (`theme-type: dark` inside the `color` map of `mat.theme`, plus `color-scheme: dark`); verify in the browser that the page is dark when the system is set to light, and that no theme toggle exists.
- [x] 4.2 Make the header `position: sticky` and keep the document as the scroll container; style the header and the not-found page with Material system variables; verify visually at desktop and phone width.

## 5. Scroll restoration

- [x] 5.1 Test then add `withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })` in `app.config.ts`; the test provides the app config, spies on `ViewportScroller.scrollToPosition`, and checks that a new navigation scrolls to `[0, 0]` and a back navigation restores the saved position; a manual browser check shows a long page returns to its position after Back.

## 6. Verify

- [x] 6.1 Full suite green (`npx ng test --no-watch`), `npx ng lint` clean, `npx prettier --check` clean on the files this change touches (older files such as `CLAUDE.md`, `tsconfig*.json` and `src/main.ts` fail it already and are left for a separate `chore:` commit).
- [x] 6.2 Browser check with Chrome DevTools: screenshots of `/`, `/favorites`, `/photos/1` and an unknown path; no console errors; axe/Lighthouse accessibility audit has no failures, including color contrast of the active button.
- [x] 6.3 `openspec validate add-app-shell --strict` passes.

## Workflow follow-up

- Show the change to the user for review; commit only when asked (`feat:` with its tests, `docs:` for this change's artifacts).
- Archive the change with `/opsx:archive` after the review.

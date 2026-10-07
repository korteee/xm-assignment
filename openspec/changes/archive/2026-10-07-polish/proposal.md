# Proposal

## Why

All the pages of the brief now work. What is left is what a reviewer meets first: the README is still the Angular CLI boilerplate, every page has the title "XmAssignment", the only failing Lighthouse audit is the missing meta description (SEO 75-80), and `prettier --check` fails on Windows checkouts.

## What Changes

- **Page titles:** each route sets its own document title, so the browser tab, history and screen readers say where the user is: "Photos", "Favorites", "Photo {id}" and "Page not found", each followed by " | Photo Library". The first-load title in `index.html` becomes "Photo Library".
- **Meta description:** `index.html` gets a one-sentence `<meta name="description">`.
- **README:** replace the boilerplate with how to run the project locally: the Node versions, install, serve, test, lint and build commands. Architecture notes stay in CLAUDE.md.
- **Line endings and format:** add a `.gitattributes` that checks files out with LF, so Windows checkouts match the committed files and `prettier --check` stops failing on files that are already clean. Format the four committed files Prettier would still change (`src/main.ts`, `tsconfig.spec.json` and the `favorites` and `photostream` main specs).

Out of scope:

- Moving keyboard focus to the page after a navigation. Angular has no built-in for it, and it is a separate behavior with its own risk (it must not fight scroll restoration or the infinite scroll). It can be its own change if wanted.
- Per-page meta descriptions, social share tags, and a custom favicon.
- `ASSIGNMENT.md` (the brief) and the archived OpenSpec changes, which keep their text as written.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-routing`: adds the page titles.
- `app-shell`: adds the page description and the first-load title.

## Impact

- Changed: `src/app/app.routes.ts` (titles) with tests in `src/app/app.routes.spec.ts`, `src/index.html`, `README.md`, a new `.gitattributes`, and formatting-only edits to four files.
- No new dependencies, and no change to any page's behavior.

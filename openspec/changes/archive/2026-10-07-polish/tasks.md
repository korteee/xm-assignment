# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, then clean up. Run `npx ng test --no-watch` after each one.

## 1. Page titles

- [x] 1.1 Test, then set titles on the static routes in `src/app/app.routes.spec.ts` (real routes, `Title` service): `/` gives "Photos | Photo Library" and `/favorites` gives "Favorites | Photo Library".
- [x] 1.2 Test, then the photo page title: with `42` saved, `/photos/42` gives "Photo 42 | Photo Library" (a `ResolveFn` that reads `id`).
- [x] 1.3 Test, then follow the ID: with `42` and `7` saved, going from `/photos/42` to `/photos/7` gives "Photo 7 | Photo Library".
- [x] 1.4 Test, then the not-found title: `/does-not-exist` and `/photos/42` (not a favorite) give "Page not found | Photo Library".

## 2. Page description

- [x] 2.1 Red: run a Lighthouse audit on `/` and confirm "Document has a meta description" fails. Then add `<meta name="description" content="...">` and the title "Photo Library" to `src/index.html` and confirm the audit passes (no unit test for static HTML; see the design).

## 3. README and line endings

- [x] 3.1 Replace `README.md` with the short run-locally guide from the design.
- [x] 3.2 Add `.gitattributes` (`* text=auto eol=lf`), renormalize the working tree (`git add --renormalize .`), and confirm `git status` shows no content changes besides the new file.
- [x] 3.3 Format the four really unformatted files with Prettier (`src/main.ts`, `tsconfig.spec.json`, `openspec/specs/favorites/spec.md`, `openspec/specs/photostream/spec.md`).

## 4. Verify

- [x] 4.1 Run the full suite (`npx ng test --no-watch`) and confirm it is green. Confirm `npx ng lint` is clean and `npx prettier --check src openspec/specs README.md *.json` reports no files.
- [x] 4.2 Follow the README from a clean clone in a temp folder (`npm install`, `npx ng build`, `npx ng test --no-watch`) and confirm each command works as written.
- [x] 4.3 Browser check with Chrome DevTools: the tab title changes across Photos, Favorites, a photo page and a not-found URL; Lighthouse SEO is 100 on `/`; Accessibility and Best Practices stay 100; no console errors or warnings.
- [x] 4.4 `openspec validate polish --strict` passes.

## Workflow follow-up

- Show the change to the user for review; commit only when asked: `feat:` for titles and description with their tests, `docs:` for the README, `chore:` for the line endings and formatting, then `docs:` for the spec and archive.
- Archive the change with `/opsx:archive` after the review.

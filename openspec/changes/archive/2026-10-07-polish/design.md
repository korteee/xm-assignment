# Design

## Context

- Every page today has the title "XmAssignment" from `index.html`. Lighthouse on `/`, `/favorites` and the detail page gives Accessibility 100, Best Practices 100 and SEO 75-80. The one failing audit is the missing meta description.
- `README.md` is the Angular CLI boilerplate. CLAUDE.md says the README only explains how to run the project locally.
- `prettier --check .` reports 42 files on this machine. For the source files this is a line-ending artifact: Git has `core.autocrlf=true`, so the working copy is CRLF while the committed files are LF, and Prettier's default `endOfLine` is `lf`. Checking the committed (LF) content shows only 5 files that Prettier would really change, and one of them is the brief (`ASSIGNMENT.md`).
- Docs consulted in Context7 (Angular): routes take a `title` that the router applies on every activation, as a string or a `ResolveFn`; `TitleStrategy` is the hook for a shared format; the `Meta` service manages `<meta>` tags at runtime.

## Goals / Non-Goals

**Goals:**

- A distinct, accurate title per page and a meta description.
- A README that gets a reviewer from clone to a running app and a green test suite.
- `prettier --check` that means the same thing on every machine.

**Non-Goals:**

- Focus management after navigation, per-page descriptions, social tags, a favicon (see the proposal).
- Reformatting the brief or the archived changes.

## Decisions

**1. Titles come from the route `title` property, in `app.routes.ts`.**
It is the built-in mechanism: no service, no subscription, and it keeps the title next to the route it belongs to. The detail route uses a `ResolveFn` that reads the `:id` param, so the title follows the ID. A route's resolvers run again when a param changes, which is the "Photo 42" to "Photo 7" scenario.
_Alternative:_ a `TitleStrategy` subclass that appends " | Photo Library" in one place. Better if there were many routes; with four, the suffix repeated in four strings is less code than a class and a provider. If routes grow, the strategy is the next step.

**2. The meta description is a static tag in `index.html`, not set with `Meta` at runtime.**
The description is the same for every page, so there is nothing to compute. Static HTML is also present before any script runs, which is what crawlers and link unfurlers read. The `Meta` service would add runtime code to produce the same tag later.
_Test note:_ Vitest here runs components, not `index.html`, so this one has no unit test. Its red-green is the Lighthouse audit "Document has a meta description", which fails now and must pass after, and it is checked in the browser task. This is the only change in this plan that is verified that way.

**3. The first-load title becomes "Photo Library".**
The router replaces it on the first navigation, but the static value is what shows before the app starts and in the description scenario of the spec.

**4. A `.gitattributes` with `* text=auto eol=lf` fixes the line endings.**
The cause is Git converting to CRLF on Windows checkout, so the fix belongs in Git, not in a Prettier option. With `endOfLine: auto` in `.prettierrc` the check would pass, but the files would stay CRLF locally and LF in the repository, and the next `git diff` would still warn about it. The attribute makes a fresh checkout LF everywhere. Existing working copies are CRLF until they are re-checked out, so the task renormalizes the working tree.

**5. Only the files that are really unformatted are rewritten.**
The four listed in the proposal. Rewriting 42 files would be noise in the history and in review, and most of the 42 are not wrong.

**6. README content.**
Short: what the app is (one line), requirements (Node 22.22.3+ or 24.15+, which CLAUDE.md states), then install, serve, test, lint and build with the real commands (`npm install`, `npx ng serve`, `npx ng test --no-watch`, `npx ng lint`, `npx ng build`), and the URL. No architecture notes, as CLAUDE.md says. The commands are checked by running them in the verify task.

## Risks / Trade-offs

- **`.gitattributes` renormalizes line endings once.** If Git sees files whose committed content has CRLF it would show them as changed. The committed `photo-stream.ts` and others are LF (checked with `git ls-files --eol`), so the expected diff is empty; the task confirms that with `git status` before committing.
- **The title text is part of the spec.** The wording is my assumption (the brief gives none) and is easy to change in one place.
- **The meta description has no unit test** (decision 2). The Lighthouse audit is a real, repeatable check, but it is not in the suite.

# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, then clean up. Run `npx ng test --no-watch` after each one.

## 1. Local storage token

- [x] 1.1 Test, then add `LOCAL_STORAGE` (`src/app/core/local-storage.ts`): a root `InjectionToken<Storage | null>` whose factory returns `window.localStorage`.
- [x] 1.2 Test, then return `null` when the `window.localStorage` getter throws (stub it with `vi.spyOn(window, 'localStorage', 'get')`).

## 2. Favorites store

- [x] 2.1 Add the test helper `MemoryStorage` (`src/app/testing/memory-storage.ts`), an in-memory `Storage`.
- [x] 2.2 Test, then add `Favorites` (`src/app/core/favorites.ts`, `@Service()`):
  - it starts with no favorites when nothing is stored;
  - `toggle(42)` returns `true`, after which `has(42)` is true and `ids()` is `[42]`.
- [x] 2.3 Test, then removal: toggling a favorite returns `false` and removes it.
- [x] 2.4 Test, then order:
  - adding `7`, `3`, `9` gives `[7, 3, 9]`;
  - removing `7` and adding it again gives `[3, 9, 7]`.
- [x] 2.5 Test, then persistence: after `toggle(42)`, the storage holds `"[42]"` under `xm-photo-library.favorites.v1`.
- [x] 2.6 Test, then restore: with `[7,3]` stored before the store is created, `ids()` is `[7, 3]` and `has(3)` is true.
- [x] 2.7 Test, then defensive parsing. The store starts empty, without throwing, when the stored value is:
  - not JSON (`not json`);
  - not an array (`{"ids":[1]}`);
  - an array with something other than a whole number of 0 or more (`[1,"2"]`, `[1.5]`, `[-1]`).

  The stored value `[7,3,7]` gives `[7, 3]`.

- [x] 2.8 Test, then storage unavailable:
  - with `getItem` throwing, the store starts empty;
  - with `setItem` throwing, `toggle(42)` does not throw and `has(42)` is true;
  - with `LOCAL_STORAGE` `null`, the store starts empty and toggles still work.

## 3. Photos page wiring

- [x] 3.1 Update the `PhotosPage` spec setup:
  - provide `LOCAL_STORAGE` with a `MemoryStorage`;
  - provide `MATERIAL_ANIMATIONS` with animations disabled;
  - create a harness loader from the document root.

  Run the existing tests and confirm they are still green.

- [x] 3.2 Test, then toggle from the stream:
  - clicking the tile for photo `100` makes it `aria-pressed="true"` with a filled heart, and the storage holds `[100]`;
  - clicking it again makes it `aria-pressed="false"`.
- [x] 3.3 Test, then show stored favorites: with `[101]` stored before the page is created, the tile for photo `101` is `aria-pressed="true"` when the page shows.
- [x] 3.4 Test, then confirm with a snackbar:
  - adding photo `100` shows "Photo 100 added to favorites" (`MatSnackBarHarness.getMessage()`) with no action;
  - removing it shows "Photo 100 removed from favorites".
- [x] 3.5 Test, then check focus: after clicking the tile, `document.activeElement` is still that tile's button.

## 4. Verify

- [x] 4.1 Run the full suite (`npx ng test --no-watch`) and confirm it is green. Confirm `npx ng lint` is clean and `npx prettier --check` is clean on the files this change touches.
- [x] 4.2 Browser check with Chrome DevTools on `/`:
  - clicking a tile fills its heart and shows the snackbar;
  - after a refresh, the heart is still filled;
  - clicking the tile again empties the heart and shows the remove message;
  - Enter and Space toggle a tile that has keyboard focus;
  - no console errors or warnings;
  - the axe/Lighthouse accessibility audit has no failures with the snackbar open;
  - with site data blocked or the key set to garbage, the page still loads.
- [x] 4.3 `openspec validate add-favorites --strict` passes.

## Workflow follow-up

- Show the change to the user for review. Commit only when asked: `feat:` with its tests, and `docs:` for this change's artifacts.
- Archive the change with `/opsx:archive` after the review.

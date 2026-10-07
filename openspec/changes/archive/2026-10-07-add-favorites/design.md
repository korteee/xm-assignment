# Design

## Context

- `PhotoCard` already has a `favorite` input (fills the heart, sets `aria-pressed`) and a `toggleFavorite` output. A broken card never emits it. `PhotosPage` binds neither yet.
- Root state follows one pattern so far: `PhotoStream` is a `@Service()` with a private writable signal and a public `asReadonly()` view.
- Context7 (Angular docs, "Defining dependency providers") shows browser storage provided as an `InjectionToken<Storage>` with a `factory: () => window.localStorage`, which a test can override with `{ provide, useValue }`.
- Context7 (Angular Material snack-bar) shows that `MatSnackBar.open(message, action?, config?)` announces through a polite `aria-live` region by default and does not move focus. It also says not to set a `duration` when there is an action. We have no action, so a duration is fine. `MatSnackBarHarness` (`getMessage()`) with `TestbedHarnessEnvironment.documentRootLoader` and `MATERIAL_ANIMATIONS: { animationsDisabled: true }` is the documented test setup.

## Goals / Non-Goals

**Goals:**

- One source of truth for favorites that later pages (Favorites list, detail page) can read.
- Never crash on bad or unavailable storage.
- Keep the store free of UI: the page shows the snackbar.

**Non-Goals:**

- A `remove(id)` API, the newest-first view, or the Favorites page. They come with the steps that need them.
- Cross-tab sync and snackbar "Undo".

## Decisions

### 1. `LOCAL_STORAGE` injection token, not a storage service

`src/app/core/local-storage.ts` exports `LOCAL_STORAGE = new InjectionToken<Storage | null>(...)` with a root factory that returns `window.localStorage`. If reading the `window.localStorage` getter throws (a `SecurityError` when site data is blocked), it returns `null`.

- Why: the only thing tests need to swap is the `Storage` object. A wrapper service with `get`/`set` would add a layer with no behavior of its own. The token follows the pattern in the Angular DI docs.
- Alternative: a `StorageService` with typed `read(key, guard)`. Rejected for now. Favorites is the only user, so the parsing stays in the favorites store. If a second persisted value appears, extract it then.

### 2. `Favorites` store (`src/app/core/favorites.ts`)

```ts
@Service()
export class Favorites {
  readonly ids: Signal<readonly number[]>; // oldest first
  has(id: number): boolean; // reads a computed Set, so it is reactive in templates
  toggle(id: number): boolean; // true = now a favorite
}
```

- Private `signal<readonly number[]>` holds the IDs. It is initialised in the field initializer from `load()`, so the restore is synchronous and there is no flash of empty hearts.
- `has` reads a `computed(() => new Set(ids))`, which keeps it O(1) for the grid (hundreds of tiles each call it).
- `toggle` updates the signal, then calls `save()` directly. No `effect` is needed: the write is synchronous, has a single call site and is easy to test. An effect would also run a needless write on startup.
- `toggle` takes an ID and not a `Photo`, because the store deals in IDs only. The page passes `photo.id`.

### 3. Storage format and parsing

- Key `xm-photo-library.favorites.v1`. The `.v1` suffix lets a future format use a new key without misreading old data.
- Value: a JSON array of IDs, oldest first, for example `[7,3,9]`.
- `load()`:
  - `try { raw = storage?.getItem(KEY) }`, then `JSON.parse` inside the same `try`;
  - accept only `Array.isArray(v) && v.every(id => Number.isInteger(id) && id >= 0)`;
  - dedupe with `[...new Set(v)]`, which keeps the first position;
  - anything else gives `[]`.
- An invalid value gives an empty list but is not deleted. The next toggle overwrites it. This avoids a write on startup.
- `save()`: `try { storage?.setItem(KEY, JSON.stringify(ids)) } catch {}`, so a write failure leaves the in-memory list as it is (spec: storage unavailable). No upper bound on IDs: the ID range is 0–1084, which is well within the quota.

### 4. Page wiring and snackbar

`PhotosPage`:

- `[favorite]="favorites.has(photo.id)"` and `(toggleFavorite)="toggle($event)"`.
- `toggle(photo)` calls `favorites.toggle(photo.id)`, then `snackBar.open(added ? 'Photo 42 added to favorites' : 'Photo 42 removed from favorites', undefined, { duration: 3000 })`.
- A new snackbar replaces an open one, which is `MatSnackBar`'s default, so fast toggling never stacks messages.
- The message names the photo the same way as the image alt text ("Photo {id}"), so a screen reader user hears which tile changed.
- The page owns the snackbar so the store stays UI-free, and the detail page (step 8) will show its own message after removing.

### 5. Tests

- **`Favorites` spec:**
  - provides `LOCAL_STORAGE` with an in-memory `Storage` (new helper `src/app/testing/memory-storage.ts`). Each test arranges stored data before the first `TestBed.inject(Favorites)`;
  - covers blocked storage with a `Storage` whose `getItem`/`setItem` throw.
- **`LOCAL_STORAGE` spec:**
  - the factory returns `window.localStorage`;
  - with `vi.spyOn(window, 'localStorage', 'get')` throwing, it returns `null`.
- **`PhotosPage` spec:**
  - adds the `LOCAL_STORAGE` memory provider and `MATERIAL_ANIMATIONS` disabled;
  - clicks tile buttons and asserts `aria-pressed`, the stored value, and the snackbar text through `MatSnackBarHarness`;
  - checks that focus stays on the clicked button.

## Risks / Trade-offs

- **The Set rebuilds on every toggle.** It is O(n) for n favorites, at most 1085. Negligible.
- **Different tabs.** Two tabs can overwrite each other's list (last write wins). This is accepted and listed as out of scope.
- **The snackbar sits over the bottom grid row** for 3 seconds on phones. That is the default Material placement. It is short and dismisses itself.

# Design

## Context

`src/app/shared/` holds only the header. `src/app/core/photo.ts` gives `Photo` and `photoUrl({ id, width, height })`. Material Symbols is loaded in `src/index.html` through the static `icon?family=Material+Symbols+Outlined` URL, which has no fill axis. See proposal.md for scope and the two specs for behavior.

## Goals / Non-Goals

**Goals:**

- One card and one grid that both feature pages reuse without passing page logic through them.
- Every card behavior testable through inputs, outputs and the DOM.

**Non-Goals:**

- Knowing what a favorite is. The card gets `favorite` as an input and emits a request; the favorites service (change `add-favorites`) decides.
- Loading, infinite scroll and empty states. They belong to the pages.

## Decisions

**The grid is a layout that projects its cards.** `PhotoGrid` (`app-photo-grid`) has `role="list"` on its host and a CSS grid around `<ng-content />`. The page writes `@for (photo of photos; track photo.id) { <app-photo-card ... /> }` inside it. Alternative: the grid takes `photos`, `favoriteIds` and a link function and renders the cards. Rejected: the grid would have to pass every card input and output through, and the two pages need different ones (toggle versus link). The page also puts the infinite-scroll sentinel after the grid, which projection keeps simple.

**One card, two modes, chosen by a `link` input.** `PhotoCard` (`app-photo-card`, host `role="listitem"`) has inputs `photo` (required), `favorite` (default `false`) and `link` (optional URL), and an output `toggleFavorite` that emits the `Photo`. With `link` it renders `<a [routerLink]>`; without it a `<button type="button">`. Alternative: two components (`PhotoToggleCard`, `PhotoLinkCard`). Rejected: they would repeat the image, heart, placeholder and styles; the only difference is the outer element.

**Pressed and disabled through ARIA.** The button sets `aria-pressed` from `favorite`, so screen readers announce "Photo 42, toggle button, pressed". A broken photo sets `aria-disabled="true"` and the click handler returns early, instead of the native `disabled` attribute, so the tile stays focusable and a keyboard user can still reach it (spec: stays focusable).

**Image through `NgOptimizedImage` in fill mode.** `<img [ngSrc]="url" fill [alt]>` inside a square, `position: relative` box (`aspect-ratio: 1`). Fill mode removes the need for fixed width and height, and `NgOptimizedImage` lazy-loads by default (spec: load near the viewport). The URL is `photoUrl({ id, width: 400, height: 400 })`: picsum crops to a square on its side, and 400 px covers a tile in the 3-column layout at 1x. `sizes` is set to match the columns (`(min-width: 960px) 33vw, (min-width: 600px) 50vw, 100vw`). Alternative: a plain `<img loading="lazy">`. Rejected: CLAUDE.md asks for `NgOptimizedImage`.

**Priority input for the first row.** The card has a `priority` input (default `false`) passed to `NgOptimizedImage`'s `priority`, which makes the image eager with `fetchpriority="high"`. The browser check showed `NG02955`: the first tiles are the page's Largest Contentful Paint, and Angular asks for them to be marked priority. The card cannot know its position, so the page marks every tile that is on screen at load in its own change. The browser check showed one row is not enough: at 1280 by 900 the second row is also visible and can become the LCP element, so the page marks the first 6 tiles (two desktop rows). `NgOptimizedImage` reads `priority` once (changing it later throws NG02953), so pages set it when they create the card, for example from the `@for` index. Alternative: turn the check off with `IMAGE_CONFIG`. Rejected: it hides the warning without making the first row load sooner.

**Broken image as a signal.** An `(error)` handler on the `<img>` sets a `broken` signal. The template then renders `<span role="img" [attr.aria-label]="'Photo ' + id + ' unavailable'">Photo unavailable</span>` instead of the image, so the tile keeps an accessible name that includes the ID.

**Heart is a decorative Material Symbols icon.** `<mat-icon aria-hidden="true" fontIcon="favorite">` with a `filled` class that sets `font-variation-settings: 'FILL' 1`. The state is exposed by `aria-pressed` (toggle mode); on the Favorites page every tile is a favorite, so the link name needs no state. The heart sits in a corner on a small scrim (`--mat-sys-scrim` at low opacity) so it stays visible on light photos. `src/index.html` also preconnects to `picsum.photos` and `fastly.picsum.photos` (Angular warns NG02956 without it for priority images), and switches to `css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`, which is the variable font with the fill axis; `<mat-icon>` already defaults to Material Symbols. Alternative: the legacy Material Icons `favorite` / `favorite_border` glyphs. Rejected: a second icon font for one icon.

**Columns by media query, square tiles by `aspect-ratio`.** `grid-template-columns: repeat(3, 1fr)` at `min-width: 960px`, `repeat(2, 1fr)` at `min-width: 600px`, else `1fr`, with an 8 px gap. Tiles are `aspect-ratio: 1` and the image uses `object-fit: cover`. Alternative: `auto-fill` with a minimum width. Rejected in planning: it can show more than 3 columns on wide screens.

**Focus.** `:focus-visible` gives the tile a 3 px outline in `--mat-sys-primary` with an offset, in both modes.

**Tests.** Card tests set inputs with `fixture.componentRef.setInput`, read the DOM, and fire the image `error` event by hand. Link mode uses `provideRouter` with a stub route and checks the `href` and the navigation. The grid test checks the list role and that projected cards render as list items. Columns, square tiles and focus are checked in the browser, because jsdom does no layout.

## Risks / Trade-offs

- [Nothing in the app renders the card yet, so the browser check has no page] → During the verify task, temporarily render page 1 of the photo API on the Photos page, check it, and revert that edit before review. The Photos page uses the card for real in change `add-photostream-page`.
- [`NgOptimizedImage` may log dev warnings for external URLs without an image loader (for example about srcset or oversized images)] → Check the console in the browser task; if it warns, add `disableOptimizedSrcset` on the image rather than a global `IMAGE_CONFIG` switch.
- [400 px images look soft on 2x screens] → Accepted for now; raising the size is a one-number change in the card.
- [Changing the font link affects the header later if it gets icons] → Same font, only with more axes; no visual change for outlined icons.

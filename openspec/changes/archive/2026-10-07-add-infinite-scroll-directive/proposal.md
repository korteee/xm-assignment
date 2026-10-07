# Proposal

## Why

The Photos page must load more photos as the user scrolls, and the brief forbids infinite-scroll libraries. A small reusable directive that tells the page "the end of the list is near" keeps the scroll logic out of the page and is easy to test on its own.

## What Changes

- Add an attribute directive, `appInfiniteScroll`, placed on a sentinel element after the grid.
- It watches the sentinel with `IntersectionObserver` and emits `loadMore` when the sentinel comes within 300 px of the viewport.
- A `loadMoreDisabled` input makes it ignore the sentinel. The page sets it while a page is loading, after an error and at the end of the stream, so requests never overlap.
- When it is enabled again while the sentinel is still in range (for example, the new page did not fill the screen), it emits again, so the screen fills up without the user having to scroll.
- It stops observing when the element is destroyed.

Out of scope: loading photos, the loader, the retry state and the end-of-stream message. The Photos page uses the directive in change `add-photostream-page`.

## Capabilities

### New Capabilities

- `infinite-scroll`: when to ask for more content (sentinel near the viewport), when not to (disabled), refilling a screen that is not full, and cleanup.

### Modified Capabilities

None.

## Impact

- Code: new `src/app/shared/infinite-scroll/` with the directive and its spec.
- Uses the browser `IntersectionObserver`; tests replace it with a fake.
- Dependencies: none new.

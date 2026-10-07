# Proposal

## Why

The photostream needs a source of photos. There is no backend, so the app fakes one: a service that behaves like a slow paged API. Later changes (photo grid, infinite scroll, photostream page) all read from it, so its contract has to be settled and tested first.

## What Changes

- Add a `Photo` model whose identity is the numeric picsum ID, and a function `photoUrl({ id, width, height })` that builds the image URL (`https://picsum.photos/id/{id}/{width}/{height}`), also taking a typed params object.
- Add a fake photo API service with `getPhotos({ page, limit })`, which takes one typed params object. It returns an `Observable<Photo[]>` that emits once after a random 200-300 ms delay.
- The service hands out every ID from 0 to 1084 exactly once, in a random order that is fixed for the life of the service. A page is a slice of that order, so IDs never repeat across pages and asking for the same page twice gives the same photos.
- Pages past the end of the stream are empty. The last page can be shorter than `limit`.
- Invalid arguments (`page` or `limit` below 1, or not whole numbers) make the observable error.

Out of scope: any UI, the stream state in a signal, the loader, retry, and infinite scroll. Some of the 1085 IDs do not exist on picsum; the card that shows a photo handles the broken image (change `add-photo-card-and-grid`). Image sizes for the grid and the detail page are chosen by their own changes.

## Capabilities

### New Capabilities

- `photo-api`: the photo identity and image URL rule, and the fake paged API: random delay, random but stable order, no repeated IDs, end of stream, argument checks.

### Modified Capabilities

None.

## Impact

- Code: new folder `src/app/core/` with the `Photo` model and URL builder, and the photo API service, each with its spec.
- Dependencies: none new (RxJS is already installed).
- Later changes depend on this one: the photostream page reads pages from it, and the card and detail page use the URL builder.

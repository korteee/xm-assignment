# Proposal

## Why

Tiles on `/favorites` already link to `/photos/:id`, but that route is a placeholder that prints "Photo {id}". The brief wants one large photo there with a "Remove from favorites" button. This is the last page of the app, and the removal flow is the only way to take a photo out of Favorites.

## What Changes

- Replace the placeholder `PhotoDetailPage` with a page that shows the photo for the URL's ID at a large size (1200x800, same ID as the grid tile), with the alt text "Photo {id}", and a "Remove from favorites" button centered below it.
- Pressing the button removes the photo from the favorites, navigates to `/favorites`, and shows a snackbar "Photo {id} removed from favorites".
- Only current favorites have a detail page. For an invalid ID (not a whole number) or a photo that is not a favorite, `/photos/:id` shows the existing not-found page and keeps the URL. This also covers going Back to the page of a photo that was just removed.
- If the large image fails to load, the page shows a "Photo unavailable" message instead of a broken image. The Remove button keeps working.
- Add `Favorites.remove(id)`, an explicit removal that does nothing for a photo that is not a favorite. Toggling stays as it is.

Out of scope:

- Adding a photo to favorites from the detail page, previous/next navigation, zoom, and sharing.
- Moving keyboard focus after navigation (a site-wide concern, left for the polish step).
- A meta description and page titles (polish step).

## Capabilities

### New Capabilities

- `photo-detail`: the single photo page at `/photos/:id`: the large photo, the Remove button and its result, who may open it, and how a failed image looks.

### Modified Capabilities

- `favorites`: adds an explicit "remove a favorite" operation.
- `app-routing`: `/photos/:id` shows the detail page only for a favorite; otherwise it shows the not-found page.

## Impact

- Changed: `src/app/features/photo-detail/photo-detail-page.ts` (rewritten, with a spec), `src/app/core/favorites.ts` (+ spec), `src/app/app.routes.ts` (a guard on the detail route), `src/app/app.routes.spec.ts` (the old placeholder test now needs a favorite, because the requirement changed).
- New: a route guard file next to the detail page, with its spec.
- Reuses `Favorites`, `photoUrl`, `MatSnackBar`, `MatButton` and the not-found page. No new dependencies.

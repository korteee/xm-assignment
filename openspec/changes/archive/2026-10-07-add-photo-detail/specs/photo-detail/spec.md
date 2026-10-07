# Spec Delta

## Purpose

The single photo page at `/photos/:id`: one large photo of a favorite, a button to remove it from the favorites, and not-found for photos that are not favorites.

## ADDED Requirements

### Requirement: Large photo

For a favorite photo, the page SHALL show the heading "Photo {id}" and the photo for that ID at a large size (1200 by 800 px), with the alt text "Photo {id}". The image SHALL fit the page width without horizontal scrolling and SHALL load right away.

#### Scenario: Open a favorite

- **WHEN** photo `42` is a favorite and the user opens `/photos/42`
- **THEN** the page shows the heading "Photo 42"
- **AND** shows the image `https://picsum.photos/id/42/1200/800` with the alt text "Photo 42"

#### Scenario: Fits a phone

- **WHEN** the viewport is 390 px wide
- **THEN** the image is as wide as the content area and the page does not scroll horizontally

### Requirement: Remove from favorites

The page SHALL have a "Remove from favorites" button centered below the photo. Activating it SHALL remove the photo from the favorites, navigate to `/favorites`, and show a snackbar "Photo {id} removed from favorites" for 3 seconds.

#### Scenario: Remove

- **WHEN** photo `42` is a favorite and the user activates "Remove from favorites" on `/photos/42`
- **THEN** photo `42` is no longer a favorite
- **AND** the app navigates to `/favorites`
- **AND** a snackbar shows "Photo 42 removed from favorites"

#### Scenario: Removed photo is gone from the list

- **WHEN** the user has removed photo `42` and the Favorites page is shown
- **THEN** it has no tile for photo `42`

### Requirement: Only favorites have a photo page

When the ID in the URL is not a whole number of 0 or more, or is not a current favorite, `/photos/:id` SHALL show the not-found page and SHALL keep the URL as typed. It SHALL NOT show the detail page, a broken image, or a Remove button.

#### Scenario: Not a favorite

- **WHEN** photo `42` is not a favorite and the user opens `/photos/42`
- **THEN** the not-found page is shown
- **AND** the URL is still `/photos/42`

#### Scenario: Invalid ID

- **WHEN** the user opens `/photos/abc`, `/photos/1.5` or `/photos/-1`
- **THEN** the not-found page is shown

#### Scenario: Back to a removed photo

- **WHEN** the user removes photo `42` on its page and then goes back in history
- **THEN** the not-found page is shown for `/photos/42`

### Requirement: Header stays

The header SHALL stay on the page with the Favorites button highlighted.

#### Scenario: Header on the photo page

- **WHEN** the user opens the page of a favorite photo
- **THEN** the header with the Photos and Favorites buttons is shown
- **AND** the Favorites button is highlighted

### Requirement: Failed image

When the photo image fails to load, the page SHALL replace it with the message "Photo unavailable". The Remove from favorites button SHALL still work.

#### Scenario: Image fails

- **WHEN** the image for a favorite photo fails to load
- **THEN** the page shows "Photo unavailable" instead of the image
- **AND** "Remove from favorites" is still shown

# favorites-page Specification

## Purpose

The Favorites page at `/favorites`: lists every favorite photo, newest first, with links to each photo's page, and guides the user back to Photos when there are none.

## Requirements

### Requirement: List all favorites

The page SHALL show the heading "Favorites" and every favorite photo in the photo grid, with no paging or infinite scroll. Each tile SHALL show a filled heart.

#### Scenario: Some favorites

- **WHEN** photos `7`, `3` and `9` are favorites and the user opens `/favorites`
- **THEN** the grid shows 3 tiles, for photos `7`, `3` and `9`
- **AND** each tile shows a filled heart

### Requirement: Newest first

The page SHALL order the tiles by when the photo was added, with the most recently added first.

#### Scenario: Order on the page

- **WHEN** photos `7`, `3` and `9` were added in that order
- **THEN** the tiles show photos `9`, `3`, `7`

### Requirement: Open the photo page

Each tile SHALL be a link to `/photos/{id}` for its photo, labeled by the image alt text "Photo {id}". Activating a tile SHALL NOT change the favorites.

#### Scenario: Tile link

- **WHEN** photo `42` is a favorite
- **THEN** its tile is a link to `/photos/42`

#### Scenario: Follow the link

- **WHEN** the user activates the tile for photo `42`
- **THEN** the app navigates to `/photos/42`
- **AND** photo `42` is still a favorite

### Requirement: Empty state

When there are no favorites, the page SHALL show "No favorites yet", a hint that photos are added from the Photos page, and a link to Photos (`/`). It SHALL NOT show an empty grid.

#### Scenario: No favorites

- **WHEN** there are no favorites and the user opens `/favorites`
- **THEN** the page shows "No favorites yet" and a link to `/`
- **AND** no photo grid is shown

#### Scenario: Back to Photos

- **WHEN** the user activates the link in the empty state
- **THEN** the app navigates to `/`

### Requirement: Always current

The list SHALL reflect the saved favorites every time the page opens, including favorites restored after a page refresh.

#### Scenario: Added on Photos, then opened Favorites

- **WHEN** the user adds photo `42` on `/` and then opens `/favorites`
- **THEN** the tile for photo `42` is first in the list

#### Scenario: After refresh

- **WHEN** photo `42` was saved as a favorite and the user loads `/favorites` directly
- **THEN** the tile for photo `42` is shown

### Requirement: First screen loads first

The first 6 tiles SHALL be marked as priority so their images load before the rest.

#### Scenario: Initial tiles

- **WHEN** the page shows 8 favorites
- **THEN** the first 6 tiles are priority and the rest load lazily

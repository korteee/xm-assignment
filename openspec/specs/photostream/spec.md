# photostream Specification

## Purpose

The Photos page at `/`: an endlessly loading grid of random photos that loads more as the user scrolls, tells the user when it is loading, failed or has nothing left, and keeps what it loaded while the user visits other pages.

## Requirements

### Requirement: First page on open

When the Photos page opens and no photos are loaded yet, it SHALL load the first page of 18 photos and show them in the photo grid.

#### Scenario: Open the Photos page

- **WHEN** the user opens `/` for the first time
- **THEN** the page loads the first page
- **AND** shows its 18 photos in the grid

### Requirement: Load more on scroll

When the user scrolls near the end of the grid, the page SHALL load the next page and append its photos below the ones already shown.

#### Scenario: Scroll to the end

- **WHEN** the end of the grid comes within 300 px of the viewport
- **THEN** the next page loads
- **AND** its photos appear after the existing ones, which stay in place

### Requirement: One request at a time

The page SHALL NOT start a new page request while one is in flight.

#### Scenario: Scroll again during a load

- **WHEN** a page is loading and the end of the grid comes into range again
- **THEN** no second request starts

### Requirement: Loading skeleton

While a page loads, the page SHALL show 18 skeleton tiles at the end of the grid, the same size as photo tiles, and SHALL announce "Loading photos" to assistive technology through a polite live region. The skeleton tiles SHALL be hidden from assistive technology. Their shimmer animation SHALL stop when the user prefers reduced motion.

#### Scenario: Page loading

- **WHEN** a page request is in flight
- **THEN** 18 skeleton tiles are shown after the loaded photos
- **AND** the live region contains "Loading photos"
- **AND** a screen reader does not count the skeleton tiles as list items

#### Scenario: Page loaded

- **WHEN** the request completes
- **THEN** the skeleton tiles are removed and the new photos take their place

#### Scenario: Reduced motion

- **WHEN** the user's system asks for reduced motion
- **THEN** the skeleton tiles do not animate

### Requirement: Error and retry

When a page request fails, the page SHALL show "Couldn't load photos." and a Retry button, and SHALL stop loading on scroll. Activating Retry SHALL request the same page again.

#### Scenario: Request fails

- **WHEN** a page request fails
- **THEN** the page shows "Couldn't load photos." and a Retry button
- **AND** scrolling does not start new requests

#### Scenario: Retry succeeds

- **WHEN** the user activates Retry and the request succeeds
- **THEN** the photos of the failed page appear
- **AND** the error message and Retry button are removed

### Requirement: End of the stream

When a page comes back empty, the page SHALL show and announce "You've seen them all" and SHALL NOT request more pages.

#### Scenario: Stream runs out

- **WHEN** the next page is empty
- **THEN** the page shows "You've seen them all"
- **AND** scrolling does not start new requests

### Requirement: Keep the stream across navigation

The loaded photos SHALL stay loaded for the life of the app. Returning to `/` SHALL show them again without loading the first page again.

#### Scenario: Photos, Favorites, Photos

- **WHEN** the user loads two pages on `/`, opens `/favorites`, and goes back to `/`
- **THEN** the same 36 photos are shown in the same order
- **AND** no request for page 1 is made

### Requirement: First screen loads first

The first 6 tiles SHALL be marked as priority so their images load before the rest.

#### Scenario: Initial tiles

- **WHEN** the first page is shown
- **THEN** the first 6 tiles are priority and the rest load lazily

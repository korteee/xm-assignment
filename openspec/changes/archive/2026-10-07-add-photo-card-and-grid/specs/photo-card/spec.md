# Spec Delta

## Purpose

One square photo tile, shared by the Photos and Favorites pages. It shows a photo by its ID with a heart indicator, and either toggles the favorite or links to the photo's page.

## ADDED Requirements

### Requirement: Photo image

The card SHALL show the photo for its ID at the grid image size, cropped to a square. The image SHALL have the alt text "Photo {id}". Unless the card is marked as priority, its image SHALL load only when it comes near the viewport.

#### Scenario: Image for a photo

- **WHEN** a card is shown for photo `42`
- **THEN** it shows the image `https://picsum.photos/id/42/400/400`
- **AND** the image alt text is "Photo 42"

### Requirement: Priority loading

The page SHALL be able to mark a card as priority. A priority card's image SHALL load right away with high fetch priority instead of waiting until it is near the viewport. Cards SHALL NOT be priority by default.

#### Scenario: Priority card

- **WHEN** a card is marked as priority
- **THEN** its image loads eagerly with high fetch priority

#### Scenario: Default card

- **WHEN** a card is not marked as priority
- **THEN** its image loads lazily

### Requirement: Heart indicator

Every card SHALL show a heart. The heart SHALL be filled when the photo is a favorite and outlined when it is not. The heart SHALL be decorative; the favorite state SHALL be exposed through the tile itself.

#### Scenario: Favorite photo

- **WHEN** a card is shown for a photo that is a favorite
- **THEN** it shows a filled heart

#### Scenario: Not a favorite

- **WHEN** a card is shown for a photo that is not a favorite
- **THEN** it shows an outlined heart

### Requirement: Toggle mode

When the page gives no link, the tile SHALL be a button. Activating it with a pointer, Enter or Space SHALL emit a request to toggle the favorite for that photo. The button SHALL be marked as pressed when the photo is a favorite. The card SHALL NOT change the favorite itself.

#### Scenario: Activate a tile

- **WHEN** the user activates the tile for photo `42`
- **THEN** the card emits a toggle request for photo `42`

#### Scenario: Pressed state

- **WHEN** the photo is a favorite
- **THEN** the button is marked as pressed
- **AND** when it is not a favorite the button is marked as not pressed

### Requirement: Link mode

When the page gives a link, the tile SHALL be a link to that URL, labeled by the image alt text, and SHALL NOT emit toggle requests.

#### Scenario: Link to the photo page

- **WHEN** a card for photo `42` is given the link `/photos/42`
- **THEN** the tile is a link to `/photos/42`

#### Scenario: Follow the link

- **WHEN** the user activates the link
- **THEN** the app navigates to `/photos/42`

### Requirement: Broken image placeholder

When the image fails to load, the card SHALL replace it with a "Photo unavailable" placeholder. In toggle mode the tile SHALL then be marked as disabled, SHALL stay focusable, and activating it SHALL NOT emit a toggle request.

#### Scenario: Image fails to load

- **WHEN** the image for photo `86` fails to load
- **THEN** the card shows "Photo unavailable" instead of the image

#### Scenario: Broken photo cannot be favorited

- **WHEN** the image failed to load and the user activates the tile in toggle mode
- **THEN** no toggle request is emitted
- **AND** the tile is marked as disabled

### Requirement: Visible focus

The tile SHALL show a visible focus indicator when it receives keyboard focus, in both modes.

#### Scenario: Keyboard focus

- **WHEN** the user moves keyboard focus to a tile
- **THEN** a focus indicator is visible around the tile

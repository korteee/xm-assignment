# Spec Delta

## ADDED Requirements

### Requirement: Toggle favorites from the stream

Every tile on `/` SHALL show whether its photo is a favorite. Activating a tile SHALL toggle that photo's favorite and update the tile's heart and pressed state right away. Tiles whose image failed to load SHALL NOT change the favorites.

#### Scenario: Add from the stream

- **WHEN** the user activates the tile for photo `42`, which is not a favorite
- **THEN** photo `42` becomes a favorite
- **AND** its tile shows a filled heart and is marked as pressed

#### Scenario: Remove from the stream

- **WHEN** the user activates the tile for photo `42`, which is a favorite
- **THEN** photo `42` is no longer a favorite
- **AND** its tile shows an outlined heart and is marked as not pressed

#### Scenario: Stored favorites are shown

- **WHEN** photo `42` was a favorite before the page opened and its tile is shown
- **THEN** the tile shows a filled heart and is marked as pressed

### Requirement: Confirm each change

After each toggle on `/`, the app SHALL show a snackbar for 3 seconds with no action: "Photo {id} added to favorites" or "Photo {id} removed from favorites". The message SHALL be announced politely to assistive technology and SHALL NOT move focus.

#### Scenario: Added

- **WHEN** the user adds photo `42`
- **THEN** a snackbar shows "Photo 42 added to favorites"

#### Scenario: Removed

- **WHEN** the user removes photo `42`
- **THEN** a snackbar shows "Photo 42 removed from favorites"

#### Scenario: Focus stays on the tile

- **WHEN** the snackbar opens
- **THEN** keyboard focus stays on the tile the user activated

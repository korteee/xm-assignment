# favorites Specification

## Purpose

The user's favorite photos: which photo IDs are favorites, in what order they were added, and how they persist in the browser across page refreshes.

## Requirements

### Requirement: Toggle a favorite

Toggling a photo that is not a favorite SHALL make it a favorite. Toggling a photo that is a favorite SHALL remove it. The result SHALL tell the caller whether the photo is now a favorite.

#### Scenario: Add a photo

- **WHEN** photo `42` is not a favorite and it is toggled
- **THEN** photo `42` is a favorite
- **AND** the result says it was added

#### Scenario: Remove a photo

- **WHEN** photo `42` is a favorite and it is toggled
- **THEN** photo `42` is not a favorite
- **AND** the result says it was removed

### Requirement: Order of favorites

The favorites SHALL be kept as photo IDs in the order they were added, oldest first, with no duplicates. A photo removed and added again SHALL move to the end.

#### Scenario: Add in order

- **WHEN** photos `7`, `3` and `9` are added in that order
- **THEN** the favorites are `7`, `3`, `9`

#### Scenario: Add again after removing

- **WHEN** the favorites are `7`, `3`, `9` and photo `7` is removed and added again
- **THEN** the favorites are `3`, `9`, `7`

### Requirement: Persist in the browser

Every change to the favorites SHALL be saved in `localStorage` under the key `xm-photo-library.favorites.v1`, as a JSON array of photo IDs. When the app starts, it SHALL restore the favorites from that key.

#### Scenario: Save on change

- **WHEN** photo `42` is added
- **THEN** `localStorage` holds `[42]` under `xm-photo-library.favorites.v1`

#### Scenario: Restore after refresh

- **WHEN** the key holds `[7,3]` and the app starts
- **THEN** the favorites are `7`, `3`

### Requirement: Bad stored data

When the stored value is missing, is not valid JSON, is not an array, or contains anything other than whole numbers of 0 or more, the app SHALL start with no favorites and SHALL NOT fail. Duplicate IDs in a valid array SHALL be kept once, at their first position.

#### Scenario: Nothing stored

- **WHEN** the key is not set and the app starts
- **THEN** there are no favorites

#### Scenario: Not JSON

- **WHEN** the key holds `not json` and the app starts
- **THEN** there are no favorites and no error is thrown

#### Scenario: Wrong shape

- **WHEN** the key holds `{"ids":[1]}`, `[1,"2"]`, `[1.5]` or `[-1]` and the app starts
- **THEN** there are no favorites

#### Scenario: Duplicates

- **WHEN** the key holds `[7,3,7]` and the app starts
- **THEN** the favorites are `7`, `3`

### Requirement: Storage unavailable

When the browser blocks reading or writing `localStorage`, or a write fails (for example, the quota is full), the favorites SHALL keep working in memory for the current session and SHALL NOT fail.

#### Scenario: Reading is blocked

- **WHEN** reading `localStorage` throws and the app starts
- **THEN** there are no favorites and no error is thrown

#### Scenario: Writing fails

- **WHEN** writing `localStorage` throws and photo `42` is toggled
- **THEN** photo `42` is a favorite for the rest of the session
- **AND** no error is thrown

### Requirement: Remove a favorite

The favorites SHALL offer an explicit removal of one photo. Removing a favorite SHALL take it out of the list and save the change. Removing a photo that is not a favorite SHALL change nothing.

#### Scenario: Remove a favorite

- **WHEN** the favorites are `7`, `3`, `9` and photo `3` is removed
- **THEN** the favorites are `7`, `9`
- **AND** `localStorage` holds `[7,9]` under `xm-photo-library.favorites.v1`

#### Scenario: Remove a photo that is not a favorite

- **WHEN** the favorites are `7`, `3` and photo `42` is removed
- **THEN** the favorites are still `7`, `3`

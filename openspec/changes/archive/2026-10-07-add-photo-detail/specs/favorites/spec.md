# Spec Delta

## ADDED Requirements

### Requirement: Remove a favorite

The favorites SHALL offer an explicit removal of one photo. Removing a favorite SHALL take it out of the list and save the change. Removing a photo that is not a favorite SHALL change nothing.

#### Scenario: Remove a favorite

- **WHEN** the favorites are `7`, `3`, `9` and photo `3` is removed
- **THEN** the favorites are `7`, `9`
- **AND** `localStorage` holds `[7,9]` under `xm-photo-library.favorites.v1`

#### Scenario: Remove a photo that is not a favorite

- **WHEN** the favorites are `7`, `3` and photo `42` is removed
- **THEN** the favorites are still `7`, `3`

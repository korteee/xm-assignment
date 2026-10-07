# Spec Delta

## ADDED Requirements

### Requirement: Page titles

Every page SHALL set the document title to its own name followed by " | Photo Library": "Photos" on `/`, "Favorites" on `/favorites`, "Photo {id}" on `/photos/{id}`, and "Page not found" on the not-found page. The title SHALL change with every navigation, including between two photo pages.

#### Scenario: Title per page

- **WHEN** the user opens `/`, then `/favorites`
- **THEN** the title is "Photos | Photo Library", then "Favorites | Photo Library"

#### Scenario: Photo page title

- **WHEN** photo `42` is a favorite and the user opens `/photos/42`
- **THEN** the title is "Photo 42 | Photo Library"

#### Scenario: Photo page for another ID

- **WHEN** the user is on `/photos/42` and goes to `/photos/7`, which is also a favorite
- **THEN** the title becomes "Photo 7 | Photo Library"

#### Scenario: Not-found title

- **WHEN** the user opens `/does-not-exist`, or `/photos/42` for a photo that is not a favorite
- **THEN** the title is "Page not found | Photo Library"

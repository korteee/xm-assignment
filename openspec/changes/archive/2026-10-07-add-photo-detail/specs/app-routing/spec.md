# Spec Delta

## MODIFIED Requirements

### Requirement: Route table

The app SHALL map `/` to the Photos page, `/favorites` to the Favorites page, and `/photos/:id` to the photo detail page when the ID is a current favorite. For any other ID, `/photos/:id` SHALL show the not-found page.

#### Scenario: Photos route

- **WHEN** the user opens `/`
- **THEN** the Photos page is shown

#### Scenario: Favorites route

- **WHEN** the user opens `/favorites`
- **THEN** the Favorites page is shown

#### Scenario: Detail route

- **WHEN** photo `42` is a favorite and the user opens `/photos/42`
- **THEN** the photo detail page is shown for ID `42`

#### Scenario: Detail route for a photo that is not a favorite

- **WHEN** photo `42` is not a favorite and the user opens `/photos/42`
- **THEN** the not-found page is shown

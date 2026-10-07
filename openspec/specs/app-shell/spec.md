# app-shell Specification

## Purpose

The frame around every page: a header for switching between the photostream and Favorites, and one fixed dark look for the whole app.

## Requirements

### Requirement: Header navigation

The app SHALL show a header with a **Photos** button and a **Favorites** button above the page content. Photos SHALL lead to `/` and Favorites SHALL lead to `/favorites`.

#### Scenario: Header shows both buttons

- **WHEN** the app loads on any route
- **THEN** the header shows a Photos button and a Favorites button

#### Scenario: Switch to Favorites

- **WHEN** the user activates the Favorites button
- **THEN** the app navigates to `/favorites`

#### Scenario: Switch to Photos

- **WHEN** the user activates the Photos button
- **THEN** the app navigates to `/`

### Requirement: Active view is highlighted

The header SHALL highlight the button of the current view. Only one button SHALL be highlighted at a time. The highlighted button SHALL be exposed to assistive technology as the current page.

#### Scenario: Photos view is active

- **WHEN** the current route is `/`
- **THEN** the Photos button is highlighted and marked as the current page
- **AND** the Favorites button is not highlighted

#### Scenario: Favorites view is active

- **WHEN** the current route is `/favorites`
- **THEN** the Favorites button is highlighted and marked as the current page
- **AND** the Photos button is not highlighted

#### Scenario: Detail view keeps Favorites active

- **WHEN** the current route is `/photos/:id`
- **THEN** the Favorites button is highlighted

#### Scenario: Unknown route highlights nothing

- **WHEN** the current route matches no page
- **THEN** no header button is highlighted

### Requirement: Header on every page

The header SHALL stay visible and unchanged on every page, including the photo detail page and the not-found page.

#### Scenario: Header on detail page

- **WHEN** the user opens `/photos/:id`
- **THEN** the same header is shown above the photo

#### Scenario: Header on not-found page

- **WHEN** the user opens a path that matches no route
- **THEN** the same header is shown above the not-found message

### Requirement: Fixed dark theme

The app SHALL use one fixed dark Material 3 theme. It SHALL NOT offer a theme toggle and SHALL NOT follow the system color scheme. Text and controls SHALL meet WCAG AA color contrast.

#### Scenario: Dark in a light system

- **WHEN** the user's system is set to a light color scheme
- **THEN** the app is still shown in the dark theme

#### Scenario: No toggle

- **WHEN** the user looks at the header
- **THEN** there is no control to change the theme

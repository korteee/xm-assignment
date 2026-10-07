# app-routing Specification

## Purpose

The route table of the app: which URL shows which page, how pages are loaded, what happens for unknown URLs, and how scroll position is kept when the user moves between pages.

## Requirements

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

### Requirement: Pages load on demand

Each page SHALL load only when its route is first visited, so the first load does not include code for pages the user has not opened.

#### Scenario: Page code is not in the first load

- **WHEN** the app starts on `/`
- **THEN** the code for the Favorites, photo detail and not-found pages is not loaded yet

### Requirement: Not-found page

The app SHALL show a not-found page for any path that matches no route. The page SHALL tell the user the page does not exist and SHALL give a link back to Photos.

#### Scenario: Unknown path

- **WHEN** the user opens `/does-not-exist`
- **THEN** the not-found page is shown
- **AND** it has a link to `/`

#### Scenario: Link back to Photos

- **WHEN** the user activates the link on the not-found page
- **THEN** the app navigates to `/`

### Requirement: Scroll position restoration

The app SHALL restore the scroll position when the user goes back or forward in history, and SHALL scroll to the top on a new navigation.

#### Scenario: Back restores position

- **WHEN** the user scrolls down on one page, navigates to another page, and then goes back
- **THEN** the first page is scrolled to where the user left it

#### Scenario: New navigation starts at the top

- **WHEN** the user follows a link or header button to a page
- **THEN** that page is shown scrolled to the top

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

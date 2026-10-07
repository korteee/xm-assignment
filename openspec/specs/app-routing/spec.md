# app-routing Specification

## Purpose

The route table of the app: which URL shows which page, how pages are loaded, what happens for unknown URLs, and how scroll position is kept when the user moves between pages.

## Requirements

### Requirement: Route table

The app SHALL map `/` to the Photos page, `/favorites` to the Favorites page, and `/photos/:id` to the photo detail page.

#### Scenario: Photos route

- **WHEN** the user opens `/`
- **THEN** the Photos page is shown

#### Scenario: Favorites route

- **WHEN** the user opens `/favorites`
- **THEN** the Favorites page is shown

#### Scenario: Detail route

- **WHEN** the user opens `/photos/42`
- **THEN** the photo detail page is shown for ID `42`

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

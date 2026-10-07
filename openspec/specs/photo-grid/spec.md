# photo-grid Specification

## Purpose

The responsive layout for photo tiles, shared by the Photos and Favorites pages: a list of square tiles in as many columns as the screen width allows, up to three.

## Requirements

### Requirement: Responsive columns

The grid SHALL show tiles in 3 columns when the viewport is at least 960 px wide, 2 columns from 600 to 959 px, and 1 column below 600 px. The grid SHALL NOT cause horizontal scrolling at any width.

#### Scenario: Desktop

- **WHEN** the viewport is 1280 px wide
- **THEN** the grid shows 3 tiles per row

#### Scenario: Tablet

- **WHEN** the viewport is 768 px wide
- **THEN** the grid shows 2 tiles per row

#### Scenario: Phone

- **WHEN** the viewport is 390 px wide
- **THEN** the grid shows 1 tile per row
- **AND** the page does not scroll horizontally

### Requirement: Square tiles

Every tile in the grid SHALL be square, whatever the size of the source image.

#### Scenario: Tile shape

- **WHEN** the grid shows tiles at any width
- **THEN** each tile is as tall as it is wide

### Requirement: List semantics

The grid SHALL be exposed to assistive technology as a list, and each tile as an item in that list.

#### Scenario: Screen reader

- **WHEN** a grid of 18 tiles is read by a screen reader
- **THEN** it is announced as a list of 18 items

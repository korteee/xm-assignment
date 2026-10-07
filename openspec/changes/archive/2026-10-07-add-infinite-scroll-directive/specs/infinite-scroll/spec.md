# Spec Delta

## Purpose

Tells a page when the end of its content is near, so it can load more. It is a reusable directive on a sentinel element, built on the browser's intersection API, with no infinite-scroll library.

## ADDED Requirements

### Requirement: Ask for more near the end

The directive SHALL emit a load-more request when its element comes within 300 px of the viewport. It SHALL emit once each time the element enters that range, not continuously while it stays there.

#### Scenario: Sentinel comes near the viewport

- **WHEN** the user scrolls and the sentinel comes within 300 px of the viewport
- **THEN** the directive emits one load-more request

#### Scenario: Sentinel stays in range

- **WHEN** the sentinel stays within range and nothing else changes
- **THEN** the directive does not emit again

#### Scenario: Sentinel far away

- **WHEN** the sentinel is more than 300 px below the viewport
- **THEN** the directive does not emit

### Requirement: Ignore the sentinel while disabled

While the page marks the directive as disabled, it SHALL NOT emit, even when the sentinel enters the range.

#### Scenario: Load in flight

- **WHEN** the directive is disabled and the sentinel comes within range
- **THEN** the directive does not emit

### Requirement: Fill the screen

When the directive is enabled again while its element is still within range, it SHALL emit a load-more request, so content keeps loading until the element leaves the range.

#### Scenario: New page does not fill the screen

- **WHEN** the directive is disabled during a load, the sentinel stays in range, and the directive is enabled again
- **THEN** the directive emits one load-more request

#### Scenario: Enabled after the user scrolled away

- **WHEN** the directive is enabled again after the sentinel left the range
- **THEN** the directive does not emit

### Requirement: Stop when removed

The directive SHALL stop watching its element when the element is removed from the page.

#### Scenario: Page left

- **WHEN** the user navigates away and the sentinel is destroyed
- **THEN** the directive stops observing and never emits again

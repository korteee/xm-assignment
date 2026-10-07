# Spec Delta

## ADDED Requirements

### Requirement: Page description and first-load title

The app's HTML SHALL include a meta description of one sentence that says what the app is, and the title in the HTML SHALL be "Photo Library", so both are present before any script runs.

#### Scenario: Description in the HTML

- **WHEN** the page HTML is loaded, before the app starts
- **THEN** it has a `description` meta tag with a non-empty value
- **AND** its title is "Photo Library"

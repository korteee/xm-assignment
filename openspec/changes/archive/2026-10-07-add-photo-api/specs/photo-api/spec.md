# Spec Delta

## Purpose

The source of photos for the app. It names a photo by its picsum ID, builds image URLs from that ID, and fakes a slow paged backend that serves each photo once, in random order.

## ADDED Requirements

### Requirement: Photo identity and image URL

A photo SHALL be identified by a whole-number picsum ID. The image URL SHALL be built from one params object holding the photo ID, width and height, and SHALL be `https://picsum.photos/id/{id}/{width}/{height}`. The app SHALL NOT use the random, ID-less picsum URL.

#### Scenario: URL for a photo and size

- **WHEN** the image URL is built for ID `42` at 400 by 300
- **THEN** the URL is `https://picsum.photos/id/42/400/300`

#### Scenario: Same ID at another size

- **WHEN** the image URL is built for ID `42` at 1200 by 800
- **THEN** the URL is `https://picsum.photos/id/42/1200/800`
- **AND** it shows the same photo as the 400 by 300 URL

### Requirement: Paged photo requests

`getPhotos({ page, limit })` SHALL take one params object and SHALL return an observable that emits one array of at most `limit` photos and then completes. Pages SHALL start at 1. Page `n` SHALL hold the photos at positions `(n - 1) * limit` up to `n * limit` of the photo order.

#### Scenario: First page

- **WHEN** the first page is requested with a limit of 18
- **THEN** the observable emits 18 photos and completes

#### Scenario: Photo IDs are in range

- **WHEN** any page is requested
- **THEN** every photo ID in it is a whole number from 0 to 1084

### Requirement: Simulated network delay

Each request SHALL emit its photos after a random delay of 200 to 300 ms, counted from when the caller subscribes. Nothing SHALL be emitted before the delay ends. Each request SHALL draw its own delay.

#### Scenario: Nothing before 200 ms

- **WHEN** a request is subscribed to and 199 ms pass
- **THEN** nothing has been emitted

#### Scenario: Emitted by 300 ms

- **WHEN** a request is subscribed to and 300 ms pass
- **THEN** the photos have been emitted

#### Scenario: Delay is random per request

- **WHEN** two requests draw different random values
- **THEN** they emit after different delays

### Requirement: No repeated photos

Within one run of the app, a photo ID SHALL appear at most once across all pages requested with the same limit. Requesting the same page again SHALL return the same photos in the same order.

#### Scenario: Consecutive pages do not overlap

- **WHEN** pages 1 and 2 are requested with a limit of 18
- **THEN** no ID in page 1 is in page 2

#### Scenario: Page requested again

- **WHEN** page 3 is requested twice
- **THEN** both responses hold the same IDs in the same order

### Requirement: Random photo order

The order of the photos SHALL be random. It SHALL be chosen once when the service is created and SHALL stay the same until the app is reloaded.

#### Scenario: Different order on a new run

- **WHEN** two services are created with different random values
- **THEN** their first pages are not the same list of IDs

### Requirement: End of the stream

The photo order SHALL hold each ID from 0 to 1084 exactly once. A page that starts past the last photo SHALL emit an empty array. The last page with photos MAY hold fewer than `limit`.

#### Scenario: All photos are served once

- **WHEN** every page is requested with a limit of 18 until one is empty
- **THEN** the pages together hold 1085 photos
- **AND** every ID from 0 to 1084 appears exactly once

#### Scenario: Last page is shorter

- **WHEN** page 61 is requested with a limit of 18
- **THEN** it holds 5 photos

#### Scenario: Page past the end

- **WHEN** page 62 is requested with a limit of 18
- **THEN** it emits an empty array and completes

### Requirement: Invalid requests

`getPhotos` SHALL make the observable fail, after subscription, when `page` or `limit` is not a whole number of at least 1. It SHALL NOT throw when called.

#### Scenario: Page below 1

- **WHEN** `getPhotos({ page: 0, limit: 18 })` is subscribed to
- **THEN** the observable errors

#### Scenario: Limit below 1

- **WHEN** `getPhotos({ page: 1, limit: 0 })` is subscribed to
- **THEN** the observable errors

#### Scenario: Not a whole number

- **WHEN** `getPhotos({ page: 1.5, limit: 18 })` is subscribed to
- **THEN** the observable errors

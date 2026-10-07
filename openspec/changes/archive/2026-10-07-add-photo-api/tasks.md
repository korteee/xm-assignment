# Tasks

Each task is one red-green-refactor cycle: write the failing test, make it pass, clean up. Run `npx ng test --no-watch` after each. This change has no UI, so there is no browser check.

## 1. Photo model and image URL

- [x] 1.1 Test then add `photoUrl({ id, width, height })` in `src/app/core/photo.ts` with the `Photo` interface: `photoUrl({ id: 42, width: 400, height: 300 })` is `https://picsum.photos/id/42/400/300` and the same ID at 1200 by 800 gives the 1200 by 800 URL.

## 2. Fake photo API

- [x] 2.1 Test then add `PhotoApi.getPhotos({ page, limit })` in `src/app/core/photo-api.ts` as an `@Service()`: with fake timers, page 1 with limit 18 emits 18 photos whose IDs are whole numbers from 0 to 1084, then completes.
- [x] 2.2 Test then add the delay: with `Math.random` stubbed to 0 nothing is emitted at 199 ms and the photos arrive at 200 ms; stubbed just below 1 they arrive at 300 ms and not before 300 ms; two subscriptions with different random values emit at different times.
- [x] 2.3 Test then keep pages from overlapping and make them stable: pages 1 and 2 share no ID; page 3 requested twice has the same IDs in the same order.
- [x] 2.4 Test then shuffle the order once per service: two services created with different `Math.random` values return different first pages.
- [x] 2.5 Test then handle the end of the stream: reading pages of 18 until an empty one gives 1085 photos holding every ID from 0 to 1084 exactly once; page 61 has 5 photos; page 62 is an empty array that completes.
- [x] 2.6 Test then reject invalid requests: `getPhotos({ page: 0, limit: 18 })`, `getPhotos({ page: 1, limit: 0 })` and `getPhotos({ page: 1.5, limit: 18 })` error on subscribe and do not throw when called.
- [x] 2.7 Refactor with the suite green: name the ID range and delay bounds as constants, add short JSDoc on the service and its public method, and check no test depends on real time.

## 3. Verify

- [x] 3.1 Full suite green (`npx ng test --no-watch`), `npx ng lint` clean, `npx prettier --check` clean on the files this change touches.
- [x] 3.2 `openspec validate add-photo-api --strict` passes.

## Workflow follow-up

- Show the change to the user for review; commit only when asked (`feat:` with its tests, `docs:` for this change's artifacts).
- Archive the change with `/opsx:archive` after the review.

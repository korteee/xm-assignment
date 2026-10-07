# Photo Library

An infinite, random photostream. Select a photo to save it to your favorites; favorites are kept in the browser and survive a refresh. Built with Angular, Angular Material and the [Lorem Picsum](https://picsum.photos) images.

## Requirements

- Node.js 22.22.3 or later, or 24.15 or later
- npm (comes with Node.js)

## Run it locally

```bash
npm install
npx ng serve
```

Then open <http://localhost:4200/>. The app reloads when you change a source file.

## Other commands

```bash
npx ng test --no-watch   # unit and integration tests (Vitest)
npx ng lint              # ESLint
npx ng build             # production build into dist/
```

## Pages

| URL           | Page                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| `/`           | The photostream. Select a photo to add it to or remove it from favorites. |
| `/favorites`  | Your favorites, newest first.                                             |
| `/photos/:id` | One large favorite, with a "Remove from favorites" button.                |

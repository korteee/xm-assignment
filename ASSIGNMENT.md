# Assignment: Photo Library

Create a photo library with an infinite random photostream and the ability to save photos to a "Favorites" library.

## Design

Wireframes give a general view of the pages (the single-photo wireframe shows the header with **Photos** / **Favorites** buttons, a full-size photo, and a **Remove from favorites** button below it). Theme (colors, fonts) is free to choose.

### Wireframes
- **List view** (Photos and Favorites screens): header with **Photos** / **Favorites** buttons at the top, a 3-column grid of square photo tiles below it, and a circular **Loading...** indicator centered under the grid.
- **Detail view** (single photo page): same header, one large photo filling the content area, and a **Remove from favorites** button centered below it.

### Header
- Two buttons: switch between "Favorites" and the random photostream.
- The active view must be highlighted.

### "Photos" screen — `/`
- Infinite scrollable list of photos.
- Clicking a photo adds it to Favorites.
- New photos load while scrolling; a loader icon is shown.
- Use https://picsum.photos/200/300 for random images (or any other resource).
- Emulate a real-world API: loading new photos has a random delay of 200–300 ms.

### "Favorites" screen — `/favorites`
- List of all favorite photos (no infinite scroll).
- Clicking a photo opens the single photo page.
- Favorites persist after a page refresh.

### Single photo page — `/photos/:id`
- Shows one full-screen photo instead of a grid.
- Contains a "Remove from favorites" button.
- The header stays the same on this page.

## General requirements
- Use the Angular Router.
- Use the latest Angular, and SCSS instead of CSS.
- Use Angular Material components.
- Implement infinite scroll on your own — no libraries.
- No backend server for retaining state.
- Add unit tests.
- Structure code carefully: separate reusable components, modules, etc. Test the code.
- Random image generation reference: https://alternativeto.net/software/unsplash-it/about/

## Submission
1. Build the solution locally; keep code clean, documented, and meeting all requirements.
2. Create a new **public** GitHub repository on your personal account.
3. Push the project to it.
4. Share the repository URL with the Talent Acquisition representative.

Tip: include a short `README.md` with instructions to run the project locally.

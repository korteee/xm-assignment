import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: { section: 'photos' },
    loadComponent: () => import('./features/photos/photos-page').then((m) => m.PhotosPage),
  },
  {
    path: 'favorites',
    data: { section: 'favorites' },
    loadComponent: () => import('./features/favorites/favorites-page').then((m) => m.FavoritesPage),
  },
  {
    path: 'photos/:id',
    data: { section: 'favorites' },
    loadComponent: () =>
      import('./features/photo-detail/photo-detail-page').then((m) => m.PhotoDetailPage),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];

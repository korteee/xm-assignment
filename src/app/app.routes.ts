import { Routes } from '@angular/router';
import { favoritePhotoGuard } from './features/photo-detail/favorite-photo.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Photos | Photo Library',
    data: { section: 'photos' },
    loadComponent: () => import('./features/photos/photos-page').then((m) => m.PhotosPage),
  },
  {
    path: 'favorites',
    title: 'Favorites | Photo Library',
    data: { section: 'favorites' },
    loadComponent: () => import('./features/favorites/favorites-page').then((m) => m.FavoritesPage),
  },
  {
    path: 'photos/:id',
    title: (route) => `Photo ${route.paramMap.get('id')} | Photo Library`,
    data: { section: 'favorites' },
    // Only favorites have a photo page; others fall through to the not-found route below.
    canMatch: [favoritePhotoGuard],
    loadComponent: () =>
      import('./features/photo-detail/photo-detail-page').then((m) => m.PhotoDetailPage),
  },
  {
    path: '**',
    title: 'Page not found | Photo Library',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];

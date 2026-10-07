import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { FavoritesPage } from './features/favorites/favorites-page';
import { NotFoundPage } from './features/not-found/not-found-page';
import { PhotoDetailPage } from './features/photo-detail/photo-detail-page';
import { PhotosPage } from './features/photos/photos-page';

describe('routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
  });

  it('shows the Photos page on /', async () => {
    await harness.navigateByUrl('/', PhotosPage);
  });

  it('shows the Favorites page on /favorites', async () => {
    await harness.navigateByUrl('/favorites', FavoritesPage);
  });

  it('shows the photo detail page for the ID in /photos/:id', async () => {
    const page = await harness.navigateByUrl('/photos/42', PhotoDetailPage);

    expect(page.id).toBe('42');
  });

  describe('for an unknown path', () => {
    it('shows the not-found page with a link to Photos', async () => {
      await harness.navigateByUrl('/does-not-exist', NotFoundPage);

      const page = harness.routeNativeElement as HTMLElement;
      expect(page.textContent).toContain('page does not exist');
      expect(page.querySelector('a')?.getAttribute('href')).toBe('/');
    });

    it('goes to Photos when the link is activated', async () => {
      await harness.navigateByUrl('/does-not-exist', NotFoundPage);

      (harness.routeNativeElement?.querySelector('a') as HTMLAnchorElement).click();
      await harness.fixture.whenStable();

      expect(TestBed.inject(Router).url).toBe('/');
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { FavoritesPage } from './features/favorites/favorites-page';
import { NotFoundPage } from './features/not-found/not-found-page';
import { PhotoDetailPage } from './features/photo-detail/photo-detail-page';
import { PhotosPage } from './features/photos/photos-page';
import { Favorites } from './core/favorites';
import { LOCAL_STORAGE } from './core/local-storage';
import { PhotoApi } from './core/photo-api';
import { FakeIntersectionObserver } from './testing/fake-intersection-observer';
import { MemoryStorage } from './testing/memory-storage';

describe('routes', () => {
  let harness: RouterTestingHarness;
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: LOCAL_STORAGE, useValue: storage }],
    });
    harness = await RouterTestingHarness.create();
  });

  it('shows the Photos page on /', async () => {
    await harness.navigateByUrl('/', PhotosPage);
  });

  it('shows the Favorites page on /favorites', async () => {
    await harness.navigateByUrl('/favorites', FavoritesPage);
  });

  it('shows the photo detail page for a favorite ID in /photos/:id', async () => {
    TestBed.inject(Favorites).toggle(42);

    await harness.navigateByUrl('/photos/42', PhotoDetailPage);

    expect((harness.routeNativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'Photo 42',
    );
  });

  describe('for a photo that is not a favorite', () => {
    it('shows the not-found page and keeps the URL', async () => {
      await harness.navigateByUrl('/photos/42', NotFoundPage);

      expect(TestBed.inject(Router).url).toBe('/photos/42');
    });

    it.each(['abc', '1.5', '-1'])('shows the not-found page for the ID "%s"', async (id) => {
      await harness.navigateByUrl(`/photos/${id}`, NotFoundPage);
    });
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

describe('Favorites route (integration)', () => {
  let harness: RouterTestingHarness;

  /** Opens `/favorites` with the given favorites already saved. */
  async function openFavorites(saved: number[]): Promise<HTMLElement> {
    const storage = new MemoryStorage();
    storage.setItem('xm-photo-library.favorites.v1', JSON.stringify(saved));
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: LOCAL_STORAGE, useValue: storage }],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/favorites', FavoritesPage);
    return harness.routeNativeElement as HTMLElement;
  }

  it('lists saved favorites newest first and opens a photo from its tile', async () => {
    const page = await openFavorites([7, 3]);

    const links = Array.from(page.querySelectorAll('app-photo-card a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/photos/3', '/photos/7']);

    (links[0] as HTMLAnchorElement).click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/photos/3');
    expect(TestBed.inject(Favorites).ids()).toEqual([7, 3]);
  });

  it('goes to Photos from the empty state', async () => {
    const page = await openFavorites([]);

    (page.querySelector('a') as HTMLAnchorElement).click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/');
  });
});

describe('Photo detail flow (integration)', () => {
  it('opens a favorite from the list, removes it, and cannot reach it again', async () => {
    const storage = new MemoryStorage();
    storage.setItem('xm-photo-library.favorites.v1', '[7,3]');
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: LOCAL_STORAGE, useValue: storage },
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    });
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    const app: HTMLElement = fixture.nativeElement;
    const settle = () => fixture.whenStable();
    const hrefs = () =>
      Array.from(app.querySelectorAll('app-photo-card a'), (a) => a.getAttribute('href'));

    await router.navigateByUrl('/favorites');
    await settle();
    expect(hrefs()).toEqual(['/photos/3', '/photos/7']);

    (app.querySelector('app-photo-card a') as HTMLAnchorElement).click();
    await settle();

    expect(router.url).toBe('/photos/3');
    expect(app.querySelector('h1')?.textContent).toContain('Photo 3');
    expect(app.querySelector('app-header a[aria-current="page"]')?.textContent).toContain(
      'Favorites',
    );

    (app.querySelector('main button') as HTMLButtonElement).click();
    await settle();

    expect(router.url).toBe('/favorites');
    expect(hrefs()).toEqual(['/photos/7']);

    // What going Back to the removed photo does: the router matches the URL again.
    await router.navigateByUrl('/photos/3');
    await settle();

    expect(app.querySelector('h1')?.textContent).toContain('Page not found');
    expect(router.url).toBe('/photos/3');
  });
});

describe('Photos route (integration)', () => {
  let harness: RouterTestingHarness;

  const tileIds = () =>
    Array.from(
      (harness.routeNativeElement as HTMLElement).querySelectorAll('app-photo-card img'),
      (img) => img.getAttribute('alt'),
    );

  beforeEach(async () => {
    // Fake only the interval timers RxJS uses for the API delay; Angular's scheduler keeps real timers.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('loads photos on / and keeps them after visiting Favorites', async () => {
    const getPhotos = vi.spyOn(TestBed.inject(PhotoApi), 'getPhotos');
    await harness.navigateByUrl('/', PhotosPage);

    FakeIntersectionObserver.instances.at(-1)!.report(true);
    await harness.fixture.whenStable();
    FakeIntersectionObserver.instances.at(-1)!.report(false);
    await vi.advanceTimersByTimeAsync(300);
    await harness.fixture.whenStable();

    const firstVisit = tileIds();
    expect(firstVisit).toHaveLength(18);

    await harness.navigateByUrl('/favorites', FavoritesPage);
    await harness.navigateByUrl('/', PhotosPage);

    expect(tileIds()).toEqual(firstVisit);
    expect(getPhotos).toHaveBeenCalledTimes(1);
  });
});

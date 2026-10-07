import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Favorites } from '../../core/favorites';
import { LOCAL_STORAGE } from '../../core/local-storage';
import { MemoryStorage } from '../../testing/memory-storage';
import { PhotoDetailPage } from './photo-detail-page';

@Component({ template: '' })
class FavoritesStub {}

describe('PhotoDetailPage', () => {
  let storage: MemoryStorage;
  let harness: RouterTestingHarness;
  let page: HTMLElement;

  /** Opens `/photos/{id}` with the given favorites already saved. */
  async function open(id: number, saved: number[] = [id]): Promise<void> {
    storage.setItem('xm-photo-library.favorites.v1', JSON.stringify(saved));
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/photos/${id}`, PhotoDetailPage);
    page = harness.routeNativeElement as HTMLElement;
  }

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'photos/:id', component: PhotoDetailPage },
          { path: 'favorites', component: FavoritesStub },
        ]),
        { provide: LOCAL_STORAGE, useValue: storage },
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    });
  });

  it('shows the photo at the large size with its heading and alt text', async () => {
    await open(42);

    const image = page.querySelector('img')!;
    expect(page.querySelector('h1')?.textContent).toContain('Photo 42');
    expect(image.getAttribute('src')).toBe('https://picsum.photos/id/42/1200/800');
    expect(image.getAttribute('alt')).toBe('Photo 42');
    expect(image.getAttribute('fetchpriority')).toBe('high');
  });

  it('removes the favorite, goes to /favorites and confirms with a snackbar', async () => {
    await open(42, [7, 42]);
    const loader = TestbedHarnessEnvironment.documentRootLoader(harness.fixture);

    page.querySelector('button')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Favorites).ids()).toEqual([7]);
    expect(TestBed.inject(Router).url).toBe('/favorites');
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('Photo 42 removed from favorites');
    expect(await snackBar.hasAction()).toBe(false);
  });

  describe('when the image fails to load', () => {
    beforeEach(async () => {
      await open(42, [7, 42]);
      page.querySelector('img')!.dispatchEvent(new Event('error'));
      await harness.fixture.whenStable();
    });

    it('shows "Photo unavailable" instead of the image', () => {
      expect(page.querySelector('img')).toBeNull();
      expect(page.textContent).toContain('Photo unavailable');
    });

    it('still removes the favorite', async () => {
      page.querySelector('button')!.click();
      await harness.fixture.whenStable();

      expect(TestBed.inject(Favorites).has(42)).toBe(false);
      expect(TestBed.inject(Router).url).toBe('/favorites');
    });
  });

  it('follows the ID in the URL when only the ID changes', async () => {
    await open(42, [7, 42]);
    const first = harness.routeDebugElement!.componentInstance;

    await harness.navigateByUrl('/photos/7', PhotoDetailPage);

    expect(harness.routeDebugElement!.componentInstance).toBe(first);
    expect(page.querySelector('h1')?.textContent).toContain('Photo 7');
    expect(page.querySelector('img')?.getAttribute('src')).toBe(
      'https://picsum.photos/id/7/1200/800',
    );
  });

  it('has a Remove from favorites button below the photo', async () => {
    await open(42);

    const button = page.querySelector('button')!;
    expect(button.textContent?.trim()).toBe('Remove from favorites');
    expect(
      page.querySelector('img')!.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

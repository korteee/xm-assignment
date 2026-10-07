import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCAL_STORAGE } from '../../core/local-storage';
import { PhotoApi } from '../../core/photo-api';
import { FakeIntersectionObserver } from '../../testing/fake-intersection-observer';
import { FakePhotoApi, photos } from '../../testing/fake-photo-api';
import { MemoryStorage } from '../../testing/memory-storage';
import { PhotosPage } from './photos-page';

const ids = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

describe('PhotosPage', () => {
  let api: FakePhotoApi;
  let storage: MemoryStorage;
  let fixture: ComponentFixture<PhotosPage>;
  let page: HTMLElement;
  let loader: HarnessLoader;

  /** Makes the sentinel report that it is near the viewport. */
  async function scrollNearEnd(): Promise<void> {
    FakeIntersectionObserver.instances.at(-1)!.report(true);
    await fixture.whenStable();
  }

  /** Makes the sentinel leave the range and come back, as when the user scrolls up and down. */
  async function scrollAwayAndBack(): Promise<void> {
    FakeIntersectionObserver.instances.at(-1)!.report(false);
    await fixture.whenStable();
    await scrollNearEnd();
  }

  async function respond(...photoIds: number[]): Promise<void> {
    api.respond(photos(...photoIds));
    await fixture.whenStable();
  }

  const tiles = () => page.querySelectorAll('app-photo-grid app-photo-card');
  const skeletons = () => page.querySelectorAll('app-photo-grid .skeleton');
  const status = () => page.querySelector('[role="status"]');

  /** Creates the page. Arrange stored favorites before calling this: they restore on creation. */
  async function createPage(): Promise<void> {
    fixture = TestBed.createComponent(PhotosPage);
    page = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    api = new FakePhotoApi();
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [
        { provide: PhotoApi, useValue: api },
        { provide: LOCAL_STORAGE, useValue: storage },
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    });
    await createPage();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('loads the first page when the sentinel is in range and shows it as toggle tiles', async () => {
    await scrollNearEnd();
    expect(api.requests.map((r) => r.params)).toEqual([{ page: 1, limit: 18 }]);

    await respond(...ids(100, 18));

    expect(tiles()).toHaveLength(18);
    expect(tiles()[0].querySelector('button')).not.toBeNull();
  });

  describe('sentinel', () => {
    beforeEach(() => scrollNearEnd());

    it('starts no request while a page is loading', async () => {
      await scrollAwayAndBack();

      expect(api.requests).toHaveLength(1);
    });

    it('starts no request after an error', async () => {
      api.fail();
      await fixture.whenStable();

      await scrollAwayAndBack();

      expect(api.requests).toHaveLength(1);
    });

    it('starts no request at the end of the stream', async () => {
      await respond();

      await scrollAwayAndBack();

      expect(api.requests).toHaveLength(1);
    });
  });

  describe('while a page loads', () => {
    beforeEach(() => scrollNearEnd());

    it('ends the grid with 18 skeleton tiles hidden from screen readers', () => {
      expect(skeletons()).toHaveLength(18);
      for (const skeleton of Array.from(skeletons())) {
        expect(skeleton.getAttribute('aria-hidden')).toBe('true');
      }
    });

    it('announces that photos are loading', () => {
      expect(status()?.textContent).toContain('Loading photos');
    });

    it('replaces the skeleton with the photos when they arrive', async () => {
      // The skeleton tiles push the sentinel out of range while the page loads.
      FakeIntersectionObserver.instances.at(-1)!.report(false);
      await respond(...ids(100, 18));

      expect(skeletons()).toHaveLength(0);
      expect(tiles()).toHaveLength(18);
      expect(status()?.textContent).not.toContain('Loading photos');
    });
  });

  describe('when a page fails', () => {
    const retry = () =>
      Array.from(page.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Retry');

    beforeEach(async () => {
      await scrollNearEnd();
      api.fail();
      await fixture.whenStable();
    });

    it('shows an error with a Retry button', () => {
      expect(status()?.textContent).toContain("Couldn't load photos.");
      expect(retry()).toBeDefined();
    });

    it('loads the same page again on Retry and shows it', async () => {
      retry()!.click();
      await fixture.whenStable();
      expect(api.requests.map((r) => r.params.page)).toEqual([1, 1]);

      FakeIntersectionObserver.instances.at(-1)!.report(false);
      await respond(...ids(100, 18));

      expect(tiles()).toHaveLength(18);
      expect(status()?.textContent).not.toContain("Couldn't load photos.");
      expect(retry()).toBeUndefined();
    });
  });

  describe('favorites', () => {
    /** Loads a page of photos 100-117 and returns the tile button for `id`. */
    async function loadedTile(id: number): Promise<HTMLButtonElement> {
      await scrollNearEnd();
      FakeIntersectionObserver.instances.at(-1)!.report(false);
      await respond(...ids(100, 18));
      return page.querySelectorAll<HTMLButtonElement>('app-photo-card button')[id - 100];
    }

    it('toggles the favorite when a tile is activated', async () => {
      const tile = await loadedTile(100);
      expect(tile.getAttribute('aria-pressed')).toBe('false');

      tile.click();
      await fixture.whenStable();

      expect(tile.getAttribute('aria-pressed')).toBe('true');
      expect(tile.querySelector('mat-icon')?.classList).toContain('filled');
      expect(storage.getItem('xm-photo-library.favorites.v1')).toBe('[100]');

      tile.click();
      await fixture.whenStable();

      expect(tile.getAttribute('aria-pressed')).toBe('false');
      expect(tile.querySelector('mat-icon')?.classList).not.toContain('filled');
    });

    it('confirms each add and remove with a snackbar that has no action', async () => {
      const tile = await loadedTile(100);

      tile.click();
      await fixture.whenStable();
      const added = await loader.getHarness(MatSnackBarHarness);
      expect(await added.getMessage()).toBe('Photo 100 added to favorites');
      expect(await added.hasAction()).toBe(false);

      tile.click();
      await fixture.whenStable();
      const removed = await loader.getHarness(MatSnackBarHarness);
      expect(await removed.getMessage()).toBe('Photo 100 removed from favorites');
    });

    it('keeps keyboard focus on the tile when the snackbar opens', async () => {
      const tile = await loadedTile(100);
      tile.focus();

      tile.click();
      await fixture.whenStable();
      await loader.getHarness(MatSnackBarHarness);

      expect(document.activeElement).toBe(tile);
    });

    it('shows favorites that were saved before the page opened', async () => {
      // The store restores when it is created, so build the page again with saved data.
      TestBed.resetTestingModule();
      storage = new MemoryStorage();
      storage.setItem('xm-photo-library.favorites.v1', '[101]');
      TestBed.configureTestingModule({
        providers: [
          { provide: PhotoApi, useValue: api },
          { provide: LOCAL_STORAGE, useValue: storage },
          { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
        ],
      });
      await createPage();

      await loadedTile(100);

      const tiles = page.querySelectorAll('app-photo-card button');
      expect(tiles[0].getAttribute('aria-pressed')).toBe('false');
      expect(tiles[1].getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('says when the user has seen them all', async () => {
    await scrollNearEnd();
    await respond();

    expect(status()?.textContent).toContain("You've seen them all");
  });

  it('marks the first 6 tiles as priority', async () => {
    await scrollNearEnd();
    FakeIntersectionObserver.instances.at(-1)!.report(false);
    await respond(...ids(100, 18));

    const images = Array.from(page.querySelectorAll('app-photo-card img'));
    expect(images.slice(0, 6).every((img) => img.getAttribute('fetchpriority') === 'high')).toBe(
      true,
    );
    expect(images[6].getAttribute('fetchpriority')).not.toBe('high');
  });
});

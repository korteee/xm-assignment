import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoApi } from '../../core/photo-api';
import { FakeIntersectionObserver } from '../../testing/fake-intersection-observer';
import { FakePhotoApi, photos } from '../../testing/fake-photo-api';
import { PhotosPage } from './photos-page';

const ids = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

describe('PhotosPage', () => {
  let api: FakePhotoApi;
  let fixture: ComponentFixture<PhotosPage>;
  let page: HTMLElement;

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

  beforeEach(async () => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    api = new FakePhotoApi();
    TestBed.configureTestingModule({ providers: [{ provide: PhotoApi, useValue: api }] });
    fixture = TestBed.createComponent(PhotosPage);
    page = fixture.nativeElement;
    await fixture.whenStable();
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

import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { Photo } from './photo';
import { PhotoApi } from './photo-api';

interface Recorded {
  photos?: Photo[];
  completed: boolean;
  error?: unknown;
}

/** Subscribes and records what the request emits. */
function record(request: Observable<Photo[]>): Recorded {
  const result: Recorded = { completed: false };
  request.subscribe({
    next: (photos) => (result.photos = photos),
    complete: () => (result.completed = true),
    error: (error: unknown) => (result.error = error),
  });
  return result;
}

describe('PhotoApi', () => {
  let api: PhotoApi;

  beforeEach(() => {
    vi.useFakeTimers();
    api = TestBed.inject(PhotoApi);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('emits a page of photos with IDs from 0 to 1084, then completes', () => {
    const result = record(api.getPhotos({ page: 1, limit: 18 }));
    vi.advanceTimersByTime(300);

    expect(result.photos).toHaveLength(18);
    for (const { id } of result.photos ?? []) {
      expect(Number.isInteger(id) && id >= 0 && id <= 1084).toBe(true);
    }
    expect(result.completed).toBe(true);
  });

  describe('no repeats', () => {
    it('gives consecutive pages no shared IDs', () => {
      const first = record(api.getPhotos({ page: 1, limit: 18 }));
      const second = record(api.getPhotos({ page: 2, limit: 18 }));
      vi.advanceTimersByTime(300);

      const firstIds = new Set(first.photos?.map(({ id }) => id));
      expect(second.photos?.some(({ id }) => firstIds.has(id))).toBe(false);
    });

    it('gives the same photos when a page is requested again', () => {
      const once = record(api.getPhotos({ page: 3, limit: 18 }));
      const again = record(api.getPhotos({ page: 3, limit: 18 }));
      vi.advanceTimersByTime(300);

      expect(again.photos).toEqual(once.photos);
    });
  });

  describe('end of the stream', () => {
    it('serves every ID from 0 to 1084 exactly once across all pages', () => {
      const ids: number[] = [];
      for (let page = 1; ; page++) {
        const result = record(api.getPhotos({ page, limit: 18 }));
        vi.advanceTimersByTime(300);
        if (!result.photos?.length) break;
        ids.push(...result.photos.map(({ id }) => id));
      }

      expect(ids).toHaveLength(1085);
      expect([...ids].sort((a, b) => a - b)).toEqual(Array.from({ length: 1085 }, (_, i) => i));
    });

    it('gives a shorter last page', () => {
      const result = record(api.getPhotos({ page: 61, limit: 18 }));
      vi.advanceTimersByTime(300);

      expect(result.photos).toHaveLength(5);
    });

    it('gives an empty page past the end, then completes', () => {
      const result = record(api.getPhotos({ page: 62, limit: 18 }));
      vi.advanceTimersByTime(300);

      expect(result.photos).toEqual([]);
      expect(result.completed).toBe(true);
    });
  });

  describe('invalid requests', () => {
    it.each([
      { page: 0, limit: 18 },
      { page: 1, limit: 0 },
      { page: 1.5, limit: 18 },
    ])('errors on subscribe for %o and does not throw when called', (params) => {
      let request: Observable<Photo[]> | undefined;
      expect(() => (request = api.getPhotos(params))).not.toThrow();

      const result = record(request as Observable<Photo[]>);

      expect(result.error).toBeInstanceOf(RangeError);
    });
  });

  describe('order', () => {
    it('is shuffled differently for different random draws', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const firstRun = record(TestBed.inject(PhotoApi).getPhotos({ page: 1, limit: 18 }));
      TestBed.resetTestingModule();
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const secondRun = record(TestBed.inject(PhotoApi).getPhotos({ page: 1, limit: 18 }));
      vi.advanceTimersByTime(300);

      expect(secondRun.photos).not.toEqual(firstRun.photos);
    });
  });

  describe('delay', () => {
    it('emits nothing before 200 ms when the random draw is lowest', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const result = record(api.getPhotos({ page: 1, limit: 18 }));

      vi.advanceTimersByTime(199);
      expect(result.photos).toBeUndefined();

      vi.advanceTimersByTime(1);
      expect(result.photos).toHaveLength(18);
    });

    it('emits at 300 ms and not before when the random draw is highest', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9999);
      const result = record(api.getPhotos({ page: 1, limit: 18 }));

      vi.advanceTimersByTime(299);
      expect(result.photos).toBeUndefined();

      vi.advanceTimersByTime(1);
      expect(result.photos).toHaveLength(18);
    });

    it('draws a new delay for each request', () => {
      vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.9999);
      const fast = record(api.getPhotos({ page: 1, limit: 18 }));
      const slow = record(api.getPhotos({ page: 2, limit: 18 }));

      vi.advanceTimersByTime(200);
      expect(fast.photos).toHaveLength(18);
      expect(slow.photos).toBeUndefined();

      vi.advanceTimersByTime(100);
      expect(slow.photos).toHaveLength(18);
    });
  });
});

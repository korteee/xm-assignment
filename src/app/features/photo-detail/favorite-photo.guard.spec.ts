import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, Route, UrlSegment } from '@angular/router';
import { LOCAL_STORAGE } from '../../core/local-storage';
import { MemoryStorage } from '../../testing/memory-storage';
import { favoritePhotoGuard } from './favorite-photo.guard';

describe('favoritePhotoGuard', () => {
  /** Runs the guard for the path `photos/{id}`; with no `id`, for the path `photos`. */
  function matches(id?: string): unknown {
    const segments = [new UrlSegment('photos', {})];
    if (id !== undefined) {
      segments.push(new UrlSegment(id, {}));
    }
    return TestBed.runInInjectionContext(() =>
      favoritePhotoGuard({} as Route, segments, {} as PartialMatchRouteSnapshot),
    );
  }

  beforeEach(() => {
    const storage = new MemoryStorage();
    storage.setItem('xm-photo-library.favorites.v1', '[42]');
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
  });

  it('matches the path of a favorite photo', () => {
    expect(matches('42')).toBe(true);
  });

  it('does not match a photo that is not a favorite', () => {
    expect(matches('43')).toBe(false);
  });

  it.each(['abc', '1.5', '-1', '', '0x2A', ' 42', '42 '])('does not match the ID "%s"', (id) => {
    expect(matches(id)).toBe(false);
  });

  it('does not match a path with no ID', () => {
    expect(matches()).toBe(false);
  });
});

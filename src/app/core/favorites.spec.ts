import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../testing/memory-storage';
import { Favorites } from './favorites';
import { LOCAL_STORAGE } from './local-storage';

const KEY = 'xm-photo-library.favorites.v1';

describe('Favorites', () => {
  let storage: MemoryStorage;

  /** Creates the store. Arrange stored data before calling this: it restores on creation. */
  function createFavorites(): Favorites {
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
    return TestBed.inject(Favorites);
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('starts with no favorites when nothing is stored', () => {
    const favorites = createFavorites();

    expect(favorites.ids()).toEqual([]);
    expect(favorites.has(42)).toBe(false);
  });

  it('makes a photo a favorite when it is toggled on', () => {
    const favorites = createFavorites();

    expect(favorites.toggle(42)).toBe(true);

    expect(favorites.has(42)).toBe(true);
    expect(favorites.ids()).toEqual([42]);
  });

  it('removes a favorite when it is toggled off', () => {
    const favorites = createFavorites();
    favorites.toggle(42);

    expect(favorites.toggle(42)).toBe(false);

    expect(favorites.has(42)).toBe(false);
    expect(favorites.ids()).toEqual([]);
  });

  it('keeps favorites in the order they were added', () => {
    const favorites = createFavorites();

    [7, 3, 9].forEach((id) => favorites.toggle(id));

    expect(favorites.ids()).toEqual([7, 3, 9]);
  });

  it('moves a photo to the end when it is removed and added again', () => {
    const favorites = createFavorites();
    [7, 3, 9].forEach((id) => favorites.toggle(id));

    favorites.toggle(7);
    favorites.toggle(7);

    expect(favorites.ids()).toEqual([3, 9, 7]);
  });

  describe('remove', () => {
    it('takes a favorite out of the list and saves the change', () => {
      storage.setItem(KEY, '[7,3,9]');
      const favorites = createFavorites();

      favorites.remove(3);

      expect(favorites.ids()).toEqual([7, 9]);
      expect(storage.getItem(KEY)).toBe('[7,9]');
    });

    it('changes nothing for a photo that is not a favorite', () => {
      storage.setItem(KEY, '[7,3]');
      const favorites = createFavorites();
      const setItem = vi.spyOn(storage, 'setItem');

      favorites.remove(42);

      expect(favorites.ids()).toEqual([7, 3]);
      expect(setItem).not.toHaveBeenCalled();
    });
  });

  it('saves every change in localStorage', () => {
    const favorites = createFavorites();

    favorites.toggle(42);

    expect(storage.getItem(KEY)).toBe('[42]');
  });

  it('restores the favorites that were saved', () => {
    storage.setItem(KEY, '[7,3]');

    const favorites = createFavorites();

    expect(favorites.ids()).toEqual([7, 3]);
    expect(favorites.has(3)).toBe(true);
  });

  describe('storage unavailable', () => {
    it('starts empty when reading throws', () => {
      vi.spyOn(storage, 'getItem').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });

      const favorites = createFavorites();

      expect(favorites.ids()).toEqual([]);
    });

    it('keeps the favorite in memory when writing throws', () => {
      vi.spyOn(storage, 'setItem').mockImplementation(() => {
        throw new DOMException('Full', 'QuotaExceededError');
      });
      const favorites = createFavorites();

      expect(() => favorites.toggle(42)).not.toThrow();

      expect(favorites.has(42)).toBe(true);
    });

    it('works in memory when there is no storage', () => {
      TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: null }] });
      const favorites = TestBed.inject(Favorites);

      expect(favorites.ids()).toEqual([]);
      expect(favorites.toggle(42)).toBe(true);
      expect(favorites.has(42)).toBe(true);
    });
  });

  describe('bad stored data', () => {
    it.each(['not json', '{"ids":[1]}', '[1,"2"]', '[1.5]', '[-1]', 'null', '""'])(
      'starts empty when the stored value is %s',
      (stored) => {
        storage.setItem(KEY, stored);

        const favorites = createFavorites();

        expect(favorites.ids()).toEqual([]);
      },
    );

    it('keeps a duplicate ID once, at its first position', () => {
      storage.setItem(KEY, '[7,3,7]');

      const favorites = createFavorites();

      expect(favorites.ids()).toEqual([7, 3]);
    });
  });
});

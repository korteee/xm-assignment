import { computed, inject, Service, signal } from '@angular/core';
import { LOCAL_STORAGE } from './local-storage';

/** Versioned, so a future format can use a new key without misreading old data. */
const STORAGE_KEY = 'xm-photo-library.favorites.v1';

/**
 * The favorite photo IDs, oldest first, saved in `localStorage`. Root-scoped, so every page sees
 * the same favorites.
 */
@Service()
export class Favorites {
  private readonly storage = inject(LOCAL_STORAGE);
  private readonly _ids = signal<readonly number[]>(this.load());
  private readonly idSet = computed(() => new Set(this._ids()));

  /** The favorite photo IDs in the order they were added. */
  readonly ids = this._ids.asReadonly();

  /** Whether the photo is a favorite. */
  has(id: number): boolean {
    return this.idSet().has(id);
  }

  /** Adds the photo to the favorites, or removes it if it is one. Returns whether it is now a favorite. */
  toggle(id: number): boolean {
    const added = !this.has(id);
    this._ids.update((ids) => (added ? [...ids, id] : ids.filter((other) => other !== id)));
    this.save();
    return added;
  }

  /** Removes the photo from the favorites. Does nothing if it is not one. */
  remove(id: number): void {
    if (!this.has(id)) {
      return;
    }
    this._ids.update((ids) => ids.filter((other) => other !== id));
    this.save();
  }

  /** A failed write (blocked storage, full quota) keeps the favorites in memory for the session. */
  private save(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this._ids()));
    } catch {
      // Nothing to do: the in-memory list stays correct.
    }
  }

  /** Anything missing, unreadable or of the wrong shape gives no favorites. */
  private load(): number[] {
    try {
      const stored: unknown = JSON.parse(this.storage?.getItem(STORAGE_KEY) ?? '[]');
      return isIdList(stored) ? [...new Set(stored)] : [];
    } catch {
      return [];
    }
  }
}

function isIdList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((id) => Number.isInteger(id) && id >= 0);
}

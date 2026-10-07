import { Service } from '@angular/core';
import { defer, map, Observable, timer } from 'rxjs';
import { Photo } from './photo';

/**
 * Number of photo IDs, 0 to 1084. Taken from picsum's list endpoint
 * (https://picsum.photos/v2/list). Some IDs in this range do not exist on picsum.
 */
const PHOTO_ID_COUNT = 1085;

/** Bounds of the simulated network delay, in milliseconds (inclusive). */
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;

/** Which page of the stream to load, and how many photos per page. Pages start at 1. */
export interface GetPhotosParams {
  page: number;
  limit: number;
}

/**
 * Fake paged photo API. Serves every photo ID once, in a random order fixed for the life of
 * the service, so pages never overlap and a page requested again returns the same photos.
 */
@Service()
export class PhotoApi {
  private readonly order = shuffle(Array.from({ length: PHOTO_ID_COUNT }, (_, id) => id));

  /**
   * Emits one page of photos after a random 200-300 ms delay, then completes. A page past the
   * end of the stream is empty. Errors with a `RangeError` if `page` or `limit` is not a whole
   * number of at least 1.
   */
  getPhotos({ page, limit }: GetPhotosParams): Observable<Photo[]> {
    // `defer` so each subscription validates, slices and draws its own delay.
    return defer(() => {
      if (!isPositiveWhole(page) || !isPositiveWhole(limit)) {
        throw new RangeError(`Invalid page request: page ${page}, limit ${limit}`);
      }
      const start = (page - 1) * limit;
      const photos = this.order.slice(start, start + limit).map((id) => ({ id }));
      return timer(randomDelay()).pipe(map(() => photos));
    });
  }
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
}

function isPositiveWhole(value: number): boolean {
  return Number.isInteger(value) && value >= 1;
}

/** Fisher-Yates shuffle, in place. */
function shuffle(ids: number[]): number[] {
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

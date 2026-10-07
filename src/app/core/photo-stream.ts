import { inject, Service, signal } from '@angular/core';
import { Photo } from './photo';
import { PhotoApi } from './photo-api';

/** Photos per page of the stream. */
export const PAGE_SIZE = 18;

/** `idle`: ready to load more. `loading`: a page is in flight. `error`: the last page failed. `end`: nothing left. */
export type PhotoStreamStatus = 'idle' | 'loading' | 'error' | 'end';

/**
 * The photostream loaded so far. Root-scoped, so the photos survive navigating away from `/`.
 * Loads one page at a time; after an error the next load retries the same page.
 */
@Service()
export class PhotoStream {
  private readonly api = inject(PhotoApi);
  private readonly _photos = signal<Photo[]>([]);
  private readonly _status = signal<PhotoStreamStatus>('idle');
  private nextPage = 1;

  /** All photos loaded so far, in stream order. */
  readonly photos = this._photos.asReadonly();

  /** What the stream is doing now. */
  readonly status = this._status.asReadonly();

  /** Loads the next page. Does nothing while a page is loading or after the end of the stream. */
  loadNext(): void {
    const status = this._status();
    if (status !== 'idle' && status !== 'error') {
      return;
    }
    this._status.set('loading');
    this.api.getPhotos({ page: this.nextPage, limit: PAGE_SIZE }).subscribe({
      next: (photos) => {
        if (photos.length === 0) {
          this._status.set('end');
          return;
        }
        this._photos.update((loaded) => [...loaded, ...photos]);
        this.nextPage++;
        this._status.set('idle');
      },
      error: () => this._status.set('error'),
    });
  }
}

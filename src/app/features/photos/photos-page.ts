import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { PAGE_SIZE, PhotoStream } from '../../core/photo-stream';
import { InfiniteScroll } from '../../shared/infinite-scroll/infinite-scroll';
import { PhotoCard } from '../../shared/photo-card/photo-card';
import { PhotoGrid } from '../../shared/photo-grid/photo-grid';

/** Photostream page at `/`. */
@Component({
  selector: 'app-photos-page',
  imports: [InfiniteScroll, MatButton, PhotoCard, PhotoGrid],
  styles: `
    .skeleton {
      aspect-ratio: 1;
      border-radius: 12px;
      background: linear-gradient(
          100deg,
          transparent 30%,
          color-mix(in srgb, var(--mat-sys-on-surface) 6%, transparent) 50%,
          transparent 70%
        )
        var(--mat-sys-surface-container-high);
      background-size: 200% 100%;
      animation: shimmer 1.4s linear infinite;
    }

    @keyframes shimmer {
      from {
        background-position: 100% 0;
      }
      to {
        background-position: -100% 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
      }
    }

    .status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 0;
      font: var(--mat-sys-body-large);
    }

    .status p {
      margin: 0;
    }
  `,
  template: `
    <h1>Photos</h1>
    <app-photo-grid>
      @for (photo of stream.photos(); track photo.id; let i = $index) {
        <app-photo-card [photo]="photo" [priority]="i < priorityCount" />
      }
      @if (stream.status() === 'loading') {
        @for (n of skeletons; track n) {
          <div class="skeleton" aria-hidden="true"></div>
        }
      }
    </app-photo-grid>
    <div
      appInfiniteScroll
      [loadMoreDisabled]="stream.status() !== 'idle'"
      (loadMore)="stream.loadNext()"
    ></div>
    <div class="status" role="status">
      @switch (stream.status()) {
        @case ('loading') {
          <span class="visually-hidden">Loading photos</span>
        }
        @case ('error') {
          <p>Couldn't load photos.</p>
          <button matButton="outlined" type="button" (click)="stream.loadNext()">Retry</button>
        }
        @case ('end') {
          <p>You've seen them all</p>
        }
      }
    </div>
  `,
})
export class PhotosPage {
  protected readonly stream = inject(PhotoStream);

  /** Tiles visible on load (two desktop rows) load first; see the photo-card priority input. */
  protected readonly priorityCount = 6;

  /** One skeleton tile per photo in the page that is loading. */
  protected readonly skeletons = Array.from({ length: PAGE_SIZE }, (_, i) => i);
}

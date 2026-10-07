import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Favorites } from '../../core/favorites';
import { PhotoCard } from '../../shared/photo-card/photo-card';
import { PhotoGrid } from '../../shared/photo-grid/photo-grid';

/** Favorites page at `/favorites`. */
@Component({
  selector: 'app-favorites-page',
  imports: [MatButton, PhotoCard, PhotoGrid, RouterLink],
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 0;
      text-align: center;
      font: var(--mat-sys-body-large);
    }

    .empty p {
      margin: 0;
    }

    .empty .title {
      font: var(--mat-sys-title-large);
    }

    .empty a {
      margin-top: 8px;
    }
  `,
  template: `
    <h1>Favorites</h1>
    @if (photos().length) {
      <app-photo-grid>
        @for (photo of photos(); track photo.id; let i = $index) {
          <app-photo-card
            [photo]="photo"
            [favorite]="true"
            [link]="'/photos/' + photo.id"
            [priority]="i < priorityCount"
          />
        }
      </app-photo-grid>
    } @else {
      <div class="empty">
        <p class="title">No favorites yet</p>
        <p>Select a photo on the Photos page to add it here.</p>
        <a matButton="filled" routerLink="/">Browse photos</a>
      </div>
    }
  `,
})
export class FavoritesPage {
  private readonly favorites = inject(Favorites);

  /** Tiles visible on load (two desktop rows) load first; see the photo-card priority input. */
  protected readonly priorityCount = 6;

  /** Newest first. The store keeps oldest first; copy before reversing, which works in place. */
  protected readonly photos = computed(() =>
    [...this.favorites.ids()].reverse().map((id) => ({ id })),
  );
}

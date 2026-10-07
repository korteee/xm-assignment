import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Favorites } from '../../core/favorites';
import { photoUrl } from '../../core/photo';

/** Size of the photo shown on this page. */
const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 800;

const SNACKBAR_DURATION_MS = 3000;

/**
 * Single photo page at `/photos/:id`. The route guard lets only favorite photos reach it, so the
 * ID is always a whole number.
 */
@Component({
  selector: 'app-photo-detail-page',
  imports: [MatButton, NgOptimizedImage],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    h1 {
      align-self: flex-start;
      margin: 0;
    }

    img {
      display: block;
      // The width and height attributes give the 3:2 ratio, so the box shrinks with the photo.
      width: auto;
      height: auto;
      max-width: 100%;
      // Leave room for the header, the heading and the button on short screens.
      max-height: calc(100dvh - 14rem);
      border-radius: 12px;
    }

    .unavailable {
      display: grid;
      place-items: center;
      width: 100%;
      max-width: 1200px;
      aspect-ratio: 3 / 2;
      margin: 0;
      border-radius: 12px;
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-large);
    }
  `,
  template: `
    <h1>Photo {{ id() }}</h1>
    @if (broken()) {
      <p class="unavailable" role="img" [attr.aria-label]="alt() + ' unavailable'">
        Photo unavailable
      </p>
    } @else {
      <img
        [ngSrc]="src()"
        [width]="width"
        [height]="height"
        priority
        [alt]="alt()"
        (error)="broken.set(true)"
      />
    }
    <button matButton="filled" type="button" (click)="remove()">Remove from favorites</button>
  `,
})
export class PhotoDetailPage {
  private readonly favorites = inject(Favorites);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly width = PHOTO_WIDTH;
  protected readonly height = PHOTO_HEIGHT;

  // Reactive, because the router reuses this component when only `:id` changes.
  protected readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => Number(params.get('id')))),
    { requireSync: true },
  );
  protected readonly src = computed(() =>
    photoUrl({ id: this.id(), width: PHOTO_WIDTH, height: PHOTO_HEIGHT }),
  );
  protected readonly alt = computed(() => `Photo ${this.id()}`);

  /** Whether the image failed to load. Resets when the photo changes. */
  protected readonly broken = linkedSignal({ source: this.id, computation: () => false });

  /** Removes the photo from the favorites, then goes to the Favorites page and confirms. */
  protected remove(): void {
    const id = this.id();
    this.favorites.remove(id);
    this.router.navigateByUrl('/favorites');
    this.snackBar.open(`Photo ${id} removed from favorites`, undefined, {
      duration: SNACKBAR_DURATION_MS,
    });
  }
}

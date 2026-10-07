import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Photo, photoUrl } from '../../core/photo';

/** Square photo tile, used inside `app-photo-grid`. */
@Component({
  selector: 'app-photo-card',
  imports: [MatIcon, NgOptimizedImage, NgTemplateOutlet, RouterLink],
  host: { role: 'listitem' },
  styles: `
    :host {
      display: block;
    }

    a,
    button {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: 1;
      padding: 0;
      border: 0;
      border-radius: 12px;
      overflow: hidden;
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface);
      cursor: pointer;
    }

    a:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--mat-sys-primary);
      outline-offset: 2px;
    }

    img {
      object-fit: cover;
    }

    .placeholder {
      display: grid;
      place-items: center;
      height: 100%;
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface-variant);
    }

    mat-icon {
      position: absolute;
      right: 8px;
      bottom: 8px;
      padding: 6px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--mat-sys-scrim) 55%, transparent);
      color: #fff;
    }

    mat-icon.filled {
      font-variation-settings: 'FILL' 1;
      color: var(--mat-sys-error);
    }
  `,
  template: `
    @if (link(); as link) {
      <a [routerLink]="link"><ng-container [ngTemplateOutlet]="content" /></a>
    } @else {
      <button
        type="button"
        [attr.aria-pressed]="favorite()"
        [attr.aria-disabled]="broken() || null"
        (click)="toggle()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    }

    <ng-template #content>
      @if (broken()) {
        <span class="placeholder" role="img" [attr.aria-label]="alt() + ' unavailable'">
          Photo unavailable
        </span>
      } @else {
        <img
          [ngSrc]="src()"
          fill
          [priority]="priority()"
          sizes="(min-width: 960px) 33vw, (min-width: 600px) 50vw, 100vw"
          [alt]="alt()"
          (error)="broken.set(true)"
        />
      }
      <mat-icon aria-hidden="true" fontIcon="favorite" [class.filled]="favorite()" />
    </ng-template>
  `,
})
export class PhotoCard {
  /** The photo to show. */
  readonly photo = input.required<Photo>();

  /** Whether the photo is a favorite: fills the heart and marks the button pressed. */
  readonly favorite = input(false);

  /** Load the image first, for tiles in the first visible row. */
  readonly priority = input(false);

  /** URL the tile links to. Without it the tile is a button that asks to toggle the favorite. */
  readonly link = input<string>();

  /** Emits the photo when the user activates the tile. The card does not change the favorite itself. */
  readonly toggleFavorite = output<Photo>();

  protected readonly src = computed(() =>
    photoUrl({ id: this.photo().id, width: 400, height: 400 }),
  );
  protected readonly alt = computed(() => `Photo ${this.photo().id}`);

  /** Whether the image failed to load. Resets when the photo changes. */
  protected readonly broken = linkedSignal({ source: this.photo, computation: () => false });

  // aria-disabled instead of disabled keeps a broken tile focusable.
  protected toggle(): void {
    if (!this.broken()) {
      this.toggleFavorite.emit(this.photo());
    }
  }
}

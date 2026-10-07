import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

/** Header section a route belongs to. Set as `data: { section }` on a route. */
export type Section = 'photos' | 'favorites';

/** App header with links to the photostream and the Favorites list. */
@Component({
  selector: 'app-header',
  imports: [MatButton, RouterLink],
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 1;
      display: block;
      background: var(--mat-sys-surface-container);
    }

    nav {
      display: flex;
      gap: 8px;
      padding: 8px 16px;
    }

    .active {
      --mat-button-text-label-text-color: var(--mat-sys-on-secondary-container);
      background: var(--mat-sys-secondary-container);
    }
  `,
  template: `
    <nav aria-label="Main">
      <a
        matButton
        routerLink="/"
        [class.active]="section() === 'photos'"
        [attr.aria-current]="section() === 'photos' ? 'page' : null"
        >Photos</a
      >
      <a
        matButton
        routerLink="/favorites"
        [class.active]="section() === 'favorites'"
        [attr.aria-current]="section() === 'favorites' ? 'page' : null"
        >Favorites</a
      >
    </nav>
  `,
})
export class AppHeader {
  private readonly router = inject(Router);

  /** The section of the current route, or `undefined` when it has none. */
  protected readonly section = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => sectionOf(this.router.routerState.snapshot.root)),
    ),
  );
}

function sectionOf(route: ActivatedRouteSnapshot): Section | undefined {
  let leaf = route;
  while (leaf.firstChild) {
    leaf = leaf.firstChild;
  }
  return leaf.data['section'];
}

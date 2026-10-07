import { Component } from '@angular/core';

/** Responsive grid of photo tiles. Place `app-photo-card` elements inside it. */
@Component({
  selector: 'app-photo-grid',
  host: { role: 'list' },
  styles: `
    :host {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    @media (min-width: 600px) {
      :host {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 960px) {
      :host {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `,
  template: '<ng-content />',
})
export class PhotoGrid {}

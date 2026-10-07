import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './shared/app-header/app-header';

@Component({
  imports: [AppHeader, RouterOutlet],
  selector: 'app-root',
  styles: `
    main {
      padding: 16px;
    }
  `,
  template: `
    <app-header />
    <main><router-outlet /></main>
  `,
})
export class App {}

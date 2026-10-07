import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

/** Shown for any path that matches no route. */
@Component({
  selector: 'app-not-found-page',
  imports: [MatButton, RouterLink],
  template: `
    <h1>Page not found</h1>
    <p>This page does not exist.</p>
    <a matButton="filled" routerLink="/">Back to Photos</a>
  `,
})
export class NotFoundPage {}

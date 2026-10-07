import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Single photo page at `/photos/:id`. Placeholder until the detail view is built. */
@Component({
  selector: 'app-photo-detail-page',
  template: '<h1>Photo {{ id }}</h1>',
})
export class PhotoDetailPage {
  /** The photo ID from the URL. */
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
}

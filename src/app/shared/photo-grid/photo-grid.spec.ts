import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PhotoCard } from '../photo-card/photo-card';
import { PhotoGrid } from './photo-grid';

@Component({
  imports: [PhotoCard, PhotoGrid],
  template: `
    <app-photo-grid>
      @for (id of ids; track id) {
        <app-photo-card [photo]="{ id }" />
      }
    </app-photo-grid>
  `,
})
class Host {
  readonly ids = [1, 2, 3];
}

describe('PhotoGrid', () => {
  it('is a list whose items are the projected cards', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const grid = (fixture.nativeElement as HTMLElement).querySelector('app-photo-grid');

    expect(grid?.getAttribute('role')).toBe('list');
    const items = grid?.querySelectorAll(':scope > [role="listitem"]');
    expect(items?.length).toBe(3);
  });
});

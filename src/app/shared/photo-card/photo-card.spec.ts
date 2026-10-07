import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PhotoCard } from './photo-card';

@Component({ template: '' })
class StubPage {}

describe('PhotoCard', () => {
  let fixture: ComponentFixture<PhotoCard>;
  let card: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'photos/:id', component: StubPage }])],
    });
    fixture = TestBed.createComponent(PhotoCard);
    fixture.componentRef.setInput('photo', { id: 42 });
    await fixture.whenStable();
    card = fixture.nativeElement;
  });

  it('shows the photo at grid size with alt text', () => {
    const img = card.querySelector('img');

    expect(img?.getAttribute('src')).toBe('https://picsum.photos/id/42/400/400');
    expect(img?.getAttribute('alt')).toBe('Photo 42');
  });

  it('is a list item', () => {
    expect(card.getAttribute('role')).toBe('listitem');
  });

  describe('toggle mode', () => {
    const button = () => card.querySelector('button');

    it('is a button that asks to toggle the favorite when activated', () => {
      const emitted: unknown[] = [];
      fixture.componentInstance.toggleFavorite.subscribe((photo) => emitted.push(photo));

      button()?.click();

      expect(button()?.getAttribute('type')).toBe('button');
      expect(emitted).toEqual([{ id: 42 }]);
    });

    it('is marked pressed only when the photo is a favorite', async () => {
      expect(button()?.getAttribute('aria-pressed')).toBe('false');

      fixture.componentRef.setInput('favorite', true);
      await fixture.whenStable();

      expect(button()?.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('link mode', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('link', '/photos/42');
      await fixture.whenStable();
    });

    it('is a link to the given URL instead of a button', () => {
      expect(card.querySelector('a')?.getAttribute('href')).toBe('/photos/42');
      expect(card.querySelector('button')).toBeNull();
    });

    it('navigates when activated and does not ask to toggle', async () => {
      const emitted: unknown[] = [];
      fixture.componentInstance.toggleFavorite.subscribe((photo) => emitted.push(photo));

      card.querySelector('a')?.click();
      await fixture.whenStable();

      expect(TestBed.inject(Router).url).toBe('/photos/42');
      expect(emitted).toEqual([]);
    });
  });

  describe('broken image', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('photo', { id: 86 });
      await fixture.whenStable();
      card.querySelector('img')?.dispatchEvent(new Event('error'));
      await fixture.whenStable();
    });

    it('shows a placeholder that still names the photo', () => {
      const placeholder = card.querySelector('[role="img"]');

      expect(card.querySelector('img')).toBeNull();
      expect(placeholder?.textContent?.trim()).toBe('Photo unavailable');
      expect(placeholder?.getAttribute('aria-label')).toBe('Photo 86 unavailable');
    });

    it('cannot be favorited but stays focusable', () => {
      const emitted: unknown[] = [];
      fixture.componentInstance.toggleFavorite.subscribe((photo) => emitted.push(photo));
      const button = card.querySelector('button');

      button?.click();

      expect(emitted).toEqual([]);
      expect(button?.getAttribute('aria-disabled')).toBe('true');
      expect(button?.disabled).toBe(false);
    });
  });

  describe('priority', () => {
    it('loads lazily by default', () => {
      expect(card.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    });

    it('loads eagerly with high fetch priority when marked as priority', async () => {
      // NgOptimizedImage reads priority once, so it is set before the first render.
      const priorityFixture = TestBed.createComponent(PhotoCard);
      priorityFixture.componentRef.setInput('photo', { id: 42 });
      priorityFixture.componentRef.setInput('priority', true);
      await priorityFixture.whenStable();
      const img = (priorityFixture.nativeElement as HTMLElement).querySelector('img');

      expect(img?.getAttribute('loading')).toBe('eager');
      expect(img?.getAttribute('fetchpriority')).toBe('high');
    });
  });

  describe('heart', () => {
    const heart = () => card.querySelector('mat-icon');

    it('is outlined and decorative when the photo is not a favorite', () => {
      expect(heart()?.getAttribute('aria-hidden')).toBe('true');
      expect(heart()?.classList.contains('filled')).toBe(false);
    });

    it('is filled when the photo is a favorite', async () => {
      fixture.componentRef.setInput('favorite', true);
      await fixture.whenStable();

      expect(heart()?.classList.contains('filled')).toBe(true);
    });
  });
});

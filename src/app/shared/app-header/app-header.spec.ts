import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  let header: HTMLElement;
  let navigate: (url: string) => Promise<void>;

  const link = (name: string) =>
    Array.from(header.querySelectorAll('a')).find((a) => a.textContent?.trim() === name);

  const isActive = (name: string) =>
    link(name)?.classList.contains('active') && link(name)?.getAttribute('aria-current') === 'page';

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(AppHeader);
    header = fixture.nativeElement;
    navigate = async (url) => {
      await TestBed.inject(Router).navigateByUrl(url);
      await fixture.whenStable();
    };
    await fixture.whenStable();
  });

  it('has a Photos link to / and a Favorites link to /favorites', () => {
    expect(link('Photos')?.getAttribute('href')).toBe('/');
    expect(link('Favorites')?.getAttribute('href')).toBe('/favorites');
  });

  it('highlights Photos on /', async () => {
    await navigate('/');

    expect(isActive('Photos')).toBe(true);
    expect(isActive('Favorites')).toBe(false);
  });

  it('highlights Favorites on /favorites', async () => {
    await navigate('/favorites');

    expect(isActive('Favorites')).toBe(true);
    expect(isActive('Photos')).toBe(false);
  });

  it('keeps Favorites highlighted on a photo detail page', async () => {
    await navigate('/photos/42');

    expect(isActive('Favorites')).toBe(true);
    expect(isActive('Photos')).toBe(false);
  });

  it('highlights nothing on an unknown path', async () => {
    await navigate('/does-not-exist');

    expect(isActive('Photos')).toBe(false);
    expect(isActive('Favorites')).toBe(false);
  });
});

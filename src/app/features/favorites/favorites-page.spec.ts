import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Favorites } from '../../core/favorites';
import { LOCAL_STORAGE } from '../../core/local-storage';
import { MemoryStorage } from '../../testing/memory-storage';
import { FavoritesPage } from './favorites-page';

describe('FavoritesPage', () => {
  let storage: MemoryStorage;
  let fixture: ComponentFixture<FavoritesPage>;
  let page: HTMLElement;

  /** Creates the page. Arrange saved favorites before calling this: they restore on creation. */
  async function createPage(saved: number[] = []): Promise<void> {
    storage.setItem('xm-photo-library.favorites.v1', JSON.stringify(saved));
    fixture = TestBed.createComponent(FavoritesPage);
    page = fixture.nativeElement;
    await fixture.whenStable();
  }

  const tiles = () => Array.from(page.querySelectorAll('app-photo-grid app-photo-card'));

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: LOCAL_STORAGE, useValue: storage }],
    });
  });

  it('lists every favorite in the grid with a filled heart', async () => {
    await createPage([7, 3, 9]);

    expect(page.querySelector('h1')?.textContent).toContain('Favorites');
    expect(tiles()).toHaveLength(3);
    for (const tile of tiles()) {
      expect(tile.querySelector('mat-icon')?.classList).toContain('filled');
    }
  });

  it('shows the most recently added favorite first', async () => {
    await createPage([7, 3, 9]);

    const alts = Array.from(page.querySelectorAll('app-photo-card img'), (img) =>
      img.getAttribute('alt'),
    );
    expect(alts).toEqual(['Photo 9', 'Photo 3', 'Photo 7']);
  });

  it('links each tile to its photo page and has no toggle buttons', async () => {
    await createPage([7, 3, 9]);

    const hrefs = Array.from(page.querySelectorAll('app-photo-card a'), (a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/photos/9', '/photos/3', '/photos/7']);
    expect(page.querySelector('app-photo-card button')).toBeNull();
  });

  it('marks the first 6 tiles as priority', async () => {
    await createPage([1, 2, 3, 4, 5, 6, 7, 8]);

    const images = Array.from(page.querySelectorAll('app-photo-card img'));
    expect(images.slice(0, 6).every((img) => img.getAttribute('fetchpriority') === 'high')).toBe(
      true,
    );
    expect(images[6].getAttribute('fetchpriority')).not.toBe('high');
  });

  describe('with no favorites', () => {
    beforeEach(() => createPage());

    it('shows a message and a link to Photos instead of a grid', () => {
      expect(page.textContent).toContain('No favorites yet');
      expect(page.textContent).toContain('Select a photo on the Photos page to add it here.');
      expect(page.querySelector('a')?.getAttribute('href')).toBe('/');
      expect(page.querySelector('a')?.textContent).toContain('Browse photos');
      expect(page.querySelector('app-photo-grid')).toBeNull();
      expect(page.querySelector('h1')?.textContent).toContain('Favorites');
    });

    it('shows a photo as soon as it becomes a favorite', async () => {
      TestBed.inject(Favorites).toggle(42);
      await fixture.whenStable();

      expect(tiles()).toHaveLength(1);
      expect(page.querySelector('app-photo-card img')?.getAttribute('alt')).toBe('Photo 42');
      expect(page.textContent).not.toContain('No favorites yet');
    });
  });
});

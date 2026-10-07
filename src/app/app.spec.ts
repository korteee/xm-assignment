import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a router outlet and no starter content', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('router-outlet')).not.toBeNull();
    expect(root.querySelector('h1')).toBeNull();
  });

  it.each(['/', '/favorites', '/photos/42', '/does-not-exist'])(
    'shows the header on %s',
    async (url) => {
      const fixture = TestBed.createComponent(App);
      await TestBed.inject(Router).navigateByUrl(url);
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).querySelector('app-header')).not.toBeNull();
    },
  );
});

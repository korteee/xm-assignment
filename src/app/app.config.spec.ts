import { ViewportScroller } from '@angular/common';
import { ApplicationRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { App } from './app';
import { appConfig } from './app.config';

// The router starts its scroller only when an application bootstraps, so these tests bootstrap
// the real app with the real config and fake only the browser's viewport.
describe('appConfig scroll restoration', () => {
  let appRef: ApplicationRef;
  let router: Router;
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    history.replaceState(null, '', '/');
    document.body.appendChild(document.createElement('app-root'));
    scrollTo = vi.fn();
    const viewport = {
      getScrollPosition: () => [0, 500],
      scrollToPosition: scrollTo,
      scrollToAnchor: vi.fn(),
      setHistoryScrollRestoration: vi.fn(),
      setOffset: vi.fn(),
    };

    appRef = await bootstrapApplication(App, {
      providers: [...appConfig.providers, { provide: ViewportScroller, useValue: viewport }],
    });
    router = appRef.injector.get(Router);
    await appRef.whenStable();
  });

  afterEach(() => {
    appRef.destroy();
    document.querySelector('app-root')?.remove();
  });

  it('scrolls to the top on a new navigation', async () => {
    await router.navigateByUrl('/favorites');

    expect(scrollTo).toHaveBeenLastCalledWith([0, 0]);
  });

  it('restores the saved position when going back', async () => {
    await router.navigateByUrl('/favorites');
    scrollTo.mockClear();

    history.back();

    await vi.waitFor(() => expect(scrollTo).toHaveBeenCalledWith([0, 500], expect.anything()));
  });
});

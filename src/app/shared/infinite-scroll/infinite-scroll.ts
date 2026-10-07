import {
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

/** Starts loading when the sentinel is this far below the bottom of the viewport. */
const LOAD_AHEAD_MARGIN = '0px 0px 300px 0px';

/**
 * Infinite scroll on a sentinel element placed after a list. Emits `loadMore` when the
 * sentinel comes within 300 px of the viewport and the page is ready for more.
 */
@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScroll {
  /** Ignore the sentinel while true, for example while a page is loading or at the end. */
  readonly loadMoreDisabled = input(false);

  /** Emits when the page should load more content. */
  readonly loadMore = output<void>();

  private readonly inRange = signal(false);

  constructor() {
    const element = inject(ElementRef).nativeElement as Element;
    let observer: IntersectionObserver | undefined;

    afterNextRender(() => {
      observer = new IntersectionObserver(([entry]) => this.inRange.set(entry.isIntersecting), {
        rootMargin: LOAD_AHEAD_MARGIN,
      });
      observer.observe(element);
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());

    // One rule for every case: emit when the sentinel is in range and loading is enabled.
    // Entering the range and being enabled again while still in range both re-run it.
    effect(() => {
      if (this.inRange() && !this.loadMoreDisabled()) {
        untracked(() => this.loadMore.emit());
      }
    });
  }
}

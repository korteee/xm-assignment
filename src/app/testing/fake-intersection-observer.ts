/**
 * Stand-in for the browser's IntersectionObserver that tests drive by hand.
 * Install it with `vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)`.
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  disconnect(): void {
    this.disconnected = true;
    this.observed.length = 0;
  }

  /** Reports every observed element as in or out of range. */
  report(isIntersecting: boolean): void {
    const entries = this.observed.map(
      (target) => ({ isIntersecting, target }) as unknown as IntersectionObserverEntry,
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

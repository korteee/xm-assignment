import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FakeIntersectionObserver } from '../../testing/fake-intersection-observer';
import { InfiniteScroll } from './infinite-scroll';

@Component({
  imports: [InfiniteScroll],
  template: `
    <div appInfiniteScroll [loadMoreDisabled]="disabled()" (loadMore)="loads = loads + 1"></div>
  `,
})
class Host {
  readonly disabled = signal(false);
  loads = 0;
}

describe('InfiniteScroll', () => {
  let fixture: ComponentFixture<Host>;
  let sentinel: HTMLElement;

  beforeEach(async () => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    sentinel = (fixture.nativeElement as HTMLElement).querySelector('[appInfiniteScroll]')!;
  });

  afterEach(() => vi.unstubAllGlobals());

  /** Makes the fake observer report the sentinel as in or out of range. */
  async function report(isIntersecting: boolean): Promise<void> {
    const [observer] = FakeIntersectionObserver.instances;
    const entry = { isIntersecting, target: sentinel } as unknown as IntersectionObserverEntry;
    observer.callback([entry], observer as unknown as IntersectionObserver);
    await fixture.whenStable();
  }

  it('observes its element with a 300 px margin below the viewport', () => {
    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    const [observer] = FakeIntersectionObserver.instances;
    expect(observer.options?.rootMargin).toBe('0px 0px 300px 0px');
    expect(observer.observed).toEqual([sentinel]);
  });

  it('asks for more when the sentinel comes into range', async () => {
    await report(true);

    expect(fixture.componentInstance.loads).toBe(1);
  });

  it('does not ask for more while the sentinel is out of range', async () => {
    await report(false);

    expect(fixture.componentInstance.loads).toBe(0);
  });

  it('asks only once while the sentinel stays in range', async () => {
    await report(true);
    await report(true);

    expect(fixture.componentInstance.loads).toBe(1);
  });

  describe('while disabled', () => {
    beforeEach(async () => {
      fixture.componentInstance.disabled.set(true);
      await fixture.whenStable();
    });

    it('does not ask for more when the sentinel comes into range', async () => {
      await report(true);

      expect(fixture.componentInstance.loads).toBe(0);
    });

    it('asks once when enabled again while the sentinel is still in range', async () => {
      await report(true);

      fixture.componentInstance.disabled.set(false);
      await fixture.whenStable();

      expect(fixture.componentInstance.loads).toBe(1);
    });

    it('does not ask when enabled again after the sentinel left the range', async () => {
      await report(true);
      await report(false);

      fixture.componentInstance.disabled.set(false);
      await fixture.whenStable();

      expect(fixture.componentInstance.loads).toBe(0);
    });
  });

  it('stops observing when destroyed', async () => {
    const [observer] = FakeIntersectionObserver.instances;
    const loadsBefore = fixture.componentInstance.loads;

    fixture.destroy();
    const entry = {
      isIntersecting: true,
      target: sentinel,
    } as unknown as IntersectionObserverEntry;
    observer.callback([entry], observer as unknown as IntersectionObserver);

    expect(observer.disconnected).toBe(true);
    expect(fixture.componentInstance.loads).toBe(loadsBefore);
  });
});

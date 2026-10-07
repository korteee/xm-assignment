import { TestBed } from '@angular/core/testing';
import { LOCAL_STORAGE } from './local-storage';

describe('LOCAL_STORAGE', () => {
  it('is the browser localStorage', () => {
    expect(TestBed.inject(LOCAL_STORAGE)).toBe(window.localStorage);
  });

  it('is null when the browser blocks localStorage', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(TestBed.inject(LOCAL_STORAGE)).toBeNull();
  });
});

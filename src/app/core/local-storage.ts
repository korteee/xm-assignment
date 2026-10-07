import { InjectionToken } from '@angular/core';

/**
 * The browser's `localStorage`, or `null` when the browser blocks it (reading the property
 * throws). Tests provide an in-memory `Storage` instead.
 */
export const LOCAL_STORAGE = new InjectionToken<Storage | null>('LOCAL_STORAGE', {
  factory: () => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  },
});

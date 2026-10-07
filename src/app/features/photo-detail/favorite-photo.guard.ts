import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Favorites } from '../../core/favorites';

/**
 * Lets `photos/:id` match only for a current favorite. For anything else the router skips the
 * route and falls through to the not-found route, so the URL stays as typed.
 */
export const favoritePhotoGuard: CanMatchFn = (_route, segments) => {
  // `canMatch` runs before route params exist, so read the ID from the URL segments.
  // Digits only: `Number()` alone would accept " 42", "0x2A" and "1e1".
  const id = segments[1]?.path ?? '';
  return /^\d+$/.test(id) && inject(Favorites).has(Number(id));
};

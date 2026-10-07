import { photoUrl } from './photo';

describe('photoUrl', () => {
  it('builds the picsum URL for a photo ID and size', () => {
    expect(photoUrl({ id: 42, width: 400, height: 300 })).toBe(
      'https://picsum.photos/id/42/400/300',
    );
  });

  it('builds the URL for the same photo at another size', () => {
    expect(photoUrl({ id: 42, width: 1200, height: 800 })).toBe(
      'https://picsum.photos/id/42/1200/800',
    );
  });
});

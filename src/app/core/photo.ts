/** A photo, identified by its picsum ID. */
export interface Photo {
  readonly id: number;
}

/** Which photo to show and at what size. */
export interface PhotoUrlParams {
  id: number;
  width: number;
  height: number;
}

/** Image URL for one specific photo at the given size. The same ID gives the same photo at any size. */
export function photoUrl({ id, width, height }: PhotoUrlParams): string {
  return `https://picsum.photos/id/${id}/${width}/${height}`;
}

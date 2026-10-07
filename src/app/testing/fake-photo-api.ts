import { Observable, Subject } from 'rxjs';
import { Photo } from '../core/photo';
import { GetPhotosParams } from '../core/photo-api';

/** Photo API whose requests the test answers by hand. Provide it as `PhotoApi`. */
export class FakePhotoApi {
  readonly requests: { params: GetPhotosParams; response: Subject<Photo[]> }[] = [];

  getPhotos(params: GetPhotosParams): Observable<Photo[]> {
    const response = new Subject<Photo[]>();
    this.requests.push({ params, response });
    return response;
  }

  /** Answers the latest request with photos and completes it. */
  respond(photos: Photo[]): void {
    const { response } = this.requests.at(-1)!;
    response.next(photos);
    response.complete();
  }

  /** Fails the latest request. */
  fail(): void {
    this.requests.at(-1)!.response.error(new Error('Request failed'));
  }
}

/** Photos with the given IDs. */
export const photos = (...ids: number[]): Photo[] => ids.map((id) => ({ id }));

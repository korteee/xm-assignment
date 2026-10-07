import { TestBed } from '@angular/core/testing';
import { FakePhotoApi, photos as page } from '../testing/fake-photo-api';
import { PhotoApi } from './photo-api';
import { PhotoStream } from './photo-stream';

describe('PhotoStream', () => {
  let api: FakePhotoApi;
  let stream: PhotoStream;

  beforeEach(() => {
    api = new FakePhotoApi();
    TestBed.configureTestingModule({ providers: [{ provide: PhotoApi, useValue: api }] });
    stream = TestBed.inject(PhotoStream);
  });

  it('starts empty and idle', () => {
    expect(stream.photos()).toEqual([]);
    expect(stream.status()).toBe('idle');
  });

  it('loads the first page of 18 and stores its photos', () => {
    stream.loadNext();

    expect(stream.status()).toBe('loading');
    expect(api.requests.map((r) => r.params)).toEqual([{ page: 1, limit: 18 }]);

    api.respond(page(5, 9));

    expect(stream.photos()).toEqual(page(5, 9));
    expect(stream.status()).toBe('idle');
  });

  it('appends the next page after the loaded photos', () => {
    stream.loadNext();
    api.respond(page(5, 9));

    stream.loadNext();
    api.respond(page(3));

    expect(api.requests.at(-1)?.params).toEqual({ page: 2, limit: 18 });
    expect(stream.photos()).toEqual(page(5, 9, 3));
  });

  it('makes one request at a time', () => {
    stream.loadNext();
    stream.loadNext();

    expect(api.requests).toHaveLength(1);
  });

  it('keeps the photos on error and retries the same page', () => {
    stream.loadNext();
    api.respond(page(5));
    stream.loadNext();

    api.fail();

    expect(stream.status()).toBe('error');
    expect(stream.photos()).toEqual(page(5));

    stream.loadNext();
    expect(api.requests.at(-1)?.params).toEqual({ page: 2, limit: 18 });
    api.respond(page(7));

    expect(stream.status()).toBe('idle');
    expect(stream.photos()).toEqual(page(5, 7));
  });

  it('ends on an empty page and makes no more requests', () => {
    stream.loadNext();
    api.respond(page(5));
    stream.loadNext();
    api.respond([]);

    expect(stream.status()).toBe('end');

    stream.loadNext();
    expect(api.requests).toHaveLength(2);
    expect(stream.photos()).toEqual(page(5));
  });
});

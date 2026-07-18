import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { mapAuthLinkError } from './map-auth-link-error.helper';

describe('mapAuthLinkError', () => {
  it.each([400, 404, 409, 410])('maps status %s to the link-invalid code', (status) => {
    const error = new HttpError({ kind: HTTP_ERROR_KIND.NotFound, status });

    expect(mapAuthLinkError(error).code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
  });

  it('maps other transport failures through the shared mapper', () => {
    const error = new HttpError({ kind: HTTP_ERROR_KIND.Server, status: 500 });

    expect(mapAuthLinkError(error).code).toBe(APP_ERROR_CODE.Server);
  });

  it('maps a transport error without a status through the shared mapper', () => {
    const error = new HttpError({ kind: HTTP_ERROR_KIND.Network });

    expect(mapAuthLinkError(error).code).toBe(APP_ERROR_CODE.NetworkOffline);
  });

  it('wraps a non-transport error as an unexpected AppError', () => {
    expect(mapAuthLinkError(new Error('boom')).code).toBe(APP_ERROR_CODE.Unexpected);
  });
});

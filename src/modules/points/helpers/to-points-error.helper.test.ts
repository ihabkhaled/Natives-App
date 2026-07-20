import { describe, expect, it } from 'vitest';

import { HttpError, HTTP_ERROR_KIND } from '@/packages/http';
import { AppError } from '@/shared/errors/app.errors';

import { runPointsRequest } from './to-points-error.helper';

describe('runPointsRequest', () => {
  it('returns the standings when the request succeeds', async () => {
    await expect(runPointsRequest(() => Promise.resolve(42))).resolves.toBe(42);
  });

  it('normalizes a transport failure into a sanitized AppError', async () => {
    const failure = runPointsRequest(() =>
      Promise.reject(
        new HttpError({ kind: HTTP_ERROR_KIND.Server, status: 500, message: 'raw backend copy' }),
      ),
    );

    await expect(failure).rejects.toBeInstanceOf(AppError);
  });

  it('normalizes an unexpected throw into an AppError as well', async () => {
    await expect(runPointsRequest(() => Promise.reject(new Error('boom')))).rejects.toBeInstanceOf(
      AppError,
    );
  });
});

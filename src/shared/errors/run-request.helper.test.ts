import { describe, expect, it } from 'vitest';

import { HttpError, HTTP_ERROR_KIND } from '@/packages/http';

import { AppError } from './app.errors';
import { runRequest } from './run-request.helper';

describe('runRequest', () => {
  it('returns the request result when nothing fails', async () => {
    await expect(runRequest(() => Promise.resolve('record'))).resolves.toBe('record');
  });

  it('never lets a raw backend message through a transport failure', async () => {
    const failure = runRequest(() =>
      Promise.reject(
        new HttpError({
          kind: HTTP_ERROR_KIND.Forbidden,
          status: 403,
          message: 'candidate.one@example.test is restricted',
        }),
      ),
    );

    await expect(failure).rejects.toBeInstanceOf(AppError);
  });

  it('normalizes an unexpected throw into an AppError as well', async () => {
    await expect(runRequest(() => Promise.reject(new Error('boom')))).rejects.toBeInstanceOf(
      AppError,
    );
  });
});

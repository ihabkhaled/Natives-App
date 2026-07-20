import { describe, expect, it } from 'vitest';

import { HttpError, HTTP_ERROR_KIND } from '@/packages/http';
import { AppError } from '@/shared/errors/app.errors';

import { runTrainingRequest } from './to-training-error.helper';

describe('runTrainingRequest', () => {
  it('returns the request result when nothing fails', async () => {
    await expect(runTrainingRequest(() => Promise.resolve('claim'))).resolves.toBe('claim');
  });

  it('normalizes a transport failure into a sanitized AppError', async () => {
    const failure = runTrainingRequest(() =>
      Promise.reject(
        new HttpError({
          kind: HTTP_ERROR_KIND.Forbidden,
          status: 403,
          message: 'raw backend copy',
        }),
      ),
    );

    await expect(failure).rejects.toBeInstanceOf(AppError);
  });

  it('normalizes an unexpected throw into an AppError as well', async () => {
    const failure = runTrainingRequest(() => Promise.reject(new Error('boom')));

    await expect(failure).rejects.toBeInstanceOf(AppError);
  });
});

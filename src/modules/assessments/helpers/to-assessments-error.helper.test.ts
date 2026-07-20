import { describe, expect, it } from 'vitest';

import { HttpError, HTTP_ERROR_KIND } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { isAppError } from '@/shared/errors/app-error.helper';

import { runAssessmentsRequest } from './to-assessments-error.helper';

describe('runAssessmentsRequest', () => {
  it('passes a successful result straight through', async () => {
    await expect(runAssessmentsRequest(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });

  it('maps a transport failure to a sanitized AppError', async () => {
    const failure = runAssessmentsRequest((): Promise<never> => {
      throw new HttpError({ kind: HTTP_ERROR_KIND.NotFound, status: 404, message: 'raw backend' });
    });

    const error: unknown = await failure.catch((thrown: unknown) => thrown);
    expect(isAppError(error)).toBe(true);
    expect(isAppError(error) ? error.code : null).toBe(APP_ERROR_CODE.NotFound);
  });

  it('maps an unexpected throw to an unexpected AppError', async () => {
    const failure = runAssessmentsRequest((): Promise<never> => {
      throw new Error('boom');
    });

    const error: unknown = await failure.catch((thrown: unknown) => thrown);
    expect(isAppError(error)).toBe(true);
    expect(isAppError(error) ? error.code : null).toBe(APP_ERROR_CODE.Unexpected);
  });
});

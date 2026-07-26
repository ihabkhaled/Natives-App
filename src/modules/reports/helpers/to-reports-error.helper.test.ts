import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';

import { classifyReportsRefusal, runReportsRequest } from './to-reports-error.helper';

function appError(messageKey: string): AppError {
  return new AppError({ code: APP_ERROR_CODE.Conflict, message: 'x', messageKey });
}

describe('runReportsRequest', () => {
  it('passes a result through', async () => {
    await expect(runReportsRequest(() => Promise.resolve(1))).resolves.toBe(1);
  });

  it('normalizes an HTTP error to an AppError', async () => {
    await expect(
      runReportsRequest(() =>
        Promise.reject(new HttpError({ kind: HTTP_ERROR_KIND.Conflict, status: 409 })),
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('normalizes a non-HTTP failure to an AppError', async () => {
    await expect(runReportsRequest(() => Promise.reject(new Error('boom')))).rejects.toBeInstanceOf(
      AppError,
    );
  });
});

describe('classifyReportsRefusal', () => {
  it('classifies each typed refusal by its backend key', () => {
    expect(classifyReportsRefusal(appError('errors.reports.notReady'))).toBe('notReady');
    expect(classifyReportsRefusal(appError('errors.reports.expired'))).toBe('expired');
    expect(classifyReportsRefusal(appError('errors.reports.retryNotAllowed'))).toBe(
      'retryNotAllowed',
    );
    expect(classifyReportsRefusal(appError('errors.reports.validation'))).toBe('validation');
  });

  it('returns null for an unknown or non-app error', () => {
    expect(classifyReportsRefusal(appError('errors.reports.other'))).toBeNull();
    expect(classifyReportsRefusal(new Error('x'))).toBeNull();
  });
});

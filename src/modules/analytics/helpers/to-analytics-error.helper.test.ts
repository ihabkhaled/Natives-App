import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';

import {
  isAnalyticsForbidden,
  isAnalyticsScopeNotFound,
  runAnalyticsRequest,
} from './to-analytics-error.helper';

function appError(messageKey: string): AppError {
  return new AppError({ code: APP_ERROR_CODE.Forbidden, message: 'x', messageKey });
}

describe('runAnalyticsRequest', () => {
  it('passes a result through', async () => {
    await expect(runAnalyticsRequest(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });

  it('normalizes an HTTP error to an AppError', async () => {
    await expect(
      runAnalyticsRequest(() =>
        Promise.reject(new HttpError({ kind: HTTP_ERROR_KIND.Forbidden, status: 403 })),
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('normalizes a non-HTTP failure to an AppError', async () => {
    await expect(
      runAnalyticsRequest(() => Promise.reject(new Error('boom'))),
    ).rejects.toBeInstanceOf(AppError);
  });
});

describe('isAnalyticsForbidden', () => {
  it('detects the dual-gate 403', () => {
    expect(isAnalyticsForbidden(appError('errors.analytics.forbidden'))).toBe(true);
    expect(isAnalyticsForbidden(appError('errors.analytics.scopeNotFound'))).toBe(false);
    expect(isAnalyticsForbidden(new Error('x'))).toBe(false);
  });
});

describe('isAnalyticsScopeNotFound', () => {
  it('detects the unknown-scope 404', () => {
    expect(isAnalyticsScopeNotFound(appError('errors.analytics.scopeNotFound'))).toBe(true);
    expect(isAnalyticsScopeNotFound(appError('errors.analytics.forbidden'))).toBe(false);
  });
});

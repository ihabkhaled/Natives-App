import { isHttpError } from '@/packages/http';
import { isAppError, toAppError } from '@/shared/errors';
import { mapHttpErrorToAppError } from '@/shared/mappers';

/**
 * Run an analytics gateway request, normalizing any failure into an AppError
 * so both screens surface sanitized, translatable copy rather than a raw
 * backend message.
 */
export async function runAnalyticsRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

/**
 * Whether a refusal is the analytics dual-gate 403: neither a team read nor a
 * self read of one's own membership. Rendered as the designed forbidden
 * state, never a blank chart.
 */
export function isAnalyticsForbidden(error: unknown): boolean {
  return isAppError(error) && error.messageKey === 'errors.analytics.forbidden';
}

/** Whether a refusal is the unknown-scope 404 (foreign or deleted membership). */
export function isAnalyticsScopeNotFound(error: unknown): boolean {
  return isAppError(error) && error.messageKey === 'errors.analytics.scopeNotFound';
}

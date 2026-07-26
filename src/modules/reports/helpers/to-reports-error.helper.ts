import { isHttpError } from '@/packages/http';
import { isAppError, toAppError } from '@/shared/errors';
import { mapHttpErrorToAppError } from '@/shared/mappers';

/**
 * Run a reports gateway request, normalizing any failure into an AppError so
 * the center surfaces sanitized, translatable copy rather than a raw backend
 * message.
 */
export async function runReportsRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

/** The typed refusals the download and retry paths map 1:1 to UI reactions. */
export type ReportsRefusal = 'notReady' | 'expired' | 'retryNotAllowed' | 'validation' | null;

const REFUSAL_BY_MESSAGE_KEY: Readonly<Record<string, Exclude<ReportsRefusal, null>>> = {
  'errors.reports.notReady': 'notReady',
  'errors.reports.expired': 'expired',
  'errors.reports.retryNotAllowed': 'retryNotAllowed',
  'errors.reports.validation': 'validation',
};

/**
 * Classify a refusal by its backend message key: `notReady` means the row
 * changed under us (refetch), `expired` flips the row to its expired state,
 * `retryNotAllowed` explains an already-running retry.
 */
export function classifyReportsRefusal(error: unknown): ReportsRefusal {
  if (!isAppError(error) || error.messageKey === undefined) {
    return null;
  }
  return REFUSAL_BY_MESSAGE_KEY[error.messageKey] ?? null;
}

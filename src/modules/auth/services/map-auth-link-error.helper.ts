import { isHttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

/** Statuses that mean an invitation/reset link is missing, used, or expired. */
const DEAD_LINK_STATUSES: readonly number[] = [404, 409, 410];

/**
 * Convert a failure from a token-scoped link (invitation lookup/accept,
 * password reset) into a sanitized AppError. A missing, already-used, or
 * expired link collapses to a single stable code; every other failure flows
 * through the shared transport mapper so raw backend text never reaches the UI.
 */
export function mapAuthLinkError(error: unknown): AppError {
  if (isHttpError(error)) {
    if (error.status !== undefined && DEAD_LINK_STATUSES.includes(error.status)) {
      return new AppError({ code: APP_ERROR_CODE.LinkInvalidOrExpired, cause: error });
    }
    return mapHttpErrorToAppError(error);
  }
  return toAppError(error);
}

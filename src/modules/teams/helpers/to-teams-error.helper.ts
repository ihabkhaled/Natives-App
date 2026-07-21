import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

/**
 * Run a teams gateway request, normalizing any failure into an AppError so
 * every teams use case surfaces a sanitized, translatable error. Transport
 * failures become mapped HTTP errors; anything else becomes an unexpected
 * AppError.
 */
export async function runTeamsRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

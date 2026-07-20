import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

/**
 * Run an assessments gateway request, normalizing any failure into an AppError
 * so every use case surfaces sanitized, translatable copy — never a raw
 * backend message and never a leaked private note.
 */
export async function runAssessmentsRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

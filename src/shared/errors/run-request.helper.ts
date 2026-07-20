import { isHttpError } from '@/packages/http';

import { toAppError } from './app-error.helper';
import { mapHttpErrorToAppError } from '../mappers';

/**
 * Run one gateway request, normalizing any failure into an AppError so every
 * use case surfaces sanitized, translatable copy — never a raw backend
 * message, a coach note, or a candidate's contact detail.
 */
export async function runRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

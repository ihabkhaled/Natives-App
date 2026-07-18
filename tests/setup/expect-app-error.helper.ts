import { expect } from 'vitest';

import { AppError } from '@/shared/errors/app.errors';

/**
 * Await a promise that is expected to reject with an AppError, assert that it
 * did, and return the typed error so tests can inspect its code and fields.
 */
export async function catchAppError(promise: Promise<unknown>): Promise<AppError> {
  const outcome: unknown = await promise.catch((error: unknown) => error);
  expect(outcome).toBeInstanceOf(AppError);
  return outcome as AppError;
}

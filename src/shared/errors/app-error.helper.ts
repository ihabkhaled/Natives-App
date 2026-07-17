import { APP_ERROR_CODE, type AppErrorCode } from './error-codes.constants';
import { AppError } from './app.errors';

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

export function toAppError(
  value: unknown,
  fallbackCode: AppErrorCode = APP_ERROR_CODE.Unexpected,
): AppError {
  if (isAppError(value)) {
    return value;
  }
  if (value instanceof Error) {
    return new AppError({ code: fallbackCode, message: value.message, cause: value });
  }
  return new AppError({ code: fallbackCode, cause: value });
}

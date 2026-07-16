import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new AppError({ code: APP_ERROR_CODE.Unexpected, message });
  }
}

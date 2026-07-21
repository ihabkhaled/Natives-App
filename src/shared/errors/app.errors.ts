import type { AppErrorCode } from './error-codes.constants';
import type { AppErrorOptions, AppFieldError } from './app-error.types';

/**
 * The only error type allowed to cross layer boundaries toward the UI.
 * The message is developer-facing; user-facing copy is resolved from the
 * code through the i18n error mapper.
 */
export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly requestId: string | undefined;
  public readonly messageKey: string | undefined;
  public readonly fieldErrors: readonly AppFieldError[];

  public constructor(options: AppErrorOptions) {
    super(options.message ?? options.code, { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code;
    this.requestId = options.requestId;
    this.messageKey = options.messageKey;
    this.fieldErrors = options.fieldErrors ?? [];
  }
}

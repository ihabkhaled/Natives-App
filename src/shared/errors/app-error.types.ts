import type { AppErrorCode } from './error-codes.constants';

export interface AppFieldError {
  readonly field: string;
  readonly code: string;
}

export interface AppErrorOptions {
  readonly code: AppErrorCode;
  readonly message?: string;
  readonly requestId?: string | undefined;
  readonly messageKey?: string | undefined;
  readonly fieldErrors?: readonly AppFieldError[] | undefined;
  readonly cause?: unknown;
}

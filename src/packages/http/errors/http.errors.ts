import type { HttpErrorKind } from '../constants/http-error-kind.constants';
import type { HttpFieldError } from '../types/http.types';

export interface HttpErrorOptions {
  readonly kind: HttpErrorKind;
  readonly message?: string;
  readonly status?: number | undefined;
  readonly requestId?: string | undefined;
  readonly fieldErrors?: readonly HttpFieldError[] | undefined;
  readonly cause?: unknown;
}

/**
 * Normalized transport error produced by the HTTP owner. Feature services
 * convert it to an AppError through the shared mapper; it never reaches
 * the UI directly.
 */
export class HttpError extends Error {
  public readonly kind: HttpErrorKind;
  public readonly status: number | undefined;
  public readonly requestId: string | undefined;
  public readonly fieldErrors: readonly HttpFieldError[];

  public constructor(options: HttpErrorOptions) {
    super(options.message ?? options.kind, { cause: options.cause });
    this.name = 'HttpError';
    this.kind = options.kind;
    this.status = options.status;
    this.requestId = options.requestId;
    this.fieldErrors = options.fieldErrors ?? [];
  }
}

export function isHttpError(value: unknown): value is HttpError {
  return value instanceof HttpError;
}

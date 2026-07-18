import { isAxiosError, isCancel } from 'axios';

import { safeParseWithSchema } from '@/packages/schema';

import { HTTP_ERROR_KIND, type HttpErrorKind } from './constants/http-error-kind.constants';
import { HTTP_STATUS } from './constants/http.constants';
import { HttpError, isHttpError } from './errors/http.errors';
import { nestErrorEnvelopeSchema, problemDetailsSchema } from './schemas/api-error.schema';
import type { HttpFieldError } from './types/http.types';

const TIMEOUT_CODES: readonly string[] = ['ECONNABORTED', 'ETIMEDOUT'];

const STATUS_TO_KIND: Readonly<Record<number, HttpErrorKind>> = {
  [HTTP_STATUS.Unauthorized]: HTTP_ERROR_KIND.Unauthorized,
  [HTTP_STATUS.Forbidden]: HTTP_ERROR_KIND.Forbidden,
  [HTTP_STATUS.NotFound]: HTTP_ERROR_KIND.NotFound,
  [HTTP_STATUS.Conflict]: HTTP_ERROR_KIND.Conflict,
  [HTTP_STATUS.TooManyRequests]: HTTP_ERROR_KIND.RateLimited,
  [HTTP_STATUS.BadRequest]: HTTP_ERROR_KIND.Validation,
  [HTTP_STATUS.UnprocessableEntity]: HTTP_ERROR_KIND.Validation,
};

function kindFromStatus(status: number): HttpErrorKind {
  const mapped = STATUS_TO_KIND[status];
  if (mapped !== undefined) {
    return mapped;
  }
  if (status >= HTTP_STATUS.InternalServerError) {
    return HTTP_ERROR_KIND.Server;
  }
  return HTTP_ERROR_KIND.Unexpected;
}

interface ParsedErrorBody {
  readonly requestId: string | undefined;
  readonly fieldErrors: readonly HttpFieldError[];
  readonly detail: string | undefined;
}

function parseErrorBody(body: unknown): ParsedErrorBody {
  const nest = safeParseWithSchema(nestErrorEnvelopeSchema, body);
  if (nest.success) {
    return {
      requestId: nest.data.requestId,
      fieldErrors: (nest.data.errors ?? []).map((entry) => ({
        field: entry.field,
        code: entry.code,
      })),
      detail: nest.data.code,
    };
  }
  const problem = safeParseWithSchema(problemDetailsSchema, body);
  if (problem.success) {
    return { requestId: undefined, fieldErrors: [], detail: problem.data.title };
  }
  return { requestId: undefined, fieldErrors: [], detail: undefined };
}

export function mapResponseToHttpError(status: number, body: unknown, cause?: unknown): HttpError {
  const parsed = parseErrorBody(body);
  return new HttpError({
    kind: kindFromStatus(status),
    message: parsed.detail === undefined ? `HTTP ${status}` : `HTTP ${status} (${parsed.detail})`,
    status,
    requestId: parsed.requestId,
    fieldErrors: parsed.fieldErrors,
    cause,
  });
}

export function mapUnknownToHttpError(error: unknown): HttpError {
  if (isHttpError(error)) {
    return error;
  }
  if (isCancel(error)) {
    return new HttpError({ kind: HTTP_ERROR_KIND.Cancelled, cause: error });
  }
  if (isAxiosError(error)) {
    if (error.code !== undefined && TIMEOUT_CODES.includes(error.code)) {
      return new HttpError({ kind: HTTP_ERROR_KIND.Timeout, cause: error });
    }
    if (error.response === undefined) {
      return new HttpError({ kind: HTTP_ERROR_KIND.Network, cause: error });
    }
    return mapResponseToHttpError(error.response.status, error.response.data, error);
  }
  return new HttpError({ kind: HTTP_ERROR_KIND.Unexpected, cause: error });
}

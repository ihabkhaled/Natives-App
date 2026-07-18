import { HTTP_ERROR_KIND, type HttpError, type HttpErrorKind } from '@/packages/http';
import { APP_ERROR_CODE, type AppErrorCode } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

const HTTP_KIND_TO_APP_CODE: Record<HttpErrorKind, AppErrorCode> = {
  [HTTP_ERROR_KIND.Network]: APP_ERROR_CODE.NetworkOffline,
  [HTTP_ERROR_KIND.Timeout]: APP_ERROR_CODE.Timeout,
  [HTTP_ERROR_KIND.Cancelled]: APP_ERROR_CODE.Unexpected,
  [HTTP_ERROR_KIND.Unauthorized]: APP_ERROR_CODE.Unauthorized,
  [HTTP_ERROR_KIND.Forbidden]: APP_ERROR_CODE.Forbidden,
  [HTTP_ERROR_KIND.NotFound]: APP_ERROR_CODE.NotFound,
  [HTTP_ERROR_KIND.Conflict]: APP_ERROR_CODE.Conflict,
  [HTTP_ERROR_KIND.RateLimited]: APP_ERROR_CODE.RateLimited,
  [HTTP_ERROR_KIND.Validation]: APP_ERROR_CODE.Validation,
  [HTTP_ERROR_KIND.Server]: APP_ERROR_CODE.Server,
  [HTTP_ERROR_KIND.ResponseContract]: APP_ERROR_CODE.Unexpected,
  [HTTP_ERROR_KIND.Unexpected]: APP_ERROR_CODE.Unexpected,
};

export function mapHttpErrorToAppError(error: HttpError): AppError {
  return new AppError({
    code: HTTP_KIND_TO_APP_CODE[error.kind],
    message: error.message,
    requestId: error.requestId,
    fieldErrors: error.fieldErrors,
    cause: error,
  });
}

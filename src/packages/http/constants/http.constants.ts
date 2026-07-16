export const HTTP_HEADER = {
  Authorization: 'Authorization',
  RequestId: 'X-Request-Id',
  ContentType: 'Content-Type',
  Accept: 'Accept',
} as const;

export const BEARER_PREFIX = 'Bearer ';

export const CONTENT_TYPE_JSON = 'application/json';

export const HTTP_STATUS = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  UnprocessableEntity: 422,
  TooManyRequests: 429,
  InternalServerError: 500,
} as const;

export { createTestAdapter, type TestRoute, type TestRouteResponse } from './adapters/test.adapter';
export {
  HTTP_ERROR_KIND,
  type HttpErrorKind,
} from './constants/http-error-kind.constants';
export { HttpError, isHttpError } from './errors/http.errors';
export { createCorrelationId } from './helpers/correlation-id.helper';
export {
  configureAppHttpClient,
  getAppHttpClient,
  resetAppHttpClientForTesting,
} from './http-client.facade';
export { createHttpClient } from './http-client.factory';
export { mapResponseToHttpError, mapUnknownToHttpError } from './http-error.mapper';
export type { HttpClient, HttpClientDependencies, TokenStore } from './interfaces/http.interfaces';
export { TokenRefreshCoordinator } from './token-refresh.coordinator';
export type {
  AuthFailureHandler,
  HttpClientConfig,
  HttpFieldError,
  HttpRequestOptions,
  RefreshExecutor,
  TokenPair,
} from './types/http.types';

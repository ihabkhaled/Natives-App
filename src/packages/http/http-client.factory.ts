import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import type { AppLogger } from '@/packages/logger';

import { BEARER_PREFIX, CONTENT_TYPE_JSON, HTTP_HEADER } from './constants/http.constants';
import { HTTP_ERROR_KIND } from './constants/http-error-kind.constants';
import type { AppRequestFlags } from './helpers/axios-config.helper';
import { createCorrelationId } from './helpers/correlation-id.helper';
import { sanitizeHeadersForLog } from './helpers/http-log.helper';
import { AxiosHttpClient } from './http-client';
import { mapUnknownToHttpError } from './http-error.mapper';
import type { HttpClient, HttpClientDependencies } from './interfaces/http.interfaces';
import { TokenRefreshCoordinator } from './token-refresh.coordinator';

type InFlightConfig = InternalAxiosRequestConfig & AppRequestFlags;

function createRequestInterceptor(deps: HttpClientDependencies) {
  return async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const flags = config as InFlightConfig;
    config.headers.set(HTTP_HEADER.RequestId, createCorrelationId());
    config.headers.set(HTTP_HEADER.Accept, CONTENT_TYPE_JSON);
    if (flags.appSkipAuth !== true) {
      const accessToken = await deps.tokenStore.getAccessToken();
      if (accessToken !== null && accessToken !== '') {
        config.headers.set(HTTP_HEADER.Authorization, `${BEARER_PREFIX}${accessToken}`);
      }
    }
    deps.logger?.debug('http request', {
      method: config.method,
      url: config.url,
      headers: sanitizeHeadersForLog(config.headers.toJSON()),
    });
    return config;
  };
}

function createUnauthorizedRetryHandler(
  instance: AxiosInstance,
  coordinator: TokenRefreshCoordinator | null,
) {
  return async (config: InFlightConfig | undefined): Promise<unknown> => {
    if (coordinator === null || config === undefined) {
      return null;
    }
    if (config.appRetried === true || config.appSkipRetryOnUnauthorized === true) {
      return null;
    }
    const freshToken = await coordinator.getFreshAccessToken();
    if (freshToken === null) {
      return null;
    }
    config.appRetried = true;
    config.headers.set(HTTP_HEADER.Authorization, `${BEARER_PREFIX}${freshToken}`);
    return instance.request(config);
  };
}

function createErrorInterceptor(
  instance: AxiosInstance,
  deps: HttpClientDependencies,
  coordinator: TokenRefreshCoordinator | null,
) {
  const retryOnUnauthorized = createUnauthorizedRetryHandler(instance, coordinator);
  return async (error: unknown): Promise<unknown> => {
    const mapped = mapUnknownToHttpError(error);
    if (mapped.kind === HTTP_ERROR_KIND.Unauthorized) {
      const config = (error as { config?: InFlightConfig }).config;
      const replayed = await retryOnUnauthorized(config);
      if (replayed !== null) {
        return replayed;
      }
      if (config?.appRetried === true) {
        await deps.onAuthFailure?.();
      }
    }
    logMappedError(deps.logger, mapped.kind, mapped.status);
    throw mapped;
  };
}

function logMappedError(
  logger: AppLogger | undefined,
  kind: string,
  status: number | undefined,
): void {
  if (kind === HTTP_ERROR_KIND.Cancelled) {
    return;
  }
  logger?.warn('http request failed', { kind, status });
}

export function createHttpClient(deps: HttpClientDependencies): HttpClient {
  const instance = axios.create({
    baseURL: deps.config.baseUrl,
    timeout: deps.config.timeoutMs,
    withCredentials: deps.config.withCredentials ?? false,
    headers: { [HTTP_HEADER.ContentType]: CONTENT_TYPE_JSON },
  });
  if (deps.adapter !== undefined) {
    instance.defaults.adapter = deps.adapter;
  }
  const coordinator =
    deps.refreshExecutor === undefined
      ? null
      : new TokenRefreshCoordinator({
          tokenStore: deps.tokenStore,
          refreshExecutor: deps.refreshExecutor,
          onAuthFailure: deps.onAuthFailure,
        });
  instance.interceptors.request.use(createRequestInterceptor(deps));
  instance.interceptors.response.use(
    (response) => response,
    createErrorInterceptor(instance, deps, coordinator),
  );
  return new AxiosHttpClient(instance);
}

import type { AxiosRequestConfig } from 'axios';

import type { HttpRequestOptions } from '../types/http.types';

export interface AppRequestFlags {
  appSkipAuth?: boolean;
  appSkipRetryOnUnauthorized?: boolean;
  appRetried?: boolean;
}

export type AppAxiosRequestConfig = AxiosRequestConfig & AppRequestFlags;

export function toAxiosRequestConfig(options: HttpRequestOptions = {}): AppAxiosRequestConfig {
  const config: AppAxiosRequestConfig = {};
  if (options.signal !== undefined) {
    config.signal = options.signal;
  }
  if (options.headers !== undefined) {
    config.headers = { ...options.headers };
  }
  if (options.params !== undefined) {
    config.params = { ...options.params };
  }
  if (options.timeoutMs !== undefined) {
    config.timeout = options.timeoutMs;
  }
  if (options.skipAuth === true) {
    config.appSkipAuth = true;
  }
  if (options.skipRetryOnUnauthorized === true) {
    config.appSkipRetryOnUnauthorized = true;
  }
  return config;
}

import type { AxiosAdapter } from 'axios';

import type { AppLogger } from '@/packages/logger';
import type { AppSchema } from '@/packages/schema';

import type {
  AuthFailureHandler,
  HttpClientConfig,
  HttpRequestOptions,
  RefreshExecutor,
  TokenPair,
} from '../types/http.types';

export interface HttpClient {
  readonly get: <T>(
    path: string,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ) => Promise<T>;
  readonly post: <T>(
    path: string,
    body: unknown,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ) => Promise<T>;
  readonly put: <T>(
    path: string,
    body: unknown,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ) => Promise<T>;
  readonly patch: <T>(
    path: string,
    body: unknown,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ) => Promise<T>;
  readonly delete: (path: string, options?: HttpRequestOptions) => Promise<void>;
  readonly postMultipart: <T>(
    path: string,
    form: FormData,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ) => Promise<T>;
  readonly download: (path: string, options?: HttpRequestOptions) => Promise<Blob>;
}

export interface TokenStore {
  readonly getAccessToken: () => Promise<string | null>;
  readonly getRefreshToken: () => Promise<string | null>;
  readonly setTokens: (tokens: TokenPair) => Promise<void>;
  readonly clearTokens: () => Promise<void>;
}

export interface HttpClientDependencies {
  readonly config: HttpClientConfig;
  readonly tokenStore: TokenStore;
  readonly refreshExecutor?: RefreshExecutor;
  readonly onAuthFailure?: AuthFailureHandler;
  readonly logger?: AppLogger;
  /** Test seam: inject a canned-response adapter instead of the network. */
  readonly adapter?: AxiosAdapter;
}

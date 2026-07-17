export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface HttpRequestOptions {
  readonly signal?: AbortSignal;
  readonly headers?: Readonly<Record<string, string>>;
  readonly params?: Readonly<Record<string, string | number | boolean>>;
  readonly timeoutMs?: number;
  /** Skip bearer-token injection (login, refresh, public endpoints). */
  readonly skipAuth?: boolean;
  /** Skip the automatic refresh-and-replay on 401 (refresh endpoint itself). */
  readonly skipRetryOnUnauthorized?: boolean;
}

export type RefreshExecutor = (refreshToken: string) => Promise<TokenPair>;

export type AuthFailureHandler = () => void | Promise<void>;

export interface HttpClientConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly withCredentials?: boolean;
}

export interface HttpFieldError {
  readonly field: string;
  readonly code: string;
}

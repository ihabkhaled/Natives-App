import type { TokenStore } from './interfaces/http.interfaces';
import type { AuthFailureHandler, RefreshExecutor } from './types/http.types';

export interface TokenRefreshCoordinatorOptions {
  readonly tokenStore: TokenStore;
  readonly refreshExecutor: RefreshExecutor;
  readonly onAuthFailure?: AuthFailureHandler | undefined;
}

/**
 * Single-flight token refresh. Concurrent 401 responses all await the same
 * refresh promise, then replay with the fresh access token. A failed or
 * impossible refresh clears tokens and notifies the auth-failure handler
 * exactly once per flight.
 */
export class TokenRefreshCoordinator {
  readonly #options: TokenRefreshCoordinatorOptions;
  #inFlight: Promise<string | null> | null = null;

  public constructor(options: TokenRefreshCoordinatorOptions) {
    this.#options = options;
  }

  public async getFreshAccessToken(): Promise<string | null> {
    this.#inFlight ??= this.#refresh().finally(() => {
      this.#inFlight = null;
    });
    return this.#inFlight;
  }

  async #refresh(): Promise<string | null> {
    const refreshToken = await this.#options.tokenStore.getRefreshToken();
    if (refreshToken === null || refreshToken === '') {
      await this.#handleFailure();
      return null;
    }
    try {
      const pair = await this.#options.refreshExecutor(refreshToken);
      await this.#options.tokenStore.setTokens(pair);
      return pair.accessToken;
    } catch {
      await this.#handleFailure();
      return null;
    }
  }

  async #handleFailure(): Promise<void> {
    await this.#options.tokenStore.clearTokens();
    await this.#options.onAuthFailure?.();
  }
}

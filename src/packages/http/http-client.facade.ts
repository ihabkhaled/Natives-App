import type { HttpClient } from './interfaces/http.interfaces';

let appHttpClient: HttpClient | null = null;

/**
 * Composition seam: the app startup wires the configured client (with the
 * auth module's token store and refresh gateway) exactly once. Feature
 * gateways resolve it lazily per request.
 */
export function configureAppHttpClient(client: HttpClient): void {
  appHttpClient = client;
}

export function getAppHttpClient(): HttpClient {
  if (appHttpClient === null) {
    throw new Error('HTTP client is not configured. Call configureAppHttpClient at startup.');
  }
  return appHttpClient;
}

export function resetAppHttpClientForTesting(): void {
  appHttpClient = null;
}
